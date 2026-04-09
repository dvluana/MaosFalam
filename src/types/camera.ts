export type CamState =
  | "method_choice"
  | "loading_mediapipe"
  | "camera_active_no_hand"
  | "camera_hand_detected"
  | "camera_stable"
  | "camera_capturing"
  | "camera_permission_denied"
  | "camera_permission_denied_permanent"
  | "camera_fallback_upload"
  | "camera_error_generic";

export const CAM_STATES: readonly CamState[] = [
  "method_choice",
  "loading_mediapipe",
  "camera_active_no_hand",
  "camera_hand_detected",
  "camera_stable",
  "camera_capturing",
  "camera_permission_denied",
  "camera_permission_denied_permanent",
  "camera_fallback_upload",
  "camera_error_generic",
];

export const CAM_FEEDBACK: Record<CamState, string> = {
  method_choice: "",
  loading_mediapipe: "Preciso ver melhor.",
  camera_active_no_hand: "Posicione sua mão na moldura.",
  camera_hand_detected: "Abra mais os dedos.",
  camera_stable: "Segure.",
  camera_capturing: "",
  camera_permission_denied:
    "Preciso dos seus olhos emprestados. Libera a câmera.",
  camera_permission_denied_permanent:
    "Abra nas configurações do celular pra me deixar ver.",
  camera_fallback_upload: "Me manda um retrato da sua mão então.",
  camera_error_generic: "Algo saiu errado. Tente de novo.",
};

export const CAM_EYEBROW: Record<CamState, string> = {
  method_choice: "Como você me mostra",
  loading_mediapipe: "Preparando",
  camera_active_no_hand: "Aguardando",
  camera_hand_detected: "Ajustando",
  camera_stable: "Capturando",
  camera_capturing: "Capturado",
  camera_permission_denied: "Sem acesso",
  camera_permission_denied_permanent: "Sem acesso",
  camera_fallback_upload: "Retrato",
  camera_error_generic: "Erro",
};

export function isErrorState(state: CamState): boolean {
  return (
    state === "camera_permission_denied" ||
    state === "camera_permission_denied_permanent" ||
    state === "camera_fallback_upload" ||
    state === "camera_error_generic"
  );
}

export function isFrameActive(state: CamState): boolean {
  return (
    state === "camera_hand_detected" ||
    state === "camera_stable" ||
    state === "camera_capturing"
  );
}
