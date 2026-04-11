"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, type ChangeEvent } from "react";

import CameraErrorState from "@/components/camera/CameraErrorState";
import CameraEyebrow from "@/components/camera/CameraEyebrow";
import CameraFeedback from "@/components/camera/CameraFeedback";
import CameraViewport from "@/components/camera/CameraViewport";
import CaptureFlash from "@/components/camera/CaptureFlash";
import MethodChoice from "@/components/camera/MethodChoice";
import UploadPreview from "@/components/camera/UploadPreview";
import PageLoading from "@/components/ui/PageLoading";
import StateSwitcher from "@/components/ui/StateSwitcher";
import useCameraPipeline from "@/hooks/useCameraPipeline";
import { CAM_EYEBROW, CAM_FEEDBACK, CAM_STATES, isErrorState, type CamState } from "@/types/camera";

function CameraPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = search?.get("state") as CamState | null;
  const [state, setState] = useState<CamState>(forced ?? "method_choice");
  const [showUpload, setShowUpload] = useState(false);

  // Guard: sem nome no sessionStorage, volta pro /ler/nome
  useEffect(() => {
    if (!sessionStorage.getItem("maosfalam_name_fresh")) {
      router.replace("/ler/nome");
    }
  }, [router]);

  if (forced && forced !== state) {
    setState(forced);
  }

  const handleCaptured = useCallback(
    (photoBase64: string) => {
      sessionStorage.setItem("maosfalam_photo", photoBase64);
      router.push("/ler/scan");
    },
    [router],
  );

  useCameraPipeline({
    state,
    forced: Boolean(forced),
    setState,
    onCaptured: handleCaptured,
  });

  const handleUploadSelected = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files?.length) return;
      const file = event.target.files[0];
      if (!file) return;
      setState("camera_capturing");
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.(120);
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1] ?? "";
        sessionStorage.setItem("maosfalam_photo", base64);
        window.setTimeout(() => router.push("/ler/scan"), 600);
      };
      reader.readAsDataURL(file);
    },
    [router],
  );

  const errorState = isErrorState(state);
  const showViewport = !errorState && state !== "method_choice";
  const showTitle = !errorState && state !== "method_choice";

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden">
      <CaptureFlash active={state === "camera_capturing"} />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(201,162,74,0.06), transparent 75%)",
        }}
      />

      <CameraEyebrow label={CAM_EYEBROW[state]} />

      <AnimatePresence mode="wait">
        {showTitle && (
          <motion.p
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6 }}
            className="relative font-cormorant italic text-[24px] sm:text-[28px] text-bone text-center max-w-sm leading-[1.3]"
          >
            {CAM_FEEDBACK[state]}
          </motion.p>
        )}
        {state === "method_choice" && (
          <motion.div
            key="method_choice_title"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-center max-w-md"
          >
            <h1 className="font-cinzel text-[24px] sm:text-[28px] text-bone leading-tight mb-2">
              Me mostra sua mão.
            </h1>
            <p className="font-cormorant italic text-[17px] sm:text-[19px] text-bone-dim leading-[1.35]">
              Tem dois jeitos. Você escolhe.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "method_choice" && !showUpload && (
        <MethodChoice
          onPickLive={() => setState("loading_mediapipe")}
          onPickUpload={() => setShowUpload(true)}
        />
      )}

      {showUpload && (
        <UploadPreview
          onConfirm={(file: File) => {
            setState("camera_capturing");
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              navigator.vibrate?.(120);
            }
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              const base64 = dataUrl.split(",")[1] ?? "";
              sessionStorage.setItem("maosfalam_photo", base64);
              window.setTimeout(() => router.push("/ler/scan"), 600);
            };
            reader.readAsDataURL(file);
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {showViewport && <CameraViewport state={state} />}

      {!errorState && state !== "camera_capturing" && (
        <div className="relative">
          <CameraFeedback text="" />
        </div>
      )}

      {errorState && (
        <CameraErrorState
          state={state}
          onRetry={() => router.replace("/ler/camera")}
          onUploadSelected={handleUploadSelected}
        />
      )}

      <StateSwitcher states={CAM_STATES} current={state} />
    </main>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CameraPageInner />
    </Suspense>
  );
}
