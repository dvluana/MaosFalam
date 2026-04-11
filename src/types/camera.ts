export type CamState =
  | "method_choice"
  | "loading_mediapipe"
  | "camera_active_no_hand"
  | "camera_hand_detected"
  | "camera_adjusting"
  | "camera_wrong_hand"
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
  "camera_adjusting",
  "camera_wrong_hand",
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
  camera_hand_detected: "Segure assim.",
  camera_adjusting: "Abra mais os dedos. Preciso ver as linhas.",
  camera_wrong_hand: "Essa nao e a mao que eu pedi. Me mostra a outra.",
  camera_stable: "Segure.",
  camera_capturing: "",
  camera_permission_denied: "Preciso dos seus olhos emprestados. Libera a câmera.",
  camera_permission_denied_permanent: "Abra nas configurações do celular pra me deixar ver.",
  camera_fallback_upload: "Me manda um retrato da sua mão então.",
  camera_error_generic: "Algo saiu errado. Tente de novo.",
};

export const CAM_EYEBROW: Record<CamState, string> = {
  method_choice: "Como você me mostra",
  loading_mediapipe: "Preparando",
  camera_active_no_hand: "Aguardando",
  camera_hand_detected: "Ajustando",
  camera_adjusting: "Ajustando",
  camera_wrong_hand: "Mao errada",
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
    state === "camera_adjusting" ||
    state === "camera_wrong_hand" ||
    state === "camera_stable" ||
    state === "camera_capturing"
  );
}
