import { NextRequest, NextResponse } from "next/server";
import { generateCrushMessage } from "@/lib/genai";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { crushHandle, senderWhatsApp } = await request.json();

    if (!crushHandle || !senderWhatsApp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
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

    // Store in Supabase
    const { error } = await supabase.from("requests").insert({
      id: linkId,
      sender_whatsapp: senderWhatsApp,
      crush_x_handle: cleanHandle,
      ai_message: aiMessage,
      status: "pending",
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

    return NextResponse.json({
      linkId,
      aiMessage,
      crushHandle: cleanHandle,
    });
  } catch (err) {
    console.error("Generate API error:", err);
    // Fallback for demo mode
    const linkId = uuidv4().slice(0, 8);
    const fallbackMessage = "Hey, the algorithm says we'd be a perfect match. Will you say yes? 💘";
    return NextResponse.json({
      linkId,
      aiMessage: fallbackMessage,
      crushHandle: "crush",
      demo: true,
    });
  }
}
