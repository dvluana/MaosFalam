"use client";

import Button from "@/components/ui/Button";
import type { CamState } from "@/types/camera";
import { CAM_FEEDBACK } from "@/types/camera";

import type { ChangeEvent } from "react";

interface Props {
  state: CamState;
  onRetry: () => void;
  onUploadSelected: (event: ChangeEvent<HTMLInputElement>) => void;
}

function CameraErrorState({ state, onRetry, onUploadSelected }: Props) {
  return (
    <div className="relative flex flex-col items-center text-center w-full max-w-sm flex-1">
      {/* Error message — centered in available space */}
      <div className="flex-1 flex items-center">
        <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.35]">
          {CAM_FEEDBACK[state]}
        </p>
      </div>

      {/* Actions — fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center gap-3 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        {state === "camera_fallback_upload" ? (
          <label
            className="font-jetbrains text-[10px] text-gold uppercase tracking-[1.8px] branded-radius px-6 py-4 cursor-pointer"
            style={{
              fontWeight: 500,
              border: "1px solid rgba(201,162,74,0.45)",
              background: "rgba(14,10,24,0.6)",
            }}
          >
            Enviar foto da palma
            <input type="file" accept="image/*" className="hidden" onChange={onUploadSelected} />
          </label>
        ) : (
          <Button variant="primary" size="lg" onClick={onRetry} className="w-full max-w-sm">
            Tentar de novo
          </Button>
        )}
      </div>
    </div>
  );
}

export default CameraErrorState;
