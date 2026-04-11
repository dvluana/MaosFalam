# PROMPT: Auditar e Implementar Fluxo de Mão Dominante

## CONTEXTO

O MãosFalam pede foto da palma pra leitura de quiromancia. Na quiromancia, a mão dominante (a que a pessoa escreve) é a que revela o presente e as escolhas. A não-dominante revela o potencial nato.

O MVP lê APENAS a mão dominante. Uma mão. Mas hoje o código não pergunta qual mão a pessoa usa, não instrui qual mão mostrar, e o MediaPipe não valida se é a mão correta.

## TAREFA 1: AUDITORIA

Antes de qualquer mudança, faz uma auditoria completa:

### 1.1 Buscar no código inteiro

```bash
# Procurar qualquer referência a mão direita/esquerda, dominante, hand side
grep -r "right.*hand\|left.*hand\|dominant\|direita\|esquerda\|destra\|canhot" src/ --include="*.ts" --include="*.tsx" -l
```

### 1.2 Verificar o MediaPipe

Olhar em `src/` qualquer arquivo que usa MediaPipe Hand Landmarker ou hand detection:

- O MediaPipe retorna `handedness` (left/right) no resultado. O código usa esse dado?
- Existe algum check de qual mão foi detectada?
- O hand landmarker tá configurado pra detectar 1 mão ou 2?

### 1.3 Verificar os tipos

Olhar `src/types/hand-attributes.ts` (ou equivalente):

- Existe campo `dominant_hand` ou `handedness`?
- O prompt do GPT-4o menciona qual mão é?

### 1.4 Verificar o fluxo de câmera

Olhar `src/app/ler/camera/page.tsx` e componentes de câmera:

- Existe pergunta sobre dominância antes de abrir a câmera?
- Existe instrução de qual mão mostrar?
- O feedback do MediaPipe diferencia mão esquerda de direita?

### 1.5 Verificar mocks

Olhar `src/mocks/hand-attributes.ts` (ou equivalente):

- Os mocks incluem informação de qual mão?

### Entregar auditoria

Reportar em formato:

```
AUDITORIA: FLUXO DE MÃO DOMINANTE

MediaPipe handedness usado: SIM/NÃO
Tipo HandAttributes tem dominant_hand: SIM/NÃO
Prompt GPT-4o menciona mão: SIM/NÃO
Câmera pergunta dominância: SIM/NÃO
Câmera instrui qual mão: SIM/NÃO
MediaPipe valida mão correta: SIM/NÃO
Mocks têm handedness: SIM/NÃO

GAPS ENCONTRADOS:
1. ...
2. ...
3. ...
```

## TAREFA 2: IMPLEMENTAR (depois da auditoria)

> A auditoria mostrou que NADA existe. Tudo precisa ser construído do zero.
> Ler `.claude/skills/brand/SKILL.md` e `docs/DS.md` ANTES de criar qualquer componente.

### 2.1 Tipo HandAttributes

Adicionar campo em `src/types/hand-attributes.ts` (ou criar se não existir):

```typescript
export interface HandAttributes {
  dominant_hand: "right" | "left";
  // ... resto dos campos existentes
}
```

---

### 2.2 Pergunta de dominância em `/ler/nome`

A tela `/ler/nome` já tem campos (nome, email, gênero). Adicionar dominância como mais um campo.

**Design:**

```
[campo] Nome
[campo] Email
[Ela] [Ele]               ← gênero (já existe)
[Destra] [Canhota]         ← NOVO
□ Quero receber novidades  ← opt-in (já existe)
[Continuar]
```

**Componente:**

- Dois botões toggle (mesmo padrão visual do Ela/Ele)
- Labels: "Destra" e "Canhota" (não "Direita/Esquerda" porque é sobre dominância, não sobre a mão em si)
- Default: nenhum selecionado (obriga a escolher)
- Salvar no sessionStorage: `maosfalam_dominant_hand: 'right' | 'left'`
- "Destra" salva `'right'`, "Canhota" salva `'left'`

**Regras de estilo:**

- Mesmo tamanho e espaçamento dos botões Ela/Ele
- Cores do DS: border `gold/10`, text `bone`, active state com `violet/5` ou `gold/5`
- Corner ornaments branded (0 6px 0 6px), não border-radius arredondado
- Font: Raleway 400, 10px, uppercase, tracking 0.06em (padrão dos botões do DS)

---

### 2.3 Instrução na câmera

**Estado: ANTES de abrir o viewfinder**

Criar um estado intermediário na câmera entre a escolha de método (câmera/upload) e o viewfinder ativo. Esse estado mostra a instrução de qual mão posicionar.

```
┌─────────────────────────────┐
│                             │
│     [ilustração de mão]     │
│     (outline SVG espelhado  │
│      conforme dominância)   │
│                             │
│   "Me mostra a mão direita. │
│    Palma aberta,            │
│    virada pra mim."         │
│                             │
│       [ Abrir câmera ]      │
│                             │
└─────────────────────────────┘
```

**Componente: `HandInstructionOverlay`**

```typescript
interface HandInstructionOverlayProps {
  dominantHand: "right" | "left";
  onReady: () => void;
}
```

**Regras:**

