import Link from "next/link";

import ConstellationCanvas from "./ConstellationCanvas";
import FadeUp from "./FadeUp";
import ScrollProgress from "./ScrollProgress";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto - MaosFalam",
  description: "A historia das suas maos. 5 mil anos de quiromancia. Agora na palma da sua mao.",
  openGraph: {
    title: "A historia das suas maos",
    description: "5 mil anos de quiromancia. Agora na palma da sua mao.",
  },
};

/* ── Ornamental diamond separator ── */
function DiamondOrnament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="flex-1 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)",
        }}
      />
      <span className="w-[5px] h-[5px] bg-gold rotate-45 shrink-0" />
      <span
        className="flex-1 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--color-gold-dim), transparent)",
        }}
      />
    </div>
  );
}

/* ── Line card corner accents ── */
function CornerAccents() {
  return (
    <>
      <span
        className="absolute top-2 left-2 w-2.5 h-2.5"
        style={{
          borderTop: "1px solid rgba(201,162,74,0.2)",
          borderLeft: "1px solid rgba(201,162,74,0.2)",
        }}
      />
      <span
        className="absolute bottom-2 right-2 w-2.5 h-2.5"
        style={{
          borderBottom: "1px solid rgba(201,162,74,0.2)",
          borderRight: "1px solid rgba(201,162,74,0.2)",
        }}
      />
    </>
  );
}

/* ── Pullquote block ── */
function Pullquote({ text, attr }: { text: string; attr?: string }) {
  return (
    <FadeUp>
      <blockquote
        className="relative my-15 py-10 px-8"
        style={{
          borderLeft: "2px solid rgba(201,162,74,0.25)",
          background: "linear-gradient(90deg, rgba(201,162,74,0.03) 0%, transparent 100%)",
        }}
      >
        <span
          className="absolute -top-5 left-5 font-cormorant text-[80px] leading-none select-none"
          style={{ color: "rgba(201,162,74,0.12)" }}
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <p className="font-cormorant italic text-bone font-light leading-relaxed tracking-[0.01em] text-[clamp(20px,4vw,30px)]">
          {text}
        </p>
        {attr && (
          <span className="block mt-4 font-jetbrains text-[8px] tracking-[4px] uppercase text-gold-dim">
            {attr}
          </span>
        )}
      </blockquote>
    </FadeUp>
  );
}

/* ── Line card for the four lines grid ── */
function LineCard({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <FadeUp
      className="relative overflow-hidden p-7 transition-[border-color] duration-300"
      style={{
        background: "rgba(14,10,24,0.7)",
        border: "1px solid rgba(201,162,74,0.06)",
      }}
    >
      <CornerAccents />
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(139,123,191,0.07) 0%, transparent 70%)",
        }}
      />
      <span className="block font-jetbrains text-[7px] tracking-[4px] uppercase text-gold-dim mb-3">
        {num}
      </span>
      <div className="font-cinzel text-gold font-medium tracking-[0.05em] mb-3.5 text-[clamp(14px,2.5vw,17px)]">
        {name}
      </div>
      <p
        className="font-raleway text-[13px] font-light leading-[1.8] text-bone-dim"
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    </FadeUp>
  );
}

