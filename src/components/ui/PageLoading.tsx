/**
 * PageLoading — fallback minimalista para Suspense boundaries.
 * Ponto dourado pulsante centralizado em tela escura.
 */
export default function PageLoading() {
  return (
    <main className="min-h-dvh bg-black flex items-center justify-center">
      <span
        aria-label="Carregando"
        className="block w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
        style={{ boxShadow: "0 0 8px rgba(201,162,74,0.4)" }}
      />
    </main>
  );
}
