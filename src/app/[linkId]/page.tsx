"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ComicButton } from "@/components/ui/ComicButton";
import { RunawayButton } from "@/components/ui/RunawayButton";
import { PaywallModal } from "@/components/PaywallModal";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { FloatingHearts } from "@/components/FloatingHearts";
import { springIn, slideUp, heartbeat } from "@/lib/animations";
import type { CrushRequest } from "@/lib/supabase";

type ViewState = "loading" | "reveal" | "accepted" | "rejected" | "error";

export default function CrushPage() {
    const params = useParams();
    const linkId = params.linkId as string;

    const [state, setState] = useState<ViewState>("loading");
    const [request, setRequest] = useState<CrushRequest | null>(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [acceptanceMessage, setAcceptanceMessage] = useState("");

    useEffect(() => {
        async function fetchRequest() {
            try {
                const res = await fetch(`/api/request/${linkId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRequest(data);
                    setState(data.status === "pending" ? "reveal" : data.status === "accepted" ? "accepted" : "rejected");
                } else {
                    setState("error");
                }
            } catch {
                setState("error");
            }
        }
        fetchRequest();
    }, [linkId]);

    const handleYes = async () => {
        setShowCelebration(true);
        setState("accepted");

        // Update status
        await fetch("/api/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId, status: "accepted" }),
        });

        // Fetch dynamic acceptance message for WhatsApp DM
        try {
            const res = await fetch("/api/acceptance-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ crushHandle: request?.crush_x_handle || "" }),
            });
            const data = await res.json();
            setAcceptanceMessage(data.message);
        } catch {
            setAcceptanceMessage("I just said YES! 💘 Let's make this Valentine's unforgettable!");
        }

        // Vibrate on mobile
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 200]);
        }
    };

    const handleNoCaught = useCallback(() => {
        setShowPaywall(true);
    }, []);

    const handlePaymentComplete = (txHash: string) => {
        setShowPaywall(false);
        setState("rejected");
        console.log("Payment TX:", txHash);
    };

    const shareAcceptanceOnX = () => {
        const text = encodeURIComponent(
            `I just said YES to @${request?.crush_x_handle || "someone"} 💘🎉 #CrushConfessor`
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    };

    const openWhatsApp = () => {
        if (!request?.sender_whatsapp) return;
        const phone = request.sender_whatsapp.replace(/[^0-9]/g, "");
        const msg = encodeURIComponent(
            acceptanceMessage || "I just said YES! 💘 Let's make this Valentine's unforgettable!"
        );
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    return (
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 relative w-full">
            <FloatingHearts />
            <CelebrationOverlay show={showCelebration} />

            <div className="w-full max-w-lg z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-4 sm:mb-8"
                    variants={springIn}
                    initial="hidden"
                    animate="visible"
                >
                    <h1
                        className="text-3xl sm:text-6xl mb-1 sm:mb-2 text-stroke"
                        style={{
                            fontFamily: "Bangers, cursive",
                            color: "var(--hot-pink)",
                            textShadow: "3px 3px 0 #000",
                        }}
                    >
                        {request?.crush_x_handle ? (
                            <>
                                <span
                                    className="block mb-1 sm:mb-2 text-2xl sm:text-5xl text-stroke"
                                    style={{
                                        color: "var(--electric-yellow)",
                                        textShadow: "3px 3px 0 #000",
                                        fontFamily: "Bangers, cursive",
                                        transform: "rotate(-2deg)",
                                        display: "inline-block"
                                    }}
                                >
                                    @{request.crush_x_handle}
                                </span>
                                <br />
                                YOU&apos;VE GOT A CRUSH! 💘
                            </>
                        ) : (
                            "YOU'VE GOT A CRUSH! 💘"
                        )}
                    </h1>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Loading */}
                    {state === "loading" && (
                        <motion.div
                            key="loading"
                            className="comic-panel p-4 sm:p-8 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="text-5xl mb-4 inline-block"
                            >
                                💌
                            </motion.div>
                            <p style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}>
                                Opening your love letter...
                            </p>
                        </motion.div>
                    )}

                    {/* The Reveal */}
                    {state === "reveal" && request && (
                        <motion.div
                            key="reveal"
                            className="comic-panel p-6 sm:p-8"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {/* Avatar */}
                            <motion.div
                                className="flex justify-center mb-6"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <div
                                    className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center text-5xl"
                                    style={{ background: "var(--electric-yellow)" }}
                                >
                                    😍
                                </div>
                            </motion.div>

                            {/* AI Message */}
                            <motion.div
                                className="speech-bubble mb-8"
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-lg">{request.ai_message}</p>
                            </motion.div>

                            {/* Countdown (cosmetic) */}
                            <motion.p
                                className="text-center text-xs text-gray-400 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                style={{ fontFamily: "Inter, sans-serif" }}
                            >
                                ⏰ This link expires in 24 hours
                            </motion.p>

                            {/* Decision Buttons */}
                            <div className="relative">
                                <motion.div
                                    className="flex justify-center mb-4"
                                    {...heartbeat}
                                >
                                    <ComicButton
                                        variant="pink"
                                        onClick={handleYes}
                                        size="lg"
                                        className="w-full starburst"
                                    >
                                        💖 YES! I&apos;M IN!
                                    </ComicButton>
                                </motion.div>

                                {/* The Runaway NO Button */}
                                <RunawayButton onCaught={handleNoCaught} maxEscapes={5} />
                            </div>

                            {/* Social proof */}
                            <motion.p
                                className="text-center text-sm text-gray-500 mt-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                style={{ fontFamily: "Comic Neue, cursive" }}
                            >
                                92% of people say YES. Just saying... 👀
                            </motion.p>
                        </motion.div>
                    )}

                    {/* Accepted */}
                    {state === "accepted" && (
                        <motion.div
                            key="accepted"
                            className="comic-panel p-6 sm:p-8 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <motion.div
                                className="text-7xl mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                🎉
                            </motion.div>

                            <h2
                                className="text-3xl mb-2"
                                style={{
                                    fontFamily: "Bangers, cursive",
                                    color: "var(--hot-pink)",
                                }}
                            >
                                IT&apos;S A MATCH!
                            </h2>

                            <p
                                className="text-gray-600 mb-6"
                                style={{ fontFamily: "Comic Neue, cursive", fontWeight: 700 }}
                            >
                                Love wins today! 💘 Now go make magic happen ✨
                            </p>

                            <div className="space-y-3">
                                <ComicButton
                                    variant="dark"
                                    onClick={shareAcceptanceOnX}
                                    className="w-full"
                                >
                                    𝕏 BRAG ON X!
                                </ComicButton>

                                <ComicButton
                                    variant="pink"
                                    onClick={openWhatsApp}
                                    className="w-full"
                                >
                                    📱 SLIDE INTO DMs
                                </ComicButton>
                            </div>
                        </motion.div>
                    )}

                    {/* Rejected */}
                    {state === "rejected" && (
                        <motion.div
                            key="rejected"
                            className="comic-panel p-8 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-6xl mb-4">😢</div>
                            <h2
                                className="text-2xl mb-2"
                                style={{ fontFamily: "Bangers, cursive" }}
                            >
                                REJECTION RECORDED
                            </h2>
                            <p
                                className="text-gray-600"
                                style={{ fontFamily: "Comic Neue, cursive" }}
                            >
                                At least it cost you $2. Hope it was worth it. 💸
                            </p>
                        </motion.div>
                    )}

                    {/* Error */}
                    {state === "error" && (
                        <motion.div
                            key="error"
                            className="comic-panel p-8 text-center"
                            variants={springIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            <div className="text-6xl mb-4">🤔</div>
                            <h2
                                className="text-2xl mb-2"
                                style={{ fontFamily: "Bangers, cursive" }}
                            >
                                LINK NOT FOUND
                            </h2>
                            <p
                                className="text-gray-600"
                                style={{ fontFamily: "Comic Neue, cursive" }}
                            >
                                This crush link doesn&apos;t exist or has expired.
                            </p>
                            <ComicButton
                                variant="pink"
                                onClick={() => (window.location.href = "/")}
                                className="mt-4"
                            >
                                CREATE YOUR OWN 💘
                            </ComicButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                onPaymentComplete={handlePaymentComplete}
                linkId={linkId}
            />
        </div>
    );
}
