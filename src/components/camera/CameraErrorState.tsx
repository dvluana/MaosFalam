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
    <div className="relative flex flex-col items-center gap-6 max-w-sm text-center mt-4">
      <p className="font-cormorant italic text-[22px] sm:text-[26px] text-bone leading-[1.35]">
        {CAM_FEEDBACK[state]}
      </p>
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
        <Button variant="secondary" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}

export default CameraErrorState;