- Frase em Cormorant Garamond italic, cor bone, letter-spacing .02em
- Se `right`: "Me mostra a mão direita. Palma aberta, virada pra mim."
- Se `left`: "Me mostra a mão esquerda. Palma aberta, virada pra mim."
- Outline SVG da mão: espelhar horizontalmente conforme dominância (mão direita = palma voltada pro viewer com polegar à esquerda; mão esquerda = espelha)
- Se já existe um outline SVG de mão no código da câmera, reutilizar e espelhar com `transform: scaleX(-1)` conforme o caso
- Botão "Abrir câmera" no padrão do DS (btn-primary com corner ornaments)
- Fundo: black (#08050E) com grain sutil

**Estado: DURANTE o viewfinder (overlay)**

Depois que a câmera abre, manter um badge discreto indicando qual mão é esperada:

```
┌─────────────────────────────┐
│ [MÃO DIREITA]          [×] │
│                             │
│      ┌───────────────┐      │
│      │               │      │
│      │   viewfinder   │      │
│      │               │      │
│      └───────────────┘      │
│                             │
│   "Posicione sua mão..."    │
│          [●]                │
└─────────────────────────────┘
```

**Badge: `HandExpectedBadge`**

- Posição: top-left do viewfinder
- Texto: "MÃO DIREITA" ou "MÃO ESQUERDA"
- Font: JetBrains Mono 7px, letter-spacing 2px, uppercase
- Cor: gold-dim com border gold/10
- Descartável (botão ×) pra não poluir se a pessoa já entendeu

---

### 2.4 Moldura/outline da câmera adaptável

Se existe uma moldura SVG ou outline de mão no viewfinder da câmera:

**Verificar:** a moldura atual é genérica (serve pra qualquer mão) ou é específica (desenhada pra mão direita)?

**Se for específica pra uma mão:**

- Espelhar com `transform: scaleX(-1)` quando a mão esperada for a oposta
- Garantir que a moldura reflete a mão que a pessoa deve posicionar

**Se for genérica (tipo um retângulo ou oval):**

- Não precisa mudar a moldura
- O badge + instrução já são suficientes

**Se não existe moldura:**

- Criar outline SVG simples de palma aberta (5 dedos, contorno fino)
- Cor: gold-dim com opacity 0.15
- Espelhar conforme `dominant_hand`
- Posicionar no centro do viewfinder como guia

---

### 2.5 MediaPipe: validar mão correta

> NOTA: Se o MediaPipe ainda é timer fake, implementar a ESTRUTURA da validação mesmo assim. O check fica desabilitado até o MediaPipe real entrar. Usar flag `MEDIAPIPE_ENABLED = false`.

Quando o MediaPipe estiver ativo, adicionar validação no pipeline:

```typescript
// No hook/pipeline do MediaPipe
const MEDIAPIPE_ENABLED = false; // trocar pra true quando implementar

function validateHandedness(
  mediapipeResult: HandLandmarkerResult,
  expectedHand: "right" | "left",
  isFrontCamera: boolean,
): { valid: boolean; detectedHand: "right" | "left" | null } {
  if (!MEDIAPIPE_ENABLED || !mediapipeResult.handedness?.[0]) {
    return { valid: true, detectedHand: null }; // skip validation
  }

  const detected = mediapipeResult.handedness[0][0]?.categoryName; // 'Left' | 'Right'

  // ESPELHAMENTO: câmera frontal inverte
  const actualHand = isFrontCamera
    ? detected === "Left"
      ? "right"
      : "left"
    : detected === "Left"
      ? "left"
      : "right";

  return {
    valid: actualHand === expectedHand,
    detectedHand: actualHand,
  };
}
```

---

### 2.6 Feedback da cigana: mão errada

**Componente: `WrongHandFeedback`**

Aparece como toast/overlay quando o MediaPipe detecta a mão errada.

```typescript
interface WrongHandFeedbackProps {
  expectedHand: "right" | "left";
  visible: boolean;
}
```

**Comportamento:**

- Aparece com fade-in suave (Framer Motion, 300ms)
- Texto: "Essa é a outra mão. Me mostra a [direita/esquerda]."
- Font: Cormorant Garamond italic, cor bone
- Background: deep (#110C1A) com opacity 0.9
- Posição: bottom do viewfinder, acima do botão de captura
- Desaparece sozinho em 3 segundos OU quando a pessoa trocar a mão
- **NÃO bloqueia a captura.** É aviso, não barreira. Edge cases: amputação, deficiência, a pessoa sabe o que tá fazendo.

**Cenários de erro adicionais pra tratar:**

| Cenário                             | Feedback da cigana                                        | Comportamento                         |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| Mão errada detectada                | "Essa é a outra mão. Me mostra a [direita/esquerda]."     | Toast 3s, não bloqueia                |
| Duas mãos detectadas                | "Uma mão de cada vez. Me mostra só a [direita/esquerda]." | Toast 3s, não captura enquanto 2 mãos |
| Nenhuma mão detectada               | "Preciso ver sua mão. Posiciona no centro."               | (já existe no fluxo atual)            |
| Mão fechada                         | "Abre mais os dedos. Preciso ver as linhas."              | (já existe no fluxo atual)            |
| Palma virada pro outro lado (dorso) | "Vira a mão. Preciso ver a palma."                        | Toast 3s, não captura                 |

**O feedback de "dorso da mão" pode ser detectado via MediaPipe:** se os landmarks dos dedos estão na orientação oposta (pontas abaixo das bases), provavelmente é o dorso. Implementar se viável, senão deixar como TODO.

---

### 2.7 Fluxo de upload da galeria (COMPLETO)

O upload é o segundo método de entrada (além da câmera ao vivo). A pessoa escolhe uma foto da galeria em vez de tirar na hora. Isso é mais complexo que a câmera porque não tem MediaPipe em tempo real pra validar antes da captura. Toda validação acontece DEPOIS que a foto é selecionada.

#### 2.7.1 Tela de escolha de método

A câmera já deve ter um estado `method_choice` (ou equivalente) onde a pessoa escolhe entre câmera e upload. Se não existir, criar.

```
┌─────────────────────────────┐
│                             │
│   "Como você quer me        │
│    mostrar sua mão?"        │
│                             │
│   [ 📷 Tirar foto agora ]   │
│                             │
│   [ 📁 Enviar da galeria ]  │
│                             │
│   Cormorant italic, bone    │
└─────────────────────────────┘
```

- "Tirar foto agora" → vai pro HandInstructionOverlay → câmera ao vivo
- "Enviar da galeria" → vai pro fluxo de upload abaixo

#### 2.7.2 Instrução ANTES do file picker

Antes de abrir o seletor de arquivos, mostrar instrução de qual foto enviar:

```
┌─────────────────────────────┐
│                             │
│   [outline SVG mão direita] │
│                             │
│   "Escolhe uma foto da sua  │
│    mão [direita/esquerda].  │
│    Palma aberta, de frente, │
│    com boa iluminação."     │
│                             │
│   ⚠ Dicas:                  │
│   · Foto nítida, sem blur   │
│   · Palma inteira visível   │
│   · Fundo contrastante      │
│   · Sem filtros             │
│                             │
│   [ Escolher foto ]         │
│                             │
└─────────────────────────────┘
```

**Componente: `UploadInstructionScreen`**

```typescript
interface UploadInstructionScreenProps {
  dominantHand: "right" | "left";
  onSelectFile: () => void;
}
```

- Outline SVG espelhado conforme dominância (mesmo do HandInstructionOverlay)
- Frase da cigana em Cormorant italic
- Dicas em Raleway 300, cor bone-dim, lista sem bullet (middot ou ornament)
- Botão "Escolher foto" abre `<input type="file" accept="image/*">`
- Accept: `image/jpeg, image/png, image/webp, image/heic` (HEIC é padrão iPhone)

#### 2.7.3 Validação da foto enviada (pipeline)

Depois que a pessoa seleciona a foto, rodar um pipeline de validação ANTES de enviar pro server/GPT-4o:

**Componente: `UploadValidationScreen`**

```
┌─────────────────────────────┐
│                             │
│   [preview da foto]         │
│                             │
│   "Deixa eu olhar..."      │
│   (loading com frase cigana)│
│                             │
│   ✓ Checando qualidade...   │
│   ✓ Procurando sua mão...   │
│   ○ Verificando posição...  │
│                             │
└─────────────────────────────┘
```

**Checks na ordem (client-side):**

```typescript
interface UploadValidation {
  step: string;
  status: "pending" | "checking" | "passed" | "failed";
  message?: string;
}

const VALIDATION_STEPS: UploadValidation[] = [
  // CHECK 1: Formato e tamanho
  {
    step: "format",
    // Aceita: JPEG, PNG, WebP, HEIC
    // Rejeita: GIF, SVG, BMP, TIFF, PDF
    // Tamanho mínimo: 500KB (fotos muito pequenas = print/screenshot = baixa qualidade)
    // Tamanho máximo: 20MB
    // Dimensão mínima: 640×480px
  },

  // CHECK 2: Qualidade da imagem
  {
    step: "quality",
    // Carregar no canvas e analisar:
    // - Brightness: média dos pixels > threshold (não muito escura)
    // - Contrast: desvio padrão dos pixels > threshold (não lavada/cinza uniforme)
    // - Blur detection: Laplacian variance (se muito baixa = foto borrada)
    // Não precisa ser perfeito. MediaPipe no server pode fazer check mais robusto depois.
  },

  // CHECK 3: Detecção de mão via MediaPipe (se MEDIAPIPE_ENABLED)
  {
    step: "hand_detection",
    // Rodar MediaPipe Hand Landmarker na imagem estática
    // MediaPipe funciona em imagens estáticas, não só video
    // Verificar: pelo menos 1 mão detectada
  },

  // CHECK 4: Handedness (se MediaPipe detectou mão)
  {
    step: "handedness",
    // Verificar se é a mão dominante esperada
    // Mesmo tratamento de espelhamento: foto de galeria NÃO é espelhada
    // (diferente da câmera frontal que espelha)
    // Foto da galeria: MediaPipe "Left" = mão esquerda real
  },

  // CHECK 5: Palma aberta (se MediaPipe detectou mão)
  {
    step: "palm_open",
    // Verificar via landmarks se dedos estão abertos
    // Mesmo check da câmera ao vivo
  },
];
```

**IMPORTANTE sobre espelhamento no upload:**
Fotos da galeria NÃO são espelhadas (diferente da câmera frontal ao vivo). Portanto:

- MediaPipe "Left" na foto = mão esquerda real da pessoa
- MediaPipe "Right" na foto = mão direita real da pessoa
- NÃO aplicar inversão de espelhamento

**IMPORTANTE sobre MediaPipe em imagem estática:**
O MediaPipe Hand Landmarker funciona tanto em vídeo (câmera) quanto em imagem estática. Pra imagem estática, usar `detectForImage()` em vez de `detectForVideo()`. Mesmo modelo, mesma precisão, mas processa 1 frame só.

Se `MEDIAPIPE_ENABLED = false`, pular checks 3, 4, 5 e ir direto pra confirmação.

#### 2.7.4 Cenários de erro no upload

| Cenário                           | Detecção                                                        | Feedback da cigana                                                         | Ação                                                  |
| --------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Formato inválido (GIF, SVG, PDF)  | Check 1: extensão/MIME                                          | "Preciso de uma foto de verdade. Manda em JPG ou PNG."                     | Volta pro file picker                                 |
| Arquivo muito pequeno (<500KB)    | Check 1: file.size                                              | "Essa foto tá muito pequena. Preciso ver com mais detalhe."                | Volta pro file picker                                 |
| Arquivo muito grande (>20MB)      | Check 1: file.size                                              | "Essa foto tá pesada demais. Tenta uma menor."                             | Volta pro file picker                                 |
| Dimensão muito pequena (<640×480) | Check 1: image.width/height                                     | "Essa imagem tá muito pequena. Preciso de mais resolução."                 | Volta pro file picker                                 |
| Foto muito escura                 | Check 2: brightness                                             | "Tá muito escuro. Preciso de uma foto com mais luz."                       | Mostra preview + botão "Tentar outra"                 |
| Foto muito borrada                | Check 2: blur                                                   | "Tá embaçada. Preciso de uma foto nítida."                                 | Mostra preview + botão "Tentar outra"                 |
| Nenhuma mão detectada             | Check 3: MediaPipe 0 hands                                      | "Não achei sua mão nessa foto. Manda outra com a palma bem visível."       | Mostra preview + botão "Tentar outra"                 |
| Mão errada detectada              | Check 4: handedness                                             | "Essa parece ser a outra mão. Me mostra a [direita/esquerda]."             | Mostra preview + "Tentar outra" OU "Usar mesmo assim" |
| Duas mãos na foto                 | Check 3: MediaPipe 2 hands                                      | "Uma mão de cada vez. Manda uma foto só da [direita/esquerda]."            | Mostra preview + botão "Tentar outra"                 |
| Mão fechada                       | Check 5: landmarks                                              | "Os dedos tão fechados. Preciso ver a palma aberta."                       | Mostra preview + botão "Tentar outra"                 |
| Dorso da mão (possível)           | Check 5: landmark orientation                                   | "Essa é a parte de trás da mão. Vira e manda de novo."                     | Mostra preview + botão "Tentar outra"                 |
| Foto é screenshot/print           | Check 2: dimensões atípicas (ex: 1170×2532 = screenshot iPhone) | "Isso parece um print, não uma foto. Preciso de uma foto real da sua mão." | Mostra preview + botão "Tentar outra"                 |
| Foto tem filtro pesado            | Difícil detectar, baixa prioridade                              | —                                                                          | Deixar passar, GPT-4o lida                            |

#### 2.7.5 Tela de confirmação pós-validação

Se todos os checks passaram:

```
┌─────────────────────────────┐
│                             │
│   [preview da foto]         │
│   (com overlay dos          │
│    landmarks se MediaPipe   │
│    detectou)                │
│                             │
│   ✓ Foto nítida             │
│   ✓ Mão [direita] detectada │
│   ✓ Palma aberta            │
│                             │
│   "Essa foto é da sua mão   │
│    [direita/esquerda]?"     │
│                             │
│   [Sim, pode ler]           │
│   [Não, vou trocar]         │
│                             │
└─────────────────────────────┘
```

**Componente: `UploadConfirmScreen`**

```typescript
interface UploadConfirmScreenProps {
  imageUrl: string;
  dominantHand: "right" | "left";
  validationResults: UploadValidation[];
  landmarks?: HandLandmarkerResult; // se MediaPipe rodou
  onConfirm: () => void;
  onRetry: () => void;
}
```

- Preview da foto com borda branded (corner ornaments)
- Se MediaPipe rodou: overlay sutil dos landmarks sobre a foto (linhas gold-dim finas conectando os pontos da mão). Isso dá confiança visual de que "a IA tá vendo a mão". Mas NÃO mencionar IA/tecnologia. É sutil, visual, sem texto explicativo.
- Checklist de validação com ✓ em gold, texto em bone, JetBrains Mono 8px
- Pergunta de confirmação em Cormorant italic
- "Sim, pode ler" → envia pro server (ou pro mock/scan)
- "Não, vou trocar" → volta pro file picker

#### 2.7.6 Se checks parcialmente falharam

Se checks de qualidade falharam mas a mão foi detectada (ex: foto um pouco escura mas mão visível):

```
┌─────────────────────────────┐
│                             │
│   [preview da foto]         │
│                             │
│   ✓ Mão detectada           │
│   ⚠ Foto um pouco escura    │
│                             │
│   "Dá pra ler, mas a luz    │
│    tá fraca. O resultado    │
│    pode ficar incompleto."  │
│                             │
│   [Usar essa mesmo]         │
│   [Escolher outra]          │
│                             │
└─────────────────────────────┘
```

Aviso honesto, não bloqueio. A pessoa decide. Se usar, o `confidence` do GPT-4o vai refletir a qualidade menor e o relatório pode ter menos detalhes (sinais raros podem não ser detectados).

#### 2.7.7 Fluxo visual completo do upload

```
method_choice
  → "Enviar da galeria"
  → UploadInstructionScreen (instrução + dicas + outline mão)
  → File picker nativo do browser
  → UploadValidationScreen (loading + checks 1-5)
      → Se TODOS falharam: erro + "Tentar outra"
      → Se PARCIAL: aviso + "Usar mesmo" / "Trocar"
      → Se OK: UploadConfirmScreen (preview + confirmação)
  → "Sim, pode ler"
  → Scan/processamento (mesmo fluxo da câmera daqui pra frente)
```

---

### 2.8 Edge Cases e Cenários Não-Óbvios

Tratar TODOS os cenários abaixo. Se não der pra resolver no MVP, deixar como TODO com fallback funcional.

#### HEIC (fotos de iPhone)

iPhones desde iOS 11 salvam fotos em HEIC por default. Browsers não suportam HEIC nativamente. O `<canvas>`, `<img>`, e o MediaPipe não processam HEIC.

**Solução:** Instalar `heic2any` (npm). Quando o file picker retornar HEIC/HEIF, converter pra JPEG antes de qualquer processamento.

```typescript
import heic2any from "heic2any";

async function normalizeImage(file: File): Promise<Blob> {
  if (file.type === "image/heic" || file.type === "image/heif" || file.name.endsWith(".heic")) {
    return (await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 })) as Blob;
  }
  return file;
}
```

Chamar `normalizeImage()` como PRIMEIRO passo do pipeline de upload, antes de qualquer check.

#### Câmera: qual abre por default

Câmera TRASEIRA como default. Motivo: mais resolução, sem espelhamento, melhor pra foto de palma (a pessoa olha pro celular e posiciona a mão na frente).

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: { ideal: "environment" } }, // traseira
});
```

Botão pra trocar pra frontal (ícone de câmera com setas). Se trocar pra frontal, ativar lógica de espelhamento no MediaPipe.

Guardar `isFrontCamera` no state pra o validateHandedness saber se precisa inverter.

#### Câmera: permissão negada

Se `getUserMedia` falhar (NotAllowedError, NotFoundError):

```typescript
try {
  stream = await navigator.mediaDevices.getUserMedia({ video: ... });
} catch (err) {
  if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
    // Vai direto pro upload
    setState('upload_fallback');
  }
}
```

Feedback da cigana: "Tudo bem. Me manda uma foto então."

Mostrar UploadInstructionScreen como fallback, não tela de erro genérica.

#### EXIF rotation (foto de lado)

Fotos de celular podem ter rotação EXIF (portrait 90°, landscape, invertida). O `<img>` moderno corrige, mas `canvas.drawImage()` nem sempre.

**Solução:** Antes de processar no canvas, ler EXIF e aplicar rotação:

```typescript
// Opção 1: Usar createImageBitmap (browsers modernos corrigem EXIF automaticamente)
const bitmap = await createImageBitmap(file);
ctx.drawImage(bitmap, 0, 0);

