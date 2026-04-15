import Link from "next/link";

import ConstellationCanvas from "./ConstellationCanvas";
import FadeUp from "./FadeUp";
import ScrollProgress from "./ScrollProgress";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto - MãosFalam",
  description: "A história das suas mãos. 5 mil anos de quiromancia. Agora na palma da sua mão.",
  openGraph: {
    title: "A história das suas mãos",
    description: "5 mil anos de quiromancia. Agora na palma da sua mão.",
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
            de <em className="text-gold not-italic">silêncio</em>
            <br />
            acabaram.
          </h1>
          <p className="font-raleway font-light text-bone-dim leading-[1.9] max-w-[480px] text-[clamp(13px,2.2vw,16px)]">
            Sua mão tem um mapa. Esse mapa tá falando desde o dia que você nasceu.
            <br />
            Você só nunca parou pra ouvir.
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
      <div className="relative z-[3] max-w-[820px] mx-auto px-6">
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
            Fecha os olhos. Abre a mão.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Passa o dedo pela palma. Devagar. Sente as linhas? Umas são fundas. Outras são finas,
            quase invisíveis. Tem umas que se cruzam. Tem umas que param no meio.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Agora abre os olhos e olha.
          </p>
          <Pullquote
            text="Essa mão que você usa pra destrancar o celular, pra segurar o café, pra tocar quem você ama. Essa mão tem um mapa."
            attr="E esse mapa tá falando desde o dia que você nasceu"
          />
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Você só nunca parou pra ouvir.
          </p>
        </FadeUp>

        {/* Historia */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            01 . A história que ninguém te contou
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            Cinco mil anos atrás
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Antes de existir escrita, antes de existir religião organizada, antes de alguém pensar
            em inventar horóscopo. Uma mulher olhou pra palma da mão de outra mulher e disse:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">
              eu sei o que vai acontecer com você.
            </em>
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Não tinha bola de cristal. Não tinha carta. Não tinha app. Tinha a mão aberta e alguém
            que sabia ler.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Na Índia, chamavam de <strong className="text-bone font-normal">Jyotish Shastra</strong>
            . Na China, era parte da medicina. Os gregos deram o nome que ficou:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">quiromancia</em>. Quiro,
            mão. Mancia, adivinhação. Hipócrates usava pra diagnosticar. Júlio César lia as mãos dos
            soldados antes de mandar pra guerra.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            Não era misticismo. Era a forma mais antiga de olhar pra uma pessoa e dizer:{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">eu vejo você.</em>
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            E aí vieram os séculos. A igreja baniu. A ciência riu. A quiromancia foi empurrada pras
            tendas de feira, pros becos, pros acampamentos. Virou &ldquo;coisa de cigana&rdquo;.
          </p>
          <Pullquote text="Mas a cigana nunca parou de ler." />
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Ela sabia que as linhas mudam. Que a mão que você tem aos 15 não é a mesma aos 30. Que a
            linha do coração fica mais funda quando você ama de verdade e mais fina quando você se
            protege demais.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            A cigana sabia que a mão não prevê o futuro.{" "}
            <strong className="text-bone font-normal">
              A mão conta quem você é. E quem você é determina pra onde você vai.
            </strong>
          </p>
        </FadeUp>

        {/* As quatro linhas */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            02 . O que a sua mão diz
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            As quatro linhas. Quatro capítulos.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-10">
            Sua mão tem quatro linhas principais. Cada uma é um capítulo da pessoa que você é. Não
            da pessoa que você finge ser.
          </p>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-0.5 my-12">
            <LineCard
              num="Linha 01"
              name="Do Coração"
              desc="Como você ama. Não como você <em class='font-cormorant italic text-gold text-[1.08em]'>acha</em> que ama. O que você esconde. O que você entrega rápido demais. O que você segura até não aguentar mais."
            />
            <LineCard
              num="Linha 02"
              name="Da Cabeça"
              desc="Como sua mente funciona. Se você pensa reto ou torto. Se você decide rápido ou fica girando no mesmo pensamento às 3 da manhã."
            />
            <LineCard
              num="Linha 03"
              name="Da Vida"
              desc="Ela não diz quando você vai morrer. Ela diz como você vive. Com que intensidade. Onde você quebrou e como levantou."
            />
            <LineCard
              num="Linha 04"
              name="Do Destino"
              desc="Nem todo mundo tem. Se você tem, ela mostra o caminho que você tá trilhando. Se ela só aparece na mão direita, você inventou esse caminho sozinha."
            />
          </div>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-4">
            Além das linhas, tem os montes. Sete elevações na palma, cada uma ligada a um planeta.
            Júpiter é ambição. Saturno é destino. Sol é sucesso. Mercúrio é comunicação. Vênus é
            amor. Marte é coragem.{" "}
            <strong className="text-bone font-normal">Ninguém tem a mesma mão.</strong>
          </p>
        </FadeUp>

        {/* Mao esquerda vs direita */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            03 . Duas mãos. Duas histórias.
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
            Coloca as duas lado a lado. Olha. Elas não são iguais.
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
                  Mão Esquerda
                </span>
                <div className="font-cinzel text-bone font-normal tracking-[0.04em] mb-3.5 text-[clamp(15px,2.5vw,19px)]">
                  Quem você nasceu
                </div>
                <p className="font-raleway text-[14px] font-light leading-[1.9] text-bone-dim">
                  A programação original. O que veio com você. A promessa que foi feita antes de
                  você escolher qualquer coisa.
                </p>
              </div>
              <div>
                <span className="block font-jetbrains text-[8px] tracking-[4px] uppercase text-violet mb-4">
                  Mão Direita
                </span>
                <div className="font-cinzel text-bone font-normal tracking-[0.04em] mb-3.5 text-[clamp(15px,2.5vw,19px)]">
                  Quem você virou
                </div>
                <p className="font-raleway text-[14px] font-light leading-[1.9] text-bone-dim">
                  O que a vida fez. As decisões, os traumas, os amores, as fugas. As diferenças
                  entre uma e outra contam tudo o que aconteceu no meio.
                </p>
              </div>
            </div>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)]">
            Se a linha do coração da esquerda é mais profunda que a da direita, você nasceu com uma
            intensidade que a vida te ensinou a esconder. Se a da direita é mais profunda, você
            aprendeu a amar com mais força do que veio programada pra sentir.
          </p>
          <Pullquote text="Uma é promessa. A outra é escolha." />
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
            Não é genérico. Nunca é genérico.
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
                Pega tudo isso. Os cinco mil anos. As quatro linhas. Os sete montes. A mão esquerda
                e a direita. Cada cruzamento, cada bifurcação, cada marca que apareceu nos últimos
                anos.
              </p>
              <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] relative z-[1] mt-6">
                E <em className="font-cormorant italic text-gold text-[1.08em]">lê</em>.
              </p>
              <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] relative z-[1] mt-6">
                Não é &ldquo;você é uma pessoa sensível que às vezes se fecha&rdquo;. Isso qualquer
                um fala. MaosFalam te conta como você ama, por que se protege, o que te derrubou e
                como você levantou.{" "}
                <strong className="text-bone font-normal">
                  Com nome. Com detalhe. Com a precisão de quem tá olhando pra sua palma e vendo o
                  que você não vê.
                </strong>
              </p>
            </div>
          </FadeUp>

          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-10">
            A leitura é construída cruzando mais de dez mil referências de quiromancia profissional.
            Cada linha da sua mão é comparada, medida, interpretada. Não por achismo. Por um sistema
            que estudou o que as melhores leitoras de mão do mundo levam décadas pra aprender.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            A diferença é que agora isso cabe na tela do seu celular. E demora 30 segundos.
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
            Depois de ler, você não olha do mesmo jeito.
          </h2>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-3 gap-0.5 my-12">
            {[
              { quote: "Tem gente que lê e chora.", sub: "Reconhecimento" },
              { quote: "Tem gente que lê e manda pro ex.", sub: "Revelação" },
              { quote: "Tem gente que lê e fica quieta por horas.", sub: "Silêncio necessário" },
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
            Eu não sei o que você vai fazer. Mas eu sei que depois de ler, você não vai olhar pra
            sua mão do mesmo jeito.
          </p>
        </FadeUp>

        {/* Leitura gratis */}
        <FadeUp className="py-25" style={{ borderTop: "1px solid rgba(201,162,74,0.06)" }}>
          <span className="block font-jetbrains text-[7px] tracking-[5px] uppercase text-gold-dim mb-5">
            06 . Por onde começar
          </span>
          <h2 className="font-cinzel text-bone font-normal tracking-[0.04em] mb-12 pl-5 relative text-[clamp(18px,3.5vw,26px)]">
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full"
              style={{
                background: "linear-gradient(180deg, transparent, var(--color-gold), transparent)",
              }}
            />
            A Linha do Coração é grátis. Sempre.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-9">
            Porque eu quero que você sinta o que é ser lida de verdade antes de decidir qualquer
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
                  Linha do Coração
                </span>
              </div>
              <div className="p-7 min-[520px]:p-10">
                <div className="font-cinzel text-bone font-normal mb-4 text-[clamp(15px,2.8vw,20px)]">
                  O que você descobre de graça
                </div>
                <ul className="flex flex-col gap-2.5 list-none">
                  {[
                    "Como você ama de verdade",
                    "O que você esconde de quem te ama",
                    "Seu padrão quando confia em alguém",
                    "Por que você se protege tanto",
                    "Uma frase sobre você que vai doer um pouco",
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
            Só a Linha do Coração. Mas já é o suficiente pra você ficar em silêncio.
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
            Sua mão não tem só uma linha.
          </h2>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mb-8">
            A Linha do Coração é só a porta. O que tá lá dentro é outra coisa.
          </p>

          <FadeUp>
            <ul
              className="flex flex-col my-8"
              style={{ border: "1px solid rgba(201,162,74,0.07)" }}
            >
              {[
                { num: "01", text: "Linha do Coração. Como você ama, o que esconde quando ama" },
                { num: "02", text: "Linha da Cabeça. Como sua mente funciona, por que não para" },
                { num: "03", text: "Linha da Vida. O que te derrubou, como você levantou" },
                { num: "04", text: "Linha do Destino. Pra onde você tá indo, mesmo sem saber" },
                { num: "05", text: "Seis montes mapeados . tipo de mão . elemento" },
                { num: "06", text: "Compatibilidade . amor, sexo e intimidade" },
                { num: "07", text: "Sinais raros e marcas de proteção" },
                { num: "08", text: "Mão esquerda versus mão direita. Promessa e escolha" },
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
            Resultado com seu nome. Só seu. Só pra você. Nenhuma leitura é genérica. A sua é só sua.
          </p>
          <p className="font-raleway font-light text-bone-dim leading-[2] max-w-[600px] text-[clamp(15px,2.4vw,18px)] mt-7">
            O sistema não chuta. Ele{" "}
            <em className="font-cormorant italic text-gold text-[1.08em]">lê</em>. Mede a
            profundidade de cada linha. Identifica bifurcações. Mapeia os sete montes. Compara a
            esquerda com a direita. Encontra padrões que a olho nu passam despercebidos.
          </p>
        </FadeUp>
      </div>

      {/* ═══ CTA FINAL ═══ */}
      <FadeUp className="relative z-[3] text-center max-w-[620px] mx-auto pt-30 pb-25 max-[480px]:pt-20 max-[480px]:pb-18 px-6">
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(201,162,74,0.2), transparent)",
          }}
        />
        <DiamondOrnament className="w-15 mx-auto mb-5" />
        <p className="font-cormorant italic font-light text-bone leading-[1.25] tracking-[0.01em] mb-6 text-[clamp(26px,5.5vw,46px)]">
          Tá tudo aí.
          <br />
          Sempre esteve.
        </p>
        <p className="font-raleway text-[13px] font-light text-bone-dim tracking-[0.02em] leading-[1.9] mb-12">
          Você só nunca parou pra ver.
          <br />
          Me mostre sua mão e eu te conto quem você é.
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
        className="relative z-[3] text-center px-6 pt-12 pb-15"
        style={{ borderTop: "1px solid rgba(201,162,74,0.05)" }}
      >
        <DiamondOrnament className="w-15 mx-auto mb-5" />
        <p
          className="font-jetbrains text-[7px] tracking-[3px] uppercase"
          style={{ color: "rgba(201,162,74,0.25)" }}
        >
          2026 . MaosFalam . Todos os direitos reservados
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