export default function ManifestoPage() {
  return (
    <main className="relative overflow-x-hidden">
      <ScrollProgress />
      <ConstellationCanvas />

      {/* Vignette */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 72% 65% at 50% 38%, transparent 18%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.72) 74%, rgba(0,0,0,0.96) 90%)",
        }}
      />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col justify-end px-6 pb-[10vh] z-[1] overflow-hidden">
        {/* Hero radial overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(201,162,74,0.06) 0%, transparent 70%), radial-gradient(ellipse 100% 40% at 50% 100%, rgba(0,0,0,0.9) 0%, transparent 60%)",
          }}
        />

        {/* Abstract hand silhouette */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          aria-hidden="true"
        >
          <svg
            className="w-[min(480px,88vw)] animate-[handBreath_8s_ease-in-out_infinite]"
            style={{ opacity: 0.05, filter: "blur(2px) sepia(1) saturate(0.3)" }}
            viewBox="0 0 400 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M200 480 C120 460 60 380 50 300 C40 220 80 160 100 140 C110 130 110 100 120 80 C130 60 150 55 160 70 C165 78 165 100 165 120 C165 90 168 60 180 48 C192 36 210 38 215 55 C220 68 218 100 218 120 C218 95 222 65 235 55 C248 45 262 52 264 70 C266 85 262 110 262 130 C263 108 268 85 280 78 C292 71 305 80 305 100 C305 118 300 145 298 165 C310 148 325 138 338 145 C352 153 355 172 348 195 C335 240 310 285 300 320 C285 370 260 440 200 480Z"
              stroke="rgba(201,162,74,0.4)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M90 270 C130 260 180 255 230 258 C270 261 300 268 320 275"
              stroke="rgba(201,162,74,0.25)"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M75 320 C110 308 160 302 210 305 C250 308 285 316 310 325"
              stroke="rgba(201,162,74,0.2)"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M120 370 C145 362 175 358 205 360 C230 362 252 368 270 376"
              stroke="rgba(201,162,74,0.15)"
              strokeWidth="0.7"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M175 200 C185 250 188 310 185 380"
              stroke="rgba(201,162,74,0.2)"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-[2] max-w-[640px]">
          <span
            className="inline-block font-jetbrains text-[8px] tracking-[5px] uppercase text-gold-dim mb-10 py-[7px] px-[18px]"
            style={{ border: "1px solid rgba(201,162,74,0.1)" }}
          >
            Manifesto . MaosFalam
          </span>
          <h1 className="font-cormorant italic font-light text-bone leading-[1.1] tracking-[-0.01em] mb-7 text-[clamp(38px,8vw,72px)]">
            Cinco mil anos
            <br />
            de <em className="text-gold not-italic">silencio</em>
            <br />
            acabaram.
          </h1>
          <p className="font-raleway font-light text-bone-dim leading-[1.9] max-w-[480px] text-[clamp(13px,2.2vw,16px)]">
            Sua mao tem um mapa. Esse mapa ta falando desde o dia que voce nasceu.
            <br />
            Voce so nunca parou pra ouvir.
          </p>
          <DiamondOrnament className="w-20 mt-12" />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 animate-[scrollHintIn_1s_ease_1.6s_forwards] opacity-0">
          <div
            className="w-px h-10 animate-[scrollDrop_2s_ease-in-out_2s_infinite]"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--color-gold-dim), transparent)",
            }}
          />
          <span
            className="font-jetbrains text-[7px] tracking-[4px] uppercase"
            style={{ color: "rgba(201,162,74,0.4)" }}
          >
            Rolar
          </span>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-[1] max-w-[820px] mx-auto px-6">
        {/* Intro sensorial */}
        <FadeUp
          className="py-25 first:border-t-0"
          style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}
        >
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            Antes de qualquer coisa
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Fecha os olhos. Abre a mao.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Passa o dedo pela palma. Devagar. Sente as linhas? Umas sao fundas. Outras sao finas,
            quase invisiveis. Tem umas que se cruzam. Tem umas que param no meio.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Agora abre os olhos e olha.
          </p>
          <Pullquote
            text="Essa mao que voce usa pra destrancar o celular, pra segurar o cafe, pra tocar quem voce ama. Essa mao tem um mapa."
            attr="E esse mapa ta falando desde o dia que voce nasceu"
          />
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Voce so nunca parou pra ouvir.
          </p>
        </FadeUp>

        {/* Historia */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            01 . A historia que ninguem te contou
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Cinco mil anos atras
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Antes de existir escrita, antes de existir religiao organizada, antes de alguem pensar
            em inventar horoscopo. Uma mulher olhou pra palma da mao de outra mulher e disse:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">
              eu sei o que vai acontecer com voce.
            </em>
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Nao tinha bola de cristal. Nao tinha carta. Nao tinha app. Tinha a mao aberta e alguem
            que sabia ler.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Na India, chamavam de <strong className="text-bone font-normal">Jyotish Shastra</strong>
            . Na China, era parte da medicina. Os gregos deram o nome que ficou:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">quiromancia</em>. Quiro,
            mao. Mancia, adivinhacao. Hipocrates usava pra diagnosticar. Julio Cesar lia as maos dos
            soldados antes de mandar pra guerra.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Nao era misticismo. Era a forma mais antiga de olhar pra uma pessoa e dizer:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">eu vejo voce.</em>
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            E ai vieram os seculos. A igreja baniu. A ciencia riu. A quiromancia foi empurrada pras
            tendas de feira, pros becos, pros acampamentos. Virou &ldquo;coisa de cigana&rdquo;.
          </p>
          <Pullquote text="Mas a cigana nunca parou de ler." />
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Ela sabia que as linhas mudam. Que a mao que voce tem aos 15 nao e a mesma aos 30. Que a
            linha do coracao fica mais funda quando voce ama de verdade e mais fina quando voce se
            protege demais.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            A cigana sabia que a mao nao preve o futuro.{" "}
            <strong className="text-bone font-normal">
              A mao conta quem voce e. E quem voce e determina pra onde voce vai.
            </strong>
          </p>
        </FadeUp>

        {/* As quatro linhas */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            02 . O que a sua mao diz
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            As quatro linhas. Quatro capitulos.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-10">
            Sua mao tem quatro linhas principais. Cada uma e um capitulo da pessoa que voce e. Nao
            da pessoa que voce finge ser.
          </p>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-0.5 my-12">
            <LineCard
              num="Linha 01"
              name="Do Coracao"
              desc="Como voce ama. Nao como voce <em class='font-cormorant italic text-gold text-[1.08em]'>acha</em> que ama. O que voce esconde. O que voce entrega rapido demais. O que voce segura ate nao aguentar mais."
            />
            <LineCard
              num="Linha 02"
              name="Da Cabeca"
              desc="Como sua mente funciona. Se voce pensa reto ou torto. Se voce decide rapido ou fica girando no mesmo pensamento as 3 da manha."
            />
            <LineCard
              num="Linha 03"
              name="Da Vida"
              desc="Ela nao diz quando voce vai morrer. Ela diz como voce vive. Com que intensidade. Onde voce quebrou e como levantou."
            />
            <LineCard
              num="Linha 04"
              name="Do Destino"
              desc="Nem todo mundo tem. Se voce tem, ela mostra o caminho que voce ta trilhando. Se ela so aparece na mao direita, voce inventou esse caminho sozinha."
            />
          </div>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-4">
            Alem das linhas, tem os montes. Sete elevacoes na palma, cada uma ligada a um planeta.
            Jupiter e ambicao. Saturno e destino. Sol e sucesso. Mercurio e comunicacao. Venus e
            amor. Marte e coragem.{" "}
            <strong className="text-bone font-normal">Ninguem tem a mesma mao.</strong>
          </p>
        </FadeUp>

        {/* Mao esquerda vs direita */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            03 . Duas maos. Duas historias.
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            A esquerda e a direita
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-9">
            Coloca as duas lado a lado. Olha. Elas nao sao iguais.
          </p>

          <FadeUp>
            <div
              className="relative grid grid-cols-1 min-[520px]:grid-cols-2 gap-6 min-[520px]:gap-8 p-6 min-[520px]:p-10 my-12"
              style={{
                background: "rgba(14,10,24,0.5)",
                border: "1px solid rgba(139,123,191,0.08)",
              }}
            >
              {/* Vertical divider (desktop only) */}
              <span
                className="hidden min-[520px]:block absolute left-1/2 top-10 bottom-10 w-px"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(201,162,74,0.15), transparent)",
                }}
              />
              <div>
                <span className="block font-jetbrains text-[8px] tracking-[4px] uppercase text-violet mb-4">
                  Mao Esquerda
                </span>
                <div className="font-cinzel text-bone font-normal tracking-[0.04em] mb-3.5 text-[clamp(15px,2.5vw,19px)]">
                  Quem voce nasceu
                </div>
                <p className="font-raleway text-[14px] font-light leading-[1.9] text-bone-dim">
                  A programacao original. O que veio com voce. A promessa que foi feita antes de
                  voce escolher qualquer coisa.
                </p>
              </div>
              <div>
                <span className="block font-jetbrains text-[8px] tracking-[4px] uppercase text-violet mb-4">
                  Mao Direita
                </span>
                <div className="font-cinzel text-bone font-normal tracking-[0.04em] mb-3.5 text-[clamp(15px,2.5vw,19px)]">
                  Quem voce virou
                </div>
                <p className="font-raleway text-[14px] font-light leading-[1.9] text-bone-dim">
                  O que a vida fez. As decisoes, os traumas, os amores, as fugas. As diferencas
                  entre uma e outra contam tudo o que aconteceu no meio.
                </p>
              </div>
            </div>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Se a linha do coracao da esquerda e mais profunda que a da direita, voce nasceu com uma
            intensidade que a vida te ensinou a esconder. Se a da direita e mais profunda, voce
            aprendeu a amar com mais forca do que veio programada pra sentir.
          </p>
          <Pullquote text="Uma e promessa. A outra e escolha." />
        </FadeUp>

        {/* O que o MaosFalam faz */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            04 . O que MaosFalam faz
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Nao e generico. Nunca e generico.
          </h2>

          <FadeUp>
            <div
              className="relative my-12 p-8 min-[520px]:p-12"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,162,74,0.04) 0%, rgba(139,123,191,0.03) 100%)",
                border: "1px solid rgba(201,162,74,0.1)",
              }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 85% 20%, rgba(139,123,191,0.1) 0%, transparent 70%)",
                }}
              />
              <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] relative z-[1]">
                Pega tudo isso. Os cinco mil anos. As quatro linhas. Os sete montes. A mao esquerda
                e a direita. Cada cruzamento, cada bifurcacao, cada marca que apareceu nos ultimos
                anos.
              </p>
              <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] relative z-[1] mt-6">
                E <em className="font-cormorant italic text-gold text-[1.08em]">le</em>.
              </p>
              <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] relative z-[1] mt-6">
                Nao e &ldquo;voce e uma pessoa sensivel que as vezes se fecha&rdquo;. Isso qualquer
                um fala. MaosFalam te conta como voce ama, por que se protege, o que te derrubou e
                como voce levantou.{" "}
                <strong className="text-bone font-normal">
                  Com nome. Com detalhe. Com a precisao de quem ta olhando pra sua palma e vendo o
                  que voce nao ve.
                </strong>
              </p>
            </div>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-10">
            A leitura e construida cruzando mais de dez mil referencias de quiromancia profissional.
            Cada linha da sua mao e comparada, medida, interpretada. Nao por achismo. Por um sistema
            que estudou o que as melhores leitoras de mao do mundo levam decadas pra aprender.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            A diferenca e que agora isso cabe na tela do seu celular. E demora 30 segundos.
          </p>
        </FadeUp>

        {/* O que as pessoas sentem */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            05 . O que as pessoas sentem
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Depois de ler, voce nao olha do mesmo jeito.
          </h2>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-3 gap-0.5 my-12">
            {[
              { quote: "Tem gente que le e chora.", sub: "Reconhecimento" },
              { quote: "Tem gente que le e manda pro ex.", sub: "Revelacao" },
              { quote: "Tem gente que le e fica quieta por horas.", sub: "Silencio necessario" },
            ].map((item) => (
              <FadeUp
                key={item.sub}
                className="p-6 min-[520px]:p-8 relative"
                style={{
                  background: "rgba(8,5,14,0.8)",
                  border: "1px solid rgba(201,162,74,0.05)",
                }}
              >
                <p className="font-cormorant italic font-light text-bone leading-[1.75] mb-4 text-[clamp(14px,2.2vw,16px)]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <span className="font-jetbrains text-[7px] tracking-[3px] uppercase text-gold-dim">
                  {item.sub}
                </span>
              </FadeUp>
            ))}
          </div>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Eu nao sei o que voce vai fazer. Mas eu sei que depois de ler, voce nao vai olhar pra
            sua mao do mesmo jeito.
          </p>
        </FadeUp>

        {/* Leitura gratis */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            06 . Por onde comecar
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            A Linha do Coracao e gratis. Sempre.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-9">
            Porque eu quero que voce sinta o que e ser lida de verdade antes de decidir qualquer
            coisa.
          </p>

          <FadeUp>
            <div
              className="grid grid-cols-1 min-[520px]:grid-cols-[1fr_2fr] my-12"
              style={{ border: "1px solid rgba(201,162,74,0.12)" }}
            >
              <div
                className="flex flex-col justify-center items-center p-7 min-[520px]:p-10 text-center gap-3 min-[520px]:border-r min-[520px]:border-r-gold/10 border-b min-[520px]:border-b-0 border-b-gold/10"
                style={{ background: "rgba(201,162,74,0.06)" }}
              >
                <span className="font-jetbrains text-[7px] tracking-[3px] uppercase text-gold-dim">
                  Gratuito
                </span>
                <span className="font-cinzel text-[11px] tracking-[0.06em] text-gold">
                  Linha do Coracao
                </span>
              </div>
              <div className="p-7 min-[520px]:p-10">
                <div className="font-cinzel text-bone font-normal mb-4 text-[clamp(15px,2.8vw,20px)]">
                  O que voce descobre de graca
                </div>
                <ul className="flex flex-col gap-2.5 list-none">
                  {[
                    "Como voce ama de verdade",
                    "O que voce esconde de quem te ama",
                    "Seu padrao quando confia em alguem",
                    "Por que voce se protege tanto",
                    "Uma frase sobre voce que vai doer um pouco",
                  ].map((item) => (
                    <li
                      key={item}
                      className="font-raleway text-[13px] font-light leading-[1.7] text-bone-dim pl-[18px] relative"
                    >
                      <span className="absolute left-0 top-2 w-[5px] h-[5px] bg-gold-dim rotate-45" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            So a Linha do Coracao. Mas ja e o suficiente pra voce ficar em silencio.
          </p>
        </FadeUp>

        {/* Leitura completa */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            07 . A leitura completa
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Sua mao nao tem so uma linha.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-8">
            A Linha do Coracao e so a porta. O que ta la dentro e outra coisa.
          </p>

          <FadeUp>
            <ul
              className="flex flex-col my-8"
              style={{ border: "1px solid rgba(201,162,74,0.07)" }}
            >
              {[
                { num: "01", text: "Linha do Coracao. Como voce ama, o que esconde quando ama" },
                { num: "02", text: "Linha da Cabeca. Como sua mente funciona, por que nao para" },
                { num: "03", text: "Linha da Vida. O que te derrubou, como voce levantou" },
                { num: "04", text: "Linha do Destino. Pra onde voce ta indo, mesmo sem saber" },
                { num: "05", text: "Seis montes mapeados . tipo de mao . elemento" },
                { num: "06", text: "Compatibilidade . amor, sexo e intimidade" },
                { num: "07", text: "Sinais raros e marcas de protecao" },
                { num: "08", text: "Mao esquerda versus mao direita. Promessa e escolha" },
              ].map((item, i, arr) => (
                <li
                  key={item.num}
                  className="flex gap-4 items-baseline font-raleway text-[14px] font-light leading-[1.7] text-bone-dim px-6 py-[18px]"
                  style={{
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(201,162,74,0.05)" : "none",
                  }}
                >
                  <span className="font-jetbrains text-[8px] tracking-[2px] text-gold-dim shrink-0">
                    {item.num}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-8">
            Resultado com seu nome. So seu. So pra voce. Nenhuma leitura e generica. A sua e so sua.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            O sistema nao chuta. Ele{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">le</em>. Mede a
            profundidade de cada linha. Identifica bifurcacoes. Mapeia os sete montes. Compara a
            esquerda com a direita. Encontra padroes que a olho nu passam despercebidos.
          </p>
        </FadeUp>
      </div>

      {/* ═══ CTA FINAL ═══ */}
      <FadeUp className="relative z-[1] text-center max-w-[620px] mx-auto pt-30 pb-25 max-[480px]:pt-20 max-[480px]:pb-18 px-6">
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(201,162,74,0.2), transparent)",
          }}
        />
        <DiamondOrnament className="w-15 mx-auto mb-5" />
        <p className="font-cormorant italic font-light text-bone leading-[1.25] tracking-[0.01em] mb-6 text-[clamp(26px,5.5vw,46px)]">
          Ta tudo ai.
          <br />
          Sempre esteve.
        </p>
        <p className="font-raleway text-[13px] font-light text-bone-dim tracking-[0.02em] leading-[1.9] mb-12">
          Voce so nunca parou pra ver.
          <br />
          Me mostre sua mao e eu te conto quem voce e.
        </p>
        <Link
          href="/"
          className="group relative inline-flex items-center justify-center px-13 py-[18px] text-bone font-raleway text-[10px] font-normal tracking-[0.08em] uppercase no-underline transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(160deg, #1e1838, #2a2150, #1e1838)",
            borderRadius: "0 6px 0 6px",
            border: "none",
            boxShadow: "0 0 0 1px rgba(201,162,74,0.12), 0 0 28px rgba(123,107,165,0.14)",
          }}
        >
          {/* Corner ornaments */}
          <span
            className="absolute -top-px -left-px w-[9px] h-[9px] transition-all duration-400 group-hover:w-3.5 group-hover:h-3.5"
            style={{
              borderTop: "1px solid rgba(201,162,74,0.28)",
              borderLeft: "1px solid rgba(201,162,74,0.28)",
            }}
          />
          <span
            className="absolute -bottom-px -right-px w-[9px] h-[9px] transition-all duration-400 group-hover:w-3.5 group-hover:h-3.5"
            style={{
              borderBottom: "1px solid rgba(201,162,74,0.28)",
              borderRight: "1px solid rgba(201,162,74,0.28)",
            }}
          />
          Em Breve
        </Link>
      </FadeUp>

      {/* ═══ FOOTER ═══ */}
      <footer
        className="relative z-[1] text-center px-6 pt-12 pb-15"
        style={{ borderTop: "1px solid rgba(201,162,74,0.05)" }}
      >
        <DiamondOrnament className="w-15 mx-auto mb-5" />
        <p
          className="font-jetbrains text-[7px] tracking-[3px] uppercase"
          style={{ color: "rgba(201,162,74,0.25)" }}
        >
          2025 . MaosFalam . Todos os direitos reservados
        </p>
      </footer>

      {/* Keyframes for hand breathing and scroll hint animations */}
      <style>{`
        @keyframes handBreath {
          0%, 100% { opacity: 0.045; transform: scale(1) translateY(0); }
          50% { opacity: 0.07; transform: scale(1.018) translateY(-6px); }
        }
        @keyframes scrollHintIn {
          to { opacity: 1; }
        }
        @keyframes scrollDrop {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
      `}</style>
    </main>
  );
}