// Opção 2: Se createImageBitmap não corrigir, usar lib 'blueimp-load-image' ou ler EXIF manual
```

Testar com fotos tiradas em portrait e landscape antes de considerar pronto.

#### Compressão antes do envio

A foto pode ter 5-15MB. Enviar como base64 pro server dobra o tamanho (~20MB em base64). Comprimir no client:

```typescript
function compressImage(canvas: HTMLCanvasElement, maxWidth = 1280): string {
  // Redimensionar se maior que maxWidth
  if (canvas.width > maxWidth) {
    const ratio = maxWidth / canvas.width;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = maxWidth;
    tempCanvas.height = canvas.height * ratio;
    tempCanvas.getContext("2d")!.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL("image/jpeg", 0.85);
  }
  return canvas.toDataURL("image/jpeg", 0.85);
}
```

Target: imagem final ~200-500KB. Suficiente pro GPT-4o com `detail: 'high'`. Economiza banda e custo.

#### Orientação do celular (landscape)

Se a pessoa segura o celular na horizontal, a moldura/outline portrait não funciona.

**Solução simples:** Travar orientação em portrait via CSS/JS:

```typescript
// Tentar travar (nem todos browsers suportam)
screen.orientation?.lock?.("portrait").catch(() => {});
```

Se não conseguir travar: detectar orientação e mostrar aviso "Vira o celular pra vertical" antes de continuar. Não abrir câmera em landscape.

#### Mão com acessórios

Anéis, pulseiras, relógio, unhas longas, henna, tatuagem. O MediaPipe lida ok. Mas o GPT-4o pode confundir henna/tatuagem com linhas.

Adicionar no prompt do GPT-4o:

```
"Ignore tatuagens, henna, nail art, anéis, pulseiras e qualquer acessório visível. Analise APENAS as linhas naturais da palma, montes, e sinais quiromânticos."
```

#### Leitura pra outra pessoa: dominância da OUTRA pessoa

No fluxo "Nova leitura > Pra outra pessoa", o sessionStorage tem `maosfalam_dominant_hand` da DONA da conta, não da pessoa sendo lida.

**Solução:** Quando é leitura pra outra pessoa, perguntar a dominância DE NOVO no formulário de "Pra quem é essa leitura":

```
Nome: [campo]
Gênero: [Ela] [Ele]
Mão dominante: [Destra] [Canhota]    ← pergunta pra ESTA pessoa
```

Salvar como `maosfalam_target_dominant_hand` ou sobrescrever `maosfalam_dominant_hand` temporariamente (resetar pra dominância da dona depois).

#### Upload de foto que não é mão (MediaPipe desabilitado)

Se `MEDIAPIPE_ENABLED = false`, qualquer foto passa pro server. O GPT-4o retorna `confidence < 0.3` pra foto sem mão.

**Solução:** Tratar no retorno do server. Se confidence < 0.3:

Cigana: "Não consegui ver sua mão nessa foto. Tenta de novo."

Redirecionar pra tela de erro de leitura (já deve existir no fluxo).

Não é ideal (gastou 1 chamada GPT-4o à toa), mas é fallback funcional até o MediaPipe real entrar.

#### Retry excessivo

Depois de 3 tentativas frustradas (câmera ou upload), a pessoa tá frustrada.

**Solução:** Contar tentativas no state. Depois de 3 falhas:

Cigana: "Tá difícil hoje. Tenta num lugar com mais luz, ou me manda uma foto da galeria."

Se já tá no upload: "Tenta tirar uma foto agora em vez de mandar da galeria. Com boa luz, de frente."

Sugerir trocar de método (câmera ↔ upload). Não bloquear, só sugerir.

#### GPT-4o timeout / erro

O scan (ritual de 10s) disfarça a espera do GPT-4o. Mas se demorar mais:

| Tempo  | Comportamento                                                    |
| ------ | ---------------------------------------------------------------- |
| 0-10s  | Scan normal (frases da cigana, ritual)                           |
| 10-20s | "Tá quase..." + frase extra de suspense                          |
| 20-30s | "Sua mão tá me dizendo bastante coisa..."                        |
| >30s   | Timeout. Cigana: "Algo deu errado. Tenta de novo." + botão retry |

Se o GPT-4o retornar erro HTTP (429, 500, 503):

- 1ª tentativa: retry automático silencioso (a pessoa não vê)
- 2ª tentativa: se falhar de novo, tela de erro com "Tenta de novo daqui a pouco."
- Não mostrar erro técnico. Sempre voz da cigana.

Se retornar JSON malformado:

- Logar o erro com Pino (sem dados pessoais)
- Tratar como confidence 0 → tela de erro

#### Acessibilidade básica

| Componente                    | A11y necessária                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Botões Destra/Canhota         | `aria-label="Selecionar mão dominante direita"` / `role="radio"` + `aria-checked` |
| HandExpectedBadge             | `aria-live="polite"` (anuncia quando aparece)                                     |
| WrongHandFeedback             | `aria-live="assertive"` (anuncia erro imediatamente)                              |
| Outline SVG da mão            | `role="img"` + `aria-label="Guia de posicionamento da mão [direita/esquerda]"`    |
| UploadValidationScreen checks | `aria-live="polite"` nos status dos checks                                        |
| Botão trocar câmera           | `aria-label="Alternar entre câmera frontal e traseira"`                           |

---

### 2.9 Prompt do GPT-4o

Onde existir o prompt que vai junto com a foto pro GPT-4o, adicionar:

```
"Esta é a mão [direita/esquerda] da pessoa. É a mão dominante (a que ela escreve com). Analise considerando a orientação correta da palma. Ignore tatuagens, henna, nail art, anéis, pulseiras e qualquer acessório visível. Analise APENAS as linhas naturais da palma, montes, e sinais quiromânticos."
```

Se o prompt ainda não existe (é mock), criar o arquivo base em `src/server/lib/openai.ts` ou equivalente com o prompt template que inclui essa informação.

---

### 2.9 Mocks

Atualizar TODOS os mocks de HandAttributes pra incluir `dominant_hand`:

```typescript
fire: { dominant_hand: 'right', element: 'fire', /* ... */ },
water: { dominant_hand: 'right', element: 'water', /* ... */ },
earth: { dominant_hand: 'left', element: 'earth', /* ... */ },  // variar pra testar
air: { dominant_hand: 'right', element: 'air', /* ... */ },
```

---

### 2.10 sessionStorage

Salvar a dominância no sessionStorage junto com os outros dados do fluxo:

```typescript
// Em /ler/nome quando a pessoa escolhe
sessionStorage.setItem("maosfalam_dominant_hand", "right"); // ou 'left'

