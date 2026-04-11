# Requirements: MaosFalam

**Defined:** 2026-04-11
**Core Value:** Foto da palma entra, leitura personalizada sai.

## v1.0 + v1.1 Requirements (Complete)

All shipped. See `.planning/archive/` for history.

## v1.2 Requirements

Requirements for milestone v1.2: Fluxo de Mao Dominante.

### Camera UI

- [ ] **CAM-01**: HandInstructionOverlay aparece ANTES do viewfinder com frase da cigana e outline SVG espelhado conforme dominancia
- [ ] **CAM-02**: HandExpectedBadge mostra "MAO DIREITA" ou "MAO ESQUERDA" no viewfinder (descartavel com botao x)
- [ ] **CAM-03**: WrongHandFeedback toast aparece por 3s quando MediaPipe detecta mao errada (aviso, nao bloqueio)
- [ ] **CAM-04**: Outline SVG de palma aberta no viewfinder espelhado conforme dominant_hand
- [ ] **CAM-05**: Camera traseira como default (facingMode: "environment"), botao pra trocar pra frontal
- [ ] **CAM-06**: Permissao de camera negada redireciona pra upload com frase da cigana

### Upload Pipeline

- [ ] **UPL-01**: Tela de escolha de metodo (camera ao vivo vs upload da galeria) com 2 botoes claros
- [ ] **UPL-02**: UploadInstructionScreen com instrucao de qual mao + dicas de qualidade + outline SVG
- [ ] **UPL-03**: File picker aceita JPEG, PNG, WebP, HEIC; rejeita GIF, SVG, BMP, PDF
- [ ] **UPL-04**: UploadValidationScreen com checks progressivos (formato, qualidade, mao, handedness, palma aberta)
- [ ] **UPL-05**: UploadConfirmScreen com preview + checklist de validacao + confirmacao
- [ ] **UPL-06**: Validacao parcial (mao OK mas qualidade ruim) mostra aviso honesto + "Usar mesmo assim"

### Edge Cases

- [ ] **EDGE-01**: HEIC conversion via heic2any antes de qualquer processamento
- [ ] **EDGE-02**: EXIF rotation corrigida antes de processar no canvas
- [ ] **EDGE-03**: Compressao client-side (max 1280px, JPEG 0.85) antes de enviar
- [ ] **EDGE-04**: Orientacao landscape detectada com aviso "Vira o celular pra vertical"
- [ ] **EDGE-05**: Retry logic: apos 3 falhas, sugerir trocar metodo (camera <> upload)
- [ ] **EDGE-06**: Deteccao de screenshot (dimensoes atipicas) com aviso da cigana

### GPT-4o Prompt

- [ ] **PROMPT-01**: Prompt do GPT-4o inclui contexto de qual mao dominante esta sendo analisada
- [ ] **PROMPT-02**: Prompt instrui a ignorar tatuagens, henna, nail art, aneis, pulseiras

### Outra Pessoa

- [ ] **OTHER-01**: Camera mostra instrucao e badge com nome e mao da outra pessoa ("MAO DIREITA . CARLOS")
- [ ] **OTHER-02**: Feedback de mao errada usa pronome da outra pessoa ("dele"/"dela")
- [ ] **OTHER-03**: Upload instrucao e confirmacao usam nome da outra pessoa

### Acessibilidade

- [ ] **A11Y-01**: aria-labels nos botoes Destra/Canhota, trocar camera, descartavel badge
- [ ] **A11Y-02**: aria-live nos feedbacks (WrongHandFeedback assertive, HandExpectedBadge polite)
- [ ] **A11Y-03**: role="img" + aria-label nos outlines SVG de mao

## v2 Requirements

### Payment

- **PAY-01 through PAY-04**: AbacatePay integration (deferred)

### Email

- **EMAIL-01 through EMAIL-04**: Resend integration (deferred)

## Out of Scope

| Feature                                     | Reason                                       |
| ------------------------------------------- | -------------------------------------------- |
| Leitura da mao nao-dominante                | MVP le apenas dominante                      |
| Deteccao de dorso da mao                    | Complexo, baixa prioridade, deixar como TODO |
| Upload sem MediaPipe: validacao server-only | Fallback funciona via GPT-4o confidence      |
| Blocos de texto novos                       | Conteudo atual suficiente                    |
| Compatibilidade entre maos                  | v2 do produto                                |

## Traceability

| Requirement               | Phase | Status |
| ------------------------- | ----- | ------ |
| (populated by roadmapper) |       |        |

**Coverage:**

- v1.2 requirements: 24 total
- Mapped to phases: 0
- Unmapped: 24

---

_Requirements defined: 2026-04-11_
_Last updated: 2026-04-11 after milestone v1.2 definition_
