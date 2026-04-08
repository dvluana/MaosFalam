# MaosFalam Design System

REGRA ABSOLUTA: Todo componente visual DEVE usar exclusivamente componentes deste DS.
Criar HTML/CSS custom fora deste sistema e proibido. Se o componente nao existe aqui, crie
seguindo os tokens e padroes descritos.

---

## 1. Tokens de Cor

```css
:root {
  /* Fundos */
  --black: #08050e;
  --deep: #110c1a;
  --surface: #171222;
  --surface-up: #1e1830;
  --parchment: #1c1710; /* EXCLUSIVO: reading cards e share cards */

  /* Destaques */
  --gold: #c9a24a;
  --gold-light: #d9b86a;
  --gold-dim: #7a6832;
  --rose: #c4647a;
  --rose-dim: #8e3a50;
  --violet: #7b6ba5;
  --violet-dim: #4a3d6e;

  /* Suporte */
  --ember: #8b5a38;
  --smoke: #3d332c;
  --velvet: #2a1830;
  --wine: #2a1428;

  /* Texto */
  --bone: #e8dfd0;
  --bone-dim: #9b9284;

  /* Cores por linha */
  --color-heart: var(--rose);
  --color-head: var(--violet);
  --color-life: var(--gold);
  --color-fate: var(--bone);
}
```

### Regra de parchment

