"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import CameraErrorState from "@/components/camera/CameraErrorState";
import CameraEyebrow from "@/components/camera/CameraEyebrow";
import CameraFeedback from "@/components/camera/CameraFeedback";
import CameraViewport from "@/components/camera/CameraViewport";
import CaptureFlash from "@/components/camera/CaptureFlash";
import HandInstructionOverlay from "@/components/camera/HandInstructionOverlay";
import LandscapeWarning from "@/components/camera/LandscapeWarning";
import MethodChoice from "@/components/camera/MethodChoice";
import UploadConfirmScreen from "@/components/camera/UploadConfirmScreen";
import UploadInstructionScreen from "@/components/camera/UploadInstructionScreen";
import UploadValidationScreen from "@/components/camera/UploadValidationScreen";
import WrongHandFeedback from "@/components/camera/WrongHandFeedback";
import PageLoading from "@/components/ui/PageLoading";
import StateSwitcher from "@/components/ui/StateSwitcher";
import useCameraPipeline from "@/hooks/useCameraPipeline";
import { useFailureCounter } from "@/hooks/useFailureCounter";
import { useLandscapeGuard } from "@/hooks/useLandscapeGuard";
import { useUploadValidation } from "@/hooks/useUploadValidation";
import { loadReadingContext } from "@/lib/reading-context";
import { CAM_EYEBROW, CAM_FEEDBACK, CAM_STATES, isErrorState, type CamState } from "@/types/camera";

function CameraPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const forced = search?.get("state") as CamState | null;
  const [state, setState] = useState<CamState>(forced ?? "method_choice");
  const [showUpload, setShowUpload] = useState(false);
  type UploadStep = "instruction" | "validating" | "confirm";
  const [uploadStep, setUploadStep] = useState<UploadStep>("instruction");
  const [mirrored, setMirrored] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraKey, setCameraKey] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const isLandscape = useLandscapeGuard();

  const { suggestMethodSwitch, recordFailure, resetFailures } = useFailureCounter();

  // Load reading context via useSyncExternalStore (hydration-safe, no setState in effect)
  const readingContext = useSyncExternalStore(
    () => () => {},
    () => loadReadingContext(),
    () => null,
  );
  const dominantHand = readingContext?.dominant_hand ?? "right";
  const targetName = readingContext?.target_name ?? "";
  const isSelf = readingContext?.is_self ?? true;
  const targetGender = readingContext?.target_gender ?? "female";

  const {
    result: uploadResult,
    validate: validateFile,
    reset: resetUpload,
  } = useUploadValidation(dominantHand);

  // Guard: sem nome no sessionStorage, volta pro /ler/nome
  useEffect(() => {
    if (!sessionStorage.getItem("maosfalam_name_fresh")) {
      router.replace("/ler/nome");
    }
  }, [router]);

  if (forced && forced !== state) {
    setState(forced);
  }

  // Permission denied → auto-redirect to upload after brief pause
  useEffect(() => {
    if (state === "camera_permission_denied" || state === "camera_permission_denied_permanent") {
      const timer = setTimeout(() => {
        setState("method_choice");
        resetUpload();
        setUploadStep("instruction");
        setShowUpload(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, resetUpload]);

  // Record failure when camera enters error state
  useEffect(() => {
    if (state === "camera_error_generic") {
      recordFailure();
    }
  }, [state, recordFailure]);

  const handleCaptured = useCallback(
    (photoBase64: string) => {
      resetFailures();
      sessionStorage.setItem("maosfalam_photo", photoBase64);
      router.push("/ler/scan");
    },
    [router, resetFailures],
  );

  useCameraPipeline({
    state,
    forced: Boolean(forced),
    setState,
    onCaptured: handleCaptured,
    videoRef,
    canvasRef,
    onMirroredChange: setMirrored,
    preferredFacing: facingMode,
    cameraKey,
  });

  const handleUploadFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadStep("validating");
      await validateFile(file);
      setUploadStep("confirm");
    },
    [validateFile],
  );

  const handleUploadConfirm = useCallback(() => {
    if (!uploadResult.file) return;
    resetFailures();
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
    reader.readAsDataURL(uploadResult.file);
  }, [uploadResult.file, router, resetFailures]);

  const handleUploadBack = useCallback(() => {
    resetUpload();
    setUploadStep("instruction");
    setShowUpload(false);
  }, [resetUpload]);

  const handleUploadRetry = useCallback(() => {
    recordFailure();
    resetUpload();
    setUploadStep("instruction");
    // Reseta o input file para permitir re-selecao do mesmo arquivo
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  }, [resetUpload, recordFailure]);

  const handleSwitchCamera = useCallback(() => {
    // Stop current stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setCameraKey((prev) => prev + 1);
    setState("loading_mediapipe");
  }, []);

  const handleUploadSelectedFromError = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
  const showViewport = !errorState && state !== "method_choice" && state !== "hand_instruction";
  const showTitle = !errorState && state !== "method_choice" && state !== "hand_instruction";

  // Method switch suggestion message depends on which flow the user is in
  const methodSwitchText = showUpload
    ? "Tente agora pela camera. Ao vivo fica mais facil."
    : "Tente agora na galeria. Uma foto bem iluminada resolve.";

  return (
    <main className="relative min-h-dvh bg-black flex flex-col items-center justify-center px-6 pt-28 pb-16 gap-10 overflow-hidden">
      <LandscapeWarning visible={isLandscape} />

      <CaptureFlash active={state === "camera_capturing"} />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(201,162,74,0.06), transparent 75%)",
        }}
      />

      {/* Hand instruction overlay — between method_choice and loading_mediapipe */}
      {state === "hand_instruction" && (
        <HandInstructionOverlay
          dominantHand={dominantHand}
          targetName={targetName}
          isSelf={isSelf}
          onReady={() => setState("loading_mediapipe")}
        />
      )}

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
          onPickLive={() => setState("hand_instruction")}
          onPickUpload={() => {
            resetUpload();
            setUploadStep("instruction");
            setShowUpload(true);
          }}
        />
      )}

      {showUpload && (
        <>
          {/* File input oculto — acionado programaticamente */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
            onChange={handleUploadFileSelected}
          />

          {uploadStep === "instruction" && (
            <UploadInstructionScreen
              dominantHand={dominantHand}
              targetName={targetName}
              isSelf={isSelf}
              onContinue={() => uploadInputRef.current?.click()}
              onBack={handleUploadBack}
            />
          )}

          {uploadStep === "validating" && <UploadValidationScreen checks={uploadResult.checks} />}

          {uploadStep === "confirm" && (
            <UploadConfirmScreen
              result={uploadResult}
              targetName={isSelf ? undefined : targetName}
              onConfirm={handleUploadConfirm}
              onRetry={handleUploadRetry}
              onBack={handleUploadBack}
            />
          )}
        </>
      )}

      {showViewport && (
        <CameraViewport
          state={state}
          videoRef={videoRef}
          canvasRef={canvasRef}
          mirrored={mirrored}
          dominantHand={dominantHand}
          targetName={targetName}
          onSwitchCamera={handleSwitchCamera}
        />
      )}

      {!errorState && state !== "camera_capturing" && (
        <div className="relative">
          <CameraFeedback text="" />
          {/* Method switch suggestion after 3 failures */}
          {suggestMethodSwitch && (
            <p className="font-cormorant italic text-[15px] text-bone-dim text-center max-w-xs mt-2">
              {methodSwitchText}
            </p>
          )}
        </div>
      )}

      {errorState && (
        <CameraErrorState
          state={state}
          onRetry={() => router.replace("/ler/camera")}
          onUploadSelected={handleUploadSelectedFromError}
        />
      )}

      {/* Wrong hand feedback toast — non-blocking, 3s auto-hide */}
      <WrongHandFeedback
        expectedHand={dominantHand}
        visible={state === "camera_wrong_hand"}
        isSelf={isSelf}
        targetGender={targetGender}
      />

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
