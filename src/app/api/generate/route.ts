import { NextRequest, NextResponse } from "next/server";
import { generateCrushMessage } from "@/lib/genai";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import {
  getValidAccessToken,
  postTweet,
} from "@/lib/twitter-auth";

export async function POST(request: NextRequest) {
  try {
    const { crushHandle, senderWhatsApp } = await request.json();

    if (!crushHandle || !senderWhatsApp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get authenticated user from session
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("rizz_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in with X first." },
        { status: 401 }
      );
    }

    // Fetch user from database (with tokens)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 401 }
      );
    }

    // Clean the crush handle (remove @ if present)
    const cleanHandle = crushHandle.replace(/^@/, "");

    // Generate AI message
    let aiMessage;
    try {
      aiMessage = await generateCrushMessage(cleanHandle);
    } catch (err: any) {
      if (err.message === "RATE_LIMIT") {
        return NextResponse.json(
          { error: "Too many requests. Please wait a minute! 🌶️" },
          { status: 429 }
        );
      }
      throw err;
    }

    // Generate unique link ID
    const linkId = uuidv4().slice(0, 8);

    // Store in Supabase (with sender_user_id)
    const { error } = await supabase.from("requests").insert({
      id: linkId,
      sender_whatsapp: senderWhatsApp,
      crush_x_handle: cleanHandle,
      ai_message: aiMessage,
      status: "pending",
      sender_user_id: user.id,
    });

    if (error) {
      console.error("Supabase error:", error);
      // If Supabase is not configured, still return the data (demo mode)
      return NextResponse.json({
        linkId,
        aiMessage,
        crushHandle: cleanHandle,
        demo: true,
      });
    }

    // ─── Auto-post tweet ─────────────────────────────────
    let tweetId: string | null = null;
    try {
      // Get a valid access token (refreshing if needed)
      const { accessToken, refreshed, newTokens } =
        await getValidAccessToken(user);

      // If tokens were refreshed, update in database
      if (refreshed && newTokens) {
        await supabase
          .from("users")
          .update({
            x_access_token: newTokens.access_token,
            x_refresh_token: newTokens.refresh_token,
            token_expires_at: new Date(
              Date.now() + newTokens.expires_in * 1000
            ).toISOString(),
          })
          .eq("id", user.id);
      }

      // Build the tweet text
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const shareUrl = `${baseUrl}/${linkId}`;
      const tweetText = `@${cleanHandle} ${aiMessage}\n\n💘 Will you say yes? 👉 ${shareUrl}`;

      // Post the tweet!
      const result = await postTweet(accessToken, tweetText);
      tweetId = result.id;
      console.log("Auto-posted tweet:", tweetId);
    } catch (tweetErr) {
      // Auto-posting is best-effort — don't fail the whole request
      console.error("Auto-post tweet failed:", tweetErr);
    }

    return NextResponse.json({
      linkId,
      aiMessage,
      crushHandle: cleanHandle,
      tweetId,
      autoPosted: !!tweetId,
    });
  } catch (err) {
    console.error("Generate API error:", err);
    // Fallback for demo mode
    const linkId = uuidv4().slice(0, 8);
    const fallbackMessage =
      "Hey, the algorithm says we'd be a perfect match. Will you say yes? 💘";
    return NextResponse.json({
      linkId,
      aiMessage: fallbackMessage,
      crushHandle: "crush",
      demo: true,
    });
  }
}