Parchment (#1C1710) so e usado em reading cards e share cards. Cards genericos
de UI usam --deep. Isso mantem o pergaminho como elemento especial narrativo.

### Gradientes permitidos

- Profundidade: --black > --deep > --surface (135deg)
- Separador gold: transparent > --gold-dim > transparent (90deg)
- Gold > Rose: calor > emocao (135deg)
- Rose > Violet: emocao > mente (135deg)
- Velvet > Deep: premium (135deg)

---

## 2. Tipografia

```css
/* Fontes Google: Cinzel Decorative, Cinzel, Cormorant Garamond, Raleway, JetBrains Mono */

/* LOGO ONLY */
.font-logo {
  font-family: "Cinzel Decorative", serif;
  font-weight: 400;
}

/* Voz da cigana: taglines, frases de impacto, intros, labels de input, toasts */
.font-voice {
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  letter-spacing: 0.02em;
}

/* Titulos de secao, nomes de linhas, nomes de montes, tabs */
.font-title {
  font-family: "Cinzel", serif;
}

/* Corpo, descricoes, UI, botoes */
.font-body {
  font-family: "Raleway", sans-serif;
}

/* Dados tecnicos, contadores, labels, metadata, badges */
.font-mono {
  font-family: "JetBrains Mono", monospace;
}
```

### Hierarquia de titulos

| Nivel   | Fonte          | Peso | Tamanho                | Cor        |
| ------- | -------------- | ---- | ---------------------- | ---------- |
| H1      | Cinzel         | 400  | 26px                   | --bone     |
| H2      | Cinzel         | 500  | 18px                   | --bone     |
| H3      | Cinzel         | 500  | 14px                   | --gold     |
| Body    | Raleway        | 400  | 15px, line-height 1.85 | --bone     |
| Caption | Raleway        | 300  | 13px                   | --bone-dim |
| Ambient | Raleway        | 200  | 12px                   | --bone-dim |
| Data    | JetBrains Mono | 400  | 11px                   | --violet   |

### Onde cada fonte aparece

| Fonte                     | Onde                                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| Cinzel Decorative         | Logo. Mais nenhum lugar.                                                                                  |
| Cormorant Garamond Italic | Landing headline, toque, scan frases, revelacao, intro de cada secao, share card, labels de input, toasts |
| Cinzel                    | H1/H2/H3, nomes de linhas ("Linha do Coracao"), nomes de montes, tabs                                     |
| Raleway                   | Corpo de texto, botoes, UI geral                                                                          |
| JetBrains Mono            | Badges, metadata, contadores, expiracao, dados tecnicos. Cor padrao: --violet                             |

---

## 3. Assinatura Visual: Corner Ornaments

A assinatura do DS. Componentes branded usam border-radius assimetrico
com corner ornaments desenhados por pseudo-elements.

```css
/* Radius assimetrico: TL reto, TR suave, BR reto, BL suave */
.branded-radius {
  border-radius: 0 6px 0 6px;
}

/* Corner ornaments (aplicar no componente) */
.corner-ornaments {
  position: relative;
}
.corner-ornaments::before {
  content: "";
  position: absolute;
  top: -1px;
  left: -1px;
  width: 8px;
  height: 8px;
  border-top: 1px solid rgba(201, 162, 74, 0.25);
  border-left: 1px solid rgba(201, 162, 74, 0.25);
}
.corner-ornaments::after {
  content: "";
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-bottom: 1px solid rgba(201, 162, 74, 0.25);
  border-right: 1px solid rgba(201, 162, 74, 0.25);
}

/* Hover: ornaments expandem */
.corner-ornaments:hover::before,
.corner-ornaments:hover::after {
  width: 12px;
  height: 12px;
}
```

### Quando usar corner ornaments

- SIM: botoes, badges, cards, toasts, inputs (componentes de marca)
- NAO: toggles, tooltips, avatares (elementos de sistema, usam radius arredondado)

### Sistema dual de border-radius

| Radius                  | Componentes                           |
| ----------------------- | ------------------------------------- |
| 0 6px 0 6px + ornaments | Botoes, badges, cards, toasts, inputs |
| 8px                     | Tooltips, tabs container              |
| 12px                    | Toggle                                |
| 50%                     | Avatar, progress dot                  |

---

## 4. Componentes

### 4.1 Button

**Variantes:** primary, secondary, ghost, icon
**Tamanhos:** sm, default, lg

```tsx
// Props do componente
interface ButtonProps {
  variant: "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**CSS por variante:**

PRIMARY:

```css
.btn-primary {
  background: linear-gradient(160deg, #1e1838, #2a2150, #1e1838);
  color: var(--bone);
  font-family: "Raleway", sans-serif;
  font-weight: 400;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 16px 40px;
  border-radius: 0 6px 0 6px;
  border: none;
  cursor: pointer;
  box-shadow:
    0 0 0 1px rgba(201, 162, 74, 0.1),
    0 0 24px rgba(123, 107, 165, 0.12),
    0 0 48px rgba(123, 107, 165, 0.04);
  transition: all 0.3s ease;
  /* + corner ornaments via pseudo-elements */
}
.btn-primary:hover {
  box-shadow:
    0 0 0 1px rgba(201, 162, 74, 0.2),
    0 0 32px rgba(123, 107, 165, 0.2),
    0 0 56px rgba(123, 107, 165, 0.08);
}
```

SECONDARY:

```css
.btn-secondary {
  background: transparent;
  color: var(--bone);
  border: 1px solid rgba(201, 162, 74, 0.1);
  border-radius: 0 6px 0 6px;
  box-shadow: 0 0 12px rgba(123, 107, 165, 0.06);
  /* mesma tipografia do primary */
}
.btn-secondary:hover {
  background: rgba(123, 107, 165, 0.06);
}
```

GHOST:

```css
.btn-ghost {
  background: transparent;
  border: none;
  color: var(--bone-dim);
  /* mesma tipografia */
}
.btn-ghost:hover {
  color: var(--gold);
}
```

ICON:

```css
.btn-icon {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(201, 162, 74, 0.08);
  border-radius: 0 4px 0 4px;
  background: transparent;
  color: var(--bone);
  display: flex;
  align-items: center;
  justify-content: center;
  /* corner ornaments 6px */
}
```

TAMANHOS:
| Size | Padding | Font |
|------|---------|------|
| sm | 12px 28px | 9px |
| default | 16px 40px | 10px |
| lg | 20px 52px | 11px |

DISABLED:

```css
.btn-disabled {
  opacity: 0.2;
  pointer-events: none;
  box-shadow: none;
}
```

---

### 4.2 Input

```tsx
interface InputProps {
  label: string; // em Cormorant italic (voz da cigana)
  placeholder?: string; // em Cormorant italic, violet dim
  type?: "text" | "email" | "password";
  error?: string;
}
```

```css
.input-wrapper {
  position: relative;
}
.input-label {
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  font-size: 14px;
  color: var(--bone-dim);
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.input-field {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(123, 107, 165, 0.1);
  border-radius: 0;
  color: var(--bone);
  font-family: "Raleway", sans-serif;
  font-size: 15px;
  padding: 12px 0;
  outline: none;
}
.input-field::placeholder {
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  color: var(--violet-dim);
}
/* Focus: linha animada rose>violet no bottom */
.input-field:focus {
  border-bottom-color: transparent;
}
.input-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--rose), var(--violet));
  transition: width 0.4s ease;
}
.input-field:focus ~ .input-accent-line {
  width: 100%;
}
/* Erro */
.input-error {
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  color: var(--rose);
  margin-top: 6px;
}
```

TEXTAREA: excecao, border 1px em todos os lados.

---

### 4.3 Badge

```tsx
interface BadgeProps {
  variant: "gold" | "rose" | "violet" | "bone";
  icon?: string; // icone planetario unicode (opcional)
  children: string;
}
```

```css
.badge {
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 14px;
  border-radius: 0 4px 0 4px;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* + corner ornaments micro 4px */
}
.badge-gold {
  background: rgba(201, 162, 74, 0.06);
  color: var(--gold);
}
.badge-rose {
  background: rgba(196, 100, 122, 0.06);
  color: var(--rose);
}
.badge-violet {
  background: rgba(123, 107, 165, 0.06);
  color: var(--violet);
}
.badge-bone {
  background: rgba(232, 223, 208, 0.06);
  color: var(--bone-dim);
}
```

Icones planetarios por linha:

- Coracao: ♀ (Venus, U+2640)
- Cabeca: ☿ (Mercurio, U+263F)
- Vida: ☉ (Sol, U+2609)
- Destino: ♅ (Saturno, U+2645)

---

### 4.4 Card

```tsx
interface CardProps {
  accentColor?: "gold" | "rose" | "violet" | "bone";
  children: React.ReactNode;
}
```

```css
.card {
  background: var(--deep);
  border-radius: 0 6px 0 6px;
  position: relative;
  overflow: hidden;
  /* + corner ornaments on hover */
}
/* Grain texture via SVG filter */
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,..."); /* SVG feTurbulence 2% noise */
  opacity: 0.02;
  pointer-events: none;
}
/* Borda ornamental interna */
.card-inner {
  border: 1px solid rgba(201, 162, 74, 0.04);
  margin: 5px;
  padding: 20px;
}
/* Accent line no topo (cor da linha) */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
}
.card-accent-gold {
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}
.card-accent-rose {
  background: linear-gradient(90deg, transparent, var(--rose), transparent);
}
.card-accent-violet {
  background: linear-gradient(90deg, transparent, var(--violet), transparent);
}
```

### Card de Leitura (EXCLUSIVO: usa parchment)

```css
.reading-card {
  background: var(--parchment);
  /* mesmo grain, borda ornamental, corner ornaments */
}
```

---

### 4.5 Toast

```tsx
interface ToastProps {
  variant: "gold" | "rose" | "violet";
  icon: string; // icone planetario
  message: string; // voz da cigana
  detail?: string; // detalhe tecnico
}
```

```css
.toast {
  background: var(--deep);
  border-left: 2px solid; /* cor da variante */
  border-radius: 0 6px 0 6px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  /* grain texture */
}
.toast-gold {
  border-left-color: var(--gold);
}
.toast-rose {
  border-left-color: var(--rose);
}
.toast-violet {
  border-left-color: var(--violet);
}
.toast-icon {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(201, 162, 74, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.toast-message {
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  font-size: 16px;
  color: var(--bone);
  letter-spacing: 0.02em;
}
.toast-detail {
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  color: var(--violet);
  margin-top: 4px;
}
```

Mensagens SEMPRE na voz da cigana:

- SIM: "Eu terminei de ler. Voce quer saber?"
- NAO: "Sua leitura esta pronta."

---

### 4.6 Tabs

```css
.tabs-container {
  border-radius: 8px;
  display: flex;
  gap: 0;
}
.tab {
  font-family: "Cinzel", serif;
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 12px 20px;
  border-bottom: 2px solid transparent;
  color: var(--bone-dim);
  cursor: pointer;
  transition: all 0.3s;
}
.tab-active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}
```

---

### 4.7 Toggle

```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--smoke);
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}
.toggle-active {
  background: var(--violet);
}
.toggle-knob {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bone);
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
}
.toggle-active .toggle-knob {
  transform: translateX(20px);
}
```

---

### 4.8 Progress Bar

```css
.progress {
  height: 2px;
  background: rgba(123, 107, 165, 0.08);
  border-radius: 1px;
  overflow: visible;
  position: relative;
}
.progress-fill {
  height: 100%;
  border-radius: 1px;
  transition: width 0.5s ease;
  position: relative;
}
.progress-fill-gold {
  background: var(--gold);
}
.progress-fill-rose {
  background: var(--rose);
}
.progress-fill-violet {
  background: var(--violet);
}
/* Dot indicator na ponta */
.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: absolute;
  right: -3px;
  top: -2px;
  box-shadow: 0 0 8px currentColor;
}
```

---

### 4.9 Separadores

```css
/* Thin: entre blocos internos */
.separator-thin {
  height: 1px;
  background: rgba(201, 162, 74, 0.04);
}
/* Gold gradient: entre secoes */
.separator-gold {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 162, 74, 0.12),
    transparent
  );
}
/* Ornamental: entre secoes grandes */
.separator-ornamental {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.separator-ornamental::before,
.separator-ornamental::after {
  content: "";
  flex: 1;
  max-width: 80px;
  height: 1px;
}
.separator-ornamental::before {
  background: linear-gradient(90deg, transparent, var(--gold-dim));
}
.separator-ornamental::after {
  background: linear-gradient(270deg, transparent, var(--gold-dim));
}
/* Losango central */
.separator-diamond {
  width: 4px;
  height: 4px;
  background: var(--gold);
  transform: rotate(45deg);
}
/* Rose gradient: tensao, negacao */
.separator-rose {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(196, 100, 122, 0.15),
    transparent
  );
}
```

---

### 4.10 Tooltip

```css
.tooltip {
  background: var(--surface-up);
  border-radius: 8px; /* sistema, nao branded */
  padding: 8px 12px;
  font-family: "Raleway", sans-serif;
  font-size: 12px;
  color: var(--bone-dim);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
```

---

## 5. Textura e Atmosfera

### Grain

Todo fundo escuro tem grain sutil via SVG feTurbulence filter, 2-3% opacity.
Aplicar como pseudo-element ::before com pointer-events: none.

### Animacoes

- SEMPRE lentas e sutis. A marca respira devagar.
- Transitions: 0.3s ease minimo.
- Animacoes de loop: 5s+ (estrelas, particulas).
- Proibido: sombras duras, glow neon, blur exagerado.

### Estrelas de fundo

- Particulas de 1.5px, cor gold, animacao pulsante de 5s.
- Poucas e lentas. APENAS no hero da landing.

### Cursor cristal (desktop only)

- Cursor custom em formato de cristal/losango.
- Trail sutil em gold dim.

---

## 6. Espacamento

| Token       | Valor | Uso                      |
| ----------- | ----- | ------------------------ |
| --space-xs  | 4px   | Micro gaps               |
| --space-sm  | 8px   | Entre elementos internos |
| --space-md  | 16px  | Padding padrao           |
| --space-lg  | 24px  | Entre componentes        |
| --space-xl  | 40px  | Entre secoes             |
| --space-2xl | 64px  | Entre blocos grandes     |

---

## 7. Proibicoes

- NUNCA usar border-radius arredondado em componentes branded (botoes, cards, badges, toasts)
- NUNCA usar parchment como fundo de UI generica
- NUNCA usar Cinzel Decorative fora do logo
- NUNCA usar emojis (usar simbolos planetarios unicode)
- NUNCA usar sombras duras ou glow neon
- NUNCA usar cores vibrantes, neon, pastel
- NUNCA usar interface clara/branca/clean
- NUNCA criar componentes fora deste DS sem aprovacao