// Na câmera, ler
const dominantHand = sessionStorage.getItem("maosfalam_dominant_hand") as "right" | "left";
```

Guard: se `maosfalam_dominant_hand` não existe no sessionStorage quando a câmera abre, redirecionar pra `/ler/nome`.

---

### 2.11 Fluxo: Leitura pra outra pessoa (FRONT COMPLETO)

Quando a usuária logada com créditos clica "Nova leitura", precisa escolher pra quem é. Todo o fluxo de dominância se repete pra OUTRA PESSOA.

#### 2.11.1 Tela de escolha

```
┌─────────────────────────────┐
│                             │
│   "Pra quem é essa          │
│    leitura?"                │
│                             │
│   [ Pra mim ]               │
│   [ Pra outra pessoa ]      │
│                             │
└─────────────────────────────┘
```

- "Pra mim" → usa nome, gênero, e dominância da conta (já salvos). Vai direto pra câmera.
- "Pra outra pessoa" → vai pro formulário abaixo.

#### 2.11.2 Formulário da outra pessoa

```
┌─────────────────────────────┐
│                             │
│   "Me diz quem eu vou ler." │
│                             │
│   Nome: [campo]             │
│   [Ela] [Ele]               │
│   [Destra] [Canhota]        │
│                             │
│   [ Confirmar 1 crédito ]   │
│                             │
└─────────────────────────────┘
```

**Regras:**

- Todos os 3 campos obrigatórios (nome, gênero, dominância)
- Frase da cigana em Cormorant italic: "Me diz quem eu vou ler."
- Botões Ela/Ele e Destra/Canhota no mesmo padrão do /ler/nome
- Confirmação de crédito antes de continuar (debita ANTES da câmera? NÃO. Debita DEPOIS do resultado. A pessoa pode desistir na câmera.)
- Salvar no sessionStorage como dados TEMPORÁRIOS da leitura:
  ```typescript
  sessionStorage.setItem("maosfalam_target_name", "Carlos");
  sessionStorage.setItem("maosfalam_target_gender", "male");
  sessionStorage.setItem("maosfalam_target_dominant", "right");
  sessionStorage.setItem("maosfalam_is_self", "false");
  ```
- A dominância da dona (maosfalam_dominant_hand) NÃO é sobrescrita. É separada.

#### 2.11.3 Câmera adaptada pra outra pessoa

O fluxo de câmera (instrução, viewfinder, validação) usa os dados da OUTRA PESSOA:

- Instrução: "Me mostra a mão **direita** do **Carlos**. Palma aberta, virada pra mim."
- Badge: "MÃO DIREITA · CARLOS"
- Feedback mão errada: "Essa é a outra mão **dele**. Me mostra a **direita**."
- O nome e gênero adaptam todas as frases da cigana na câmera.

**Lógica de qual dominância usar:**

```typescript
const isSelf = sessionStorage.getItem("maosfalam_is_self") !== "false";
const dominantHand = isSelf
  ? sessionStorage.getItem("maosfalam_dominant_hand")
  : sessionStorage.getItem("maosfalam_target_dominant");
