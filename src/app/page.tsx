"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComicButton } from "@/components/ui/ComicButton";
import { ComicInput } from "@/components/ui/ComicInput";
import { ComicProgress } from "@/components/ui/ComicProgress";
import { FloatingHearts } from "@/components/FloatingHearts";
import { springIn, slideUp, staggerContainer } from "@/lib/animations";

type Step = "input" | "generating" | "share";

export default function HomePage() {
  const [step, setStep] = useState<Step>("input");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [crushHandle, setCrushHandle] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [linkId, setLinkId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const stepIndex = step === "input" ? 0 : step === "generating" ? 1 : 2;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!crushHandle.trim()) errs.crushHandle = "Who's the lucky one?";
    if (!whatsApp.trim()) errs.whatsApp = "How will they reach you?";
    else if (!/^\+?\d{7,15}$/.test(whatsApp.replace(/\s/g, "")))
      errs.whatsApp = "Enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("generating");
    await generateMessage();
  };

  const generateMessage = async () => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crushHandle: crushHandle.replace(/^@/, ""),
          senderWhatsApp: whatsApp,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await res.json();
      setAiMessage(data.aiMessage);
      setLinkId(data.linkId);
      setStep("share");
    } catch (err: any) {
      setErrors({ form: err.message || "Something went wrong. Try again!" });
      if (step === "generating") setStep("input");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await generateMessage();
  };

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${linkId}`;
    }
    return `/${linkId}`;
  };

  const shareOnX = () => {
    const text = encodeURIComponent(
      `${aiMessage}\n\n💘 Will you say yes? 👉 ${getShareUrl()}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Someone has a crush on you! 💘 Open this link to find out: ${getShareUrl()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <FloatingHearts />

      <div className="w-full max-w-lg z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          variants={springIn}
          initial="hidden"
          animate="visible"
        >
          <h1
            className="text-5xl sm:text-7xl mb-2 text-stroke"
            style={{
              fontFamily: "Bangers, cursive",
              color: "var(--hot-pink)",
              textShadow: "3px 3px 0 #000",
            }}
          >
            CRUSH CONFESSOR
          </h1>
          <p
            className="text-lg sm:text-xl"
            style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
          >
            Your digital wingman 💘 Shoot your shot!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-6"
          variants={slideUp}
          initial="hidden"
          animate="visible"
        >
          <ComicProgress
            currentStep={stepIndex}
            totalSteps={3}
            labels={["Details", "AI Magic", "Share!"]}
          />
        </motion.div>

        {/* Main Panel */}
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === "input" && (
            <motion.div
              key="input"
              className="comic-panel p-6 sm:p-8"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div variants={slideUp} className="mb-6">
                  <h2
                    className="text-2xl mb-1"
                    style={{ fontFamily: "Bangers, cursive" }}
                  >
                    👀 WHO&apos;S THE LUCKY ONE?
                  </h2>
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    We&apos;ll craft the perfect message for you
                  </p>
                </motion.div>

                <motion.div variants={slideUp} className="mb-4">
                  <ComicInput
                    label="Their X (Twitter) Username"
                    icon="🐦"
                    placeholder="@crush_handle"
                    value={crushHandle}
                    onChange={(e) => setCrushHandle(e.target.value)}
                    error={errors.crushHandle}
                  />
                </motion.div>

                <motion.div variants={slideUp} className="mb-6">
                  <ComicInput
                    label="Your WhatsApp Number"
                    icon="📱"
                    placeholder="+234 XXX XXX XXXX"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    error={errors.whatsApp}
                  />
                </motion.div>

                {errors.form && (
                  <p className="text-red-600 text-sm mb-4 font-bold text-center">
                    ⚠️ {errors.form}
                  </p>
                )}

                <motion.div variants={slideUp}>
                  <ComicButton
                    variant="pink"
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                  >
                    💘 SHOOT YOUR SHOT!
                  </ComicButton>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Generating */}
          {step === "generating" && (
            <motion.div
              key="generating"
              className="comic-panel p-8 text-center"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                💘
              </motion.div>
              <h2
                className="text-2xl mb-2"
                style={{ fontFamily: "Bangers, cursive" }}
              >
                CRAFTING THE PERFECT LINE...
              </h2>
              <p
                className="text-gray-600"
                style={{ fontFamily: "Comic Neue, cursive" }}
              >
                Our AI wingman is cooking up something special 🍳
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setStep("input")}
                  className="text-sm underline text-gray-500 hover:text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Wait, go back!
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Share */}
          {step === "share" && (
            <motion.div
              key="share"
              className="comic-panel p-6 sm:p-8"
              variants={springIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <h2
                className="text-2xl mb-4 text-center"
                style={{ fontFamily: "Bangers, cursive" }}
              >
                🎉 YOUR LINK IS READY!
              </h2>

              {/* AI Message Preview */}
              <div className="relative">
                <div className="speech-bubble mb-8 pr-12">
                  <p>{isRegenerating ? "Cooking up a new line... 🍳" : aiMessage}</p>
                </div>
                {!isRegenerating && (
                  <button
                    onClick={handleRegenerate}
                    className="absolute -top-2 -right-2 bg-yellow-400 border-2 border-black p-2 rounded-full hover:scale-110 transition-transform shadow-[3px_3px_0_#000]"
                    title="Generate new Rizz"
                  >
                    🔄
                  </button>
                )}
              </div>

              {/* Link Display */}
              <div className="bg-gray-100 border-2 border-black p-3 mb-6 flex items-center gap-2">
                <span
                  className="flex-1 text-sm truncate font-mono"
                  style={{ fontFamily: "monospace" }}
                >
                  {getShareUrl()}
                </span>
                <button
                  onClick={copyLink}
                  className="text-sm font-bold px-3 py-1 border-2 border-black bg-yellow-300 hover:bg-yellow-400 whitespace-nowrap"
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <ComicButton
                  variant="dark"
                  onClick={shareOnX}
                  className="w-full"
                >
                  🐦 SHARE ON X (Twitter)
                </ComicButton>

                <ComicButton
                  variant="pink"
                  onClick={shareOnWhatsApp}
                  className="w-full"
                >
                  📱 SHARE ON WHATSAPP
                </ComicButton>

                <ComicButton
                  variant="yellow"
                  onClick={copyLink}
                  className="w-full"
                >
                  🔗 {copied ? "LINK COPIED!" : "COPY LINK"}
                </ComicButton>
              </div>

              {/* Social Proof */}
              <motion.p
                className="text-center text-sm text-gray-500 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{ fontFamily: "Comic Neue, cursive" }}
              >
                💘 47 people have already confessed today. Your turn!
              </motion.p>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setStep("input")}
                  className="text-sm underline text-gray-500 hover:text-gray-800"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  ✏️ Edit / Try Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          className="text-center text-xs mt-6 opacity-60"
          style={{ fontFamily: "Inter, sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5 }}
        >
          Made with 💘 and a little bit of mischief
        </motion.p>
      </div>
    </main>
  );
}
