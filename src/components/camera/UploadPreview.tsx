"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import Button from "@/components/ui/Button";

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

interface Props {
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

function UploadPreview({ onConfirm, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("Preciso de uma foto. JPG, PNG ou WebP.");
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`A foto precisa ter menos de ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  }, []);

  const handleConfirm = useCallback(() => {
    if (file) onConfirm(file);
  }, [file, onConfirm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center gap-6 w-full max-w-sm"
    >
      {!preview && (
        <>
          <label
            className="group relative flex flex-col items-center justify-center gap-4 w-full cursor-pointer py-12 px-6 text-center transition-colors hover:bg-violet/5"
            style={{
              border: "1px dashed rgba(201,162,74,0.25)",
              borderRadius: "0 6px 0 6px",
              background: "rgba(14,10,24,0.4)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="rgba(201,162,74,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-cormorant italic text-[18px] text-bone-dim">
              Escolha uma foto da sua palma
            </span>
            <span className="font-jetbrains text-[9px] text-violet tracking-[1.5px] uppercase">
              JPG, PNG ou WebP. Ate {MAX_SIZE_MB}MB
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelect}
            />
          </label>
          {error && <p className="font-jetbrains text-[11px] text-rose">{error}</p>}
        </>
      )}

      {preview && (
        <>
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "3 / 4",
              borderRadius: "0 6px 0 6px",
              border: "1px solid rgba(201,162,74,0.2)",
            }}
          >
            <Image src={preview} alt="Foto da palma" fill className="object-cover" unoptimized />
          </div>
          <div className="flex gap-4 w-full">
            <Button variant="ghost" onClick={onCancel}>
              Trocar
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              Essa e minha mao
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default UploadPreview;