const targetName = isSelf
  ? sessionStorage.getItem("maosfalam_name_fresh")
  : sessionStorage.getItem("maosfalam_target_name");
```

#### 2.11.4 Resultado pra outra pessoa

O resultado usa os dados da outra pessoa:

- Nome: "Carlos" (não o nome da dona)
- Gênero: "male" (concordância "inteiro", "frio", etc.)
- Dominância: a da outra pessoa
- Relatório endereçado ao Carlos em segunda pessoa

A dona da conta vê o relatório do Carlos. Se compartilhar, o link mostra a versão vitrine do Carlos.

No histórico da dona, o card mostra:

```
[Card] Carlos · Terra · 11 abr 2026 · Leitura pra outra pessoa
```

#### 2.11.5 Upload pra outra pessoa

Mesmo fluxo de upload, mas adaptado:

- Instrução: "Escolhe uma foto da mão **direita** do **Carlos**."
- Confirmação: "Essa foto é da mão **direita** do **Carlos**?"

---

### 2.12 Limpeza de gaps conhecidos

O código atual tem mocks, stubs, e hardcodes que conflitam com o fluxo de dominância. Limpar DURANTE a implementação, não depois.

#### NÃO mexer (fora do escopo deste prompt):

- Clerk (itens 3, 4, 6, 7 do inventário) — auth é outro prompt
- AbacatePay (item 2) — pagamento é outro prompt
- Error handling genérico (itens 11, 12) — melhorar mas não é foco

#### LIMPAR agora:

| Item                                   | O que                             | Ação                                                                                                                                                           |
| -------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fallbackName="Marina"                  | Nome hardcoded nos resultados     | Substituir por nome do sessionStorage (`maosfalam_name_fresh` ou `maosfalam_target_name`). Se ambos vazios, usar "Você" como fallback (não um nome inventado). |
| VALID_MOCK_IDS                         | Aceita "fire","demo" como leitura | Manter pra dev mas não expor em produção. Usar `process.env.NODE_ENV === 'development'` pra habilitar.                                                         |
| share_expires_at 2099                  | Hardcoded em 3 arquivos           | Remover. Links não expiram. Se o campo existe no tipo/banco, tornar opcional ou remover. Grep por "2099" e limpar.                                             |
| maosfalam_email escrito mas nunca lido | Dead key no sessionStorage        | Ou usar (enviar junto com a lead pro server) ou remover o setItem. Decisão: USAR — adicionar no payload de captura.                                            |
| login()/register() stubs               | Dead code no useAuth.ts           | Remover stubs. Quando Clerk entrar, substituir. Por agora, remover pra não confundir.                                                                          |
| getVariant sempre "active_free"        | Badge nunca muda                  | Conectar com tier real da reading. Se reading.tier === 'premium', retornar 'active_premium'. Se não, 'active_free'.                                            |

---

## CHECKLIST

### Dados e tipos

- [ ] `HandAttributes` tem campo `dominant_hand: 'right' | 'left'`
- [ ] Mocks atualizados com `dominant_hand`
- [ ] sessionStorage salva e lê `maosfalam_dominant_hand`

### Front-end: tela /ler/nome

- [ ] Botões [Destra] [Canhota] no formulário
- [ ] Mesmo padrão visual dos botões Ela/Ele
- [ ] Obrigatório selecionar antes de continuar
- [ ] Salva no sessionStorage

### Front-end: escolha de método (câmera vs upload)

- [ ] Tela method_choice existe com 2 opções claras
- [ ] "Tirar foto agora" → HandInstructionOverlay → câmera
- [ ] "Enviar da galeria" → UploadInstructionScreen → file picker

### Front-end: tela câmera (ao vivo)

- [ ] HandInstructionOverlay ANTES do viewfinder
- [ ] Frase da cigana muda conforme dominância
- [ ] Outline SVG de mão espelhado conforme dominância
- [ ] HandExpectedBadge durante viewfinder ("MÃO DIREITA/ESQUERDA")
- [ ] Badge descartável com botão ×
- [ ] Moldura/outline espelhada se for específica de mão

### Front-end: fluxo upload (galeria)

- [ ] UploadInstructionScreen com instrução de qual mão + dicas de qualidade
- [ ] Outline SVG espelhado conforme dominância
- [ ] File picker aceita: JPEG, PNG, WebP, HEIC
- [ ] File picker rejeita: GIF, SVG, BMP, PDF
- [ ] UploadValidationScreen com loading e checks progressivos
- [ ] Check 1: formato e tamanho (min 500KB, max 20MB, min 640×480)
- [ ] Check 2: qualidade (brightness, blur detection)
- [ ] Check 3: detecção de mão via MediaPipe estático (se MEDIAPIPE_ENABLED)
- [ ] Check 4: handedness correto (SEM inversão de espelhamento pra fotos)
- [ ] Check 5: palma aberta (landmarks dos dedos)
- [ ] UploadConfirmScreen com preview + checklist + confirmação
- [ ] Preview com overlay de landmarks (se MediaPipe rodou)
- [ ] Botão "Sim, pode ler" e "Não, vou trocar"
- [ ] Detecção de screenshot (dimensões atípicas tipo 1170×2532)

### Front-end: feedbacks de erro (câmera + upload)

- [ ] Mão errada: toast "Essa é a outra mão" (aviso, não bloqueio)
- [ ] Duas mãos: bloqueia captura / pede outra foto
- [ ] Nenhuma mão: "Não achei sua mão nessa foto"
- [ ] Mão fechada: "Abre mais os dedos"
- [ ] Dorso da mão: "Vira a mão. Preciso ver a palma."
- [ ] Foto escura: "Tá muito escuro" + preview + "Tentar outra"
- [ ] Foto borrada: "Tá embaçada" + preview + "Tentar outra"
- [ ] Formato inválido: "Preciso de uma foto de verdade"
- [ ] Arquivo muito pequeno: "Essa foto tá muito pequena"
- [ ] Arquivo muito grande: "Essa foto tá pesada demais"
- [ ] Screenshot detectado: "Isso parece um print, não uma foto"
- [ ] Validação parcial (mão OK mas qualidade ruim): aviso honesto + "Usar mesmo assim" / "Trocar"

### MediaPipe

- [ ] Estrutura de validateHandedness criada (com flag)
- [ ] Tratamento de espelhamento câmera frontal vs traseira
- [ ] MediaPipe `detectForImage()` pra fotos estáticas (upload)
- [ ] MediaPipe `detectForVideo()` pra câmera ao vivo
- [ ] Flag `MEDIAPIPE_ENABLED` pra ligar quando real
- [ ] Upload NÃO aplica inversão de espelhamento (foto de galeria é orientação real)

### Backend/prompt

- [ ] Prompt do GPT-4o inclui contexto de qual mão dominante
- [ ] Prompt do GPT-4o inclui instrução de ignorar tatuagens/henna/acessórios
- [ ] Atributos salvos no banco incluem dominant_hand (via JSONB)

### Leitura pra outra pessoa

- [ ] Tela "Pra quem é essa leitura?" com [Pra mim] [Pra outra pessoa]
- [ ] Formulário outra pessoa: Nome + Ela/Ele + Destra/Canhota (3 campos obrigatórios)
- [ ] Frase cigana: "Me diz quem eu vou ler."
- [ ] sessionStorage com keys separadas: target_name, target_gender, target_dominant, is_self
- [ ] Dominância da dona NÃO é sobrescrita
- [ ] Câmera: instrução adapta nome e dominância da outra pessoa
- [ ] Câmera: badge mostra "MÃO DIREITA · CARLOS"
- [ ] Câmera: feedback mão errada usa pronome da outra pessoa ("dele"/"dela")
- [ ] Upload: instrução e confirmação usam nome da outra pessoa
- [ ] Resultado: endereçado à outra pessoa (nome, gênero, segunda pessoa)
- [ ] Histórico: card mostra "Leitura pra outra pessoa" + nome

### Limpeza de gaps (fazer DURANTE, não depois)

- [ ] fallbackName="Marina" removido → usa sessionStorage ou "Você"
- [ ] VALID_MOCK_IDS condicionado a NODE_ENV === 'development'
- [ ] share_expires_at 2099 removido (grep "2099", limpar 3 arquivos)
- [ ] maosfalam_email: conectar ao payload de captura (ou remover setItem)
- [ ] login()/register() stubs removidos do useAuth.ts
- [ ] getVariant retorna tier real da reading (não sempre "active_free")

### Edge cases

- [ ] HEIC: conversão pra JPEG via heic2any antes de qualquer processamento
- [ ] Câmera traseira como default (`facingMode: 'environment'`)
- [ ] Botão pra trocar câmera frontal/traseira
- [ ] `isFrontCamera` no state pra lógica de espelhamento
- [ ] Permissão de câmera negada → fallback pro upload com frase da cigana
- [ ] EXIF rotation corrigida antes de processar no canvas
- [ ] Compressão no client (max 1280px, JPEG 0.85) antes de enviar
- [ ] Orientação landscape detectada → aviso "Vira o celular"
- [ ] Upload sem MediaPipe: fallback no retorno do GPT-4o (confidence < 0.3 = erro)
- [ ] Retry: depois de 3 falhas, sugerir trocar método (câmera ↔ upload)
- [ ] GPT-4o timeout: frases extras de suspense até 30s, erro depois
- [ ] GPT-4o erro HTTP: 1 retry silencioso, depois tela de erro
- [ ] GPT-4o JSON malformado: tratar como confidence 0
- [ ] A11y: aria-labels nos botões, aria-live nos feedbacks, role="img" nos SVGs

### Build

- [ ] `npm run type-check` passa
- [ ] `npm run build` passa
- [ ] `npm run lint` passa

### Smoke tests visuais

- [ ] /ler/nome mostra botões Destra/Canhota
- [ ] Selecionar "Destra" → câmera mostra "mão direita"
- [ ] Selecionar "Canhota" → câmera mostra "mão esquerda"
- [ ] Badge muda conforme dominância
- [ ] Outline SVG espelha conforme dominância
- [ ] Upload: instrução mostra mão correta
- [ ] Upload: foto válida → preview → confirmação → scan
- [ ] Upload: foto sem mão → erro → "Tentar outra"
- [ ] Upload: foto errada de mão → aviso → opção de usar ou trocar
- [ ] Upload: foto HEIC de iPhone → converte e processa normalmente
- [ ] Câmera negada → vai pro upload automaticamente
- [ ] Celular horizontal → aviso pra virar
- [ ] 3 erros seguidos → sugestão de trocar método
- [ ] "Pra outra pessoa": formulário pede nome + gênero + dominância
- [ ] "Pra outra pessoa": câmera mostra "mão direita do Carlos"
- [ ] "Pra outra pessoa": resultado endereçado ao Carlos
- [ ] "Pra outra pessoa": histórico mostra badge "outra pessoa"
- [ ] fallbackName="Marina" não aparece em nenhum lugar
- [ ] Grep "2099" retorna 0 resultados
- [ ] VALID_MOCK_IDS não funciona em NODE_ENV=production
