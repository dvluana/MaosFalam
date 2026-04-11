# Roadmap: MaosFalam

## Milestones

- ✅ **v1.0 Backend MVP** - Phases 1-7 (shipped 2026-04-11)
- ✅ **v1.1 Alinhamento Arquitetural** - Phases 1-5 (shipped 2026-04-11)
- 🚧 **v1.2 Fluxo de Mao Dominante** - Phases 1-4 (in progress)

<details>
<summary>✅ v1.0 Backend MVP (Phases 1-7) - SHIPPED 2026-04-11</summary>

Phase 1: Foundation | Phase 2: Auth | Phase 3: AI Pipeline | Phase 4: Public API | Phase 5: Protected API | Phase 6: Client Adapters | Phase 7: Frontend-Backend Wiring

All 17 plans completed. See `.planning/archive/v1.0/` for history.

</details>

<details>
<summary>✅ v1.1 Alinhamento Arquitetural (Phases 1-5) - SHIPPED 2026-04-11</summary>

Phase 1: Auditoria | Phase 2: ReadingContext + Creditos | Phase 3: MediaPipe Real | Phase 4: Clerk Cleanup + Error Handling | Phase 5: Docs Sync

All 9 plans completed. See `.planning/archive/v1.1/` for history.

</details>

---

### 🚧 v1.2 Fluxo de Mao Dominante (In Progress)

**Milestone Goal:** Completar o fluxo de mao dominante end-to-end: instrucoes visuais na camera, upload pipeline com validacao client-side, edge cases de imagem, prompt GPT-4o com contexto de dominancia, e suporte a leitura pra outra pessoa.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Camera UI** - Instrucoes visuais, badge de mao esperada, feedback de mao errada, outline SVG, camera traseira default (completed 2026-04-11)
- [x] **Phase 2: Upload Pipeline** - Tela de escolha de metodo, instrucoes de upload, validacao de arquivo, confirmacao com preview (completed 2026-04-11)
- [x] **Phase 3: Edge Cases + Prompt** - HEIC, EXIF, compressao, orientacao, retry logic, deteccao de screenshot, prompt GPT-4o atualizado (completed 2026-04-11)
- [ ] **Phase 4: Outra Pessoa + A11y** - Camera e upload adaptados ao contexto de outra pessoa, aria-labels, aria-live, role=img

## Phase Details

### Phase 1: Camera UI

**Goal**: Usuario ve instrucoes claras antes de abrir a camera, sabe qual mao posicionar, recebe aviso quando usa a mao errada, e a camera abre na traseira por padrao
**Depends on**: Nothing (first phase)
**Requirements**: CAM-01, CAM-02, CAM-03, CAM-04, CAM-05, CAM-06
**Success Criteria** (what must be TRUE):

1. Antes de ver o viewfinder, usuario ve overlay com frase da cigana e outline SVG mostrando qual mao posicionar (direita ou esquerda conforme dominancia)
2. Durante a captura, badge no viewfinder exibe "MAO DIREITA" ou "MAO ESQUERDA" e pode ser descartado com botao x
3. Quando MediaPipe detecta a mao errada, toast aparece por 3s com aviso — sem bloquear a captura
4. Outline SVG no viewfinder esta espelhado conforme a mao dominante escolhida
5. Camera abre na traseira (facingMode: environment) com botao para trocar pra frontal; permissao negada redireciona para upload com frase da cigana
   **Plans**: 2 plans
   **UI hint**: yes

Plans:

- [x] 01-01-PLAN.md — Componentes visuais: HandOutlineSVG, HandInstructionOverlay, HandExpectedBadge
- [x] 01-02-PLAN.md — Wiring: WrongHandFeedback, camera switch, permission redirect, integracao na pagina

### Phase 2: Upload Pipeline

**Goal**: Usuario que nao usa a camera ao vivo consegue enviar foto da palma com instrucoes claras, validacao de formato e qualidade, e confirmacao antes do envio
**Depends on**: Phase 1
**Requirements**: UPL-01, UPL-02, UPL-03, UPL-04, UPL-05, UPL-06
**Success Criteria** (what must be TRUE):

1. Usuario ve tela de escolha com dois caminhos claros: camera ao vivo ou upload da galeria
2. Ao escolher upload, ve instrucao de qual mao fotografar, dicas de qualidade, e outline SVG do esperado
3. File picker aceita JPEG, PNG, WebP, HEIC e rejeita outros formatos antes de qualquer processamento
4. Validacao exibe checks progressivos (formato, qualidade, mao detectada, handedness, palma aberta) com feedback visual
5. Tela de confirmacao mostra preview da foto com checklist de validacao e botao de confirmar antes de enviar
6. Quando qualidade e ruim mas mao esta OK, usuario ve aviso honesto com opcao "Usar mesmo assim"
   **Plans**: 3 plans
   **UI hint**: yes

Plans:

- [x] 02-01-PLAN.md — UploadInstructionScreen: instrucao de qual mao + dicas de qualidade + outline SVG
- [x] 02-02-PLAN.md — useUploadValidation hook + UploadValidationScreen + UploadConfirmScreen
- [x] 02-03-PLAN.md — Wiring: fluxo multi-step na camera page, substituir UploadPreview

### Phase 3: Edge Cases + Prompt

**Goal**: Imagens de iPhone (HEIC), fotos com rotacao EXIF incorreta, arquivos grandes, celular em landscape, capturas repetidas, e screenshots sao tratados sem erro; o prompt do GPT-4o inclui contexto da mao dominante e ignora decoracoes
**Depends on**: Phase 2
**Requirements**: EDGE-01, EDGE-02, EDGE-03, EDGE-04, EDGE-05, EDGE-06, PROMPT-01, PROMPT-02
**Success Criteria** (what must be TRUE):

1. Foto tirada no iPhone em formato HEIC e convertida automaticamente antes de qualquer processamento, sem erro ou mensagem tecnica
2. Foto com rotacao EXIF incorreta e exibida e processada na orientacao correta
3. Imagem grande e comprimida para max 1280px e JPEG 0.85 no client antes de ser enviada ao servidor
4. Celular em modo landscape exibe aviso "Vira o celular pra vertical" sem prosseguir
5. Apos 3 falhas, usuario ve sugestao de trocar de metodo (camera para upload ou vice-versa)
6. Screenshot detectado por dimensoes atipicas exibe aviso da cigana pedindo foto real; prompt GPT-4o inclui qual mao dominante esta sendo analisada e instrui a ignorar tatuagens, henna, nail art, aneis e pulseiras
   **Plans**: 3 plans

Plans:

- [x] 03-01-PLAN.md — normalizeImage(): HEIC conversion + EXIF correction + compression; wire into useUploadValidation
- [x] 03-02-PLAN.md — Landscape warning + retry-suggest logic + screenshot detection
- [x] 03-03-PLAN.md — GPT-4o prompt: dominant_hand context + ignore accessories

### Phase 4: Outra Pessoa + A11y

**Goal**: Quando a leitura e para outra pessoa, camera e upload refletem o nome e mao dessa pessoa em todos os textos; botoes e feedbacks sao acessiveis com leitores de tela
**Depends on**: Phase 3
**Requirements**: OTHER-01, OTHER-02, OTHER-03, A11Y-01, A11Y-02, A11Y-03
**Success Criteria** (what must be TRUE):

1. Badge no viewfinder e instrucao de upload exibem nome e mao da outra pessoa ("MAO DIREITA . CARLOS") quando is_self=false
2. Toast de mao errada usa o pronome correto da outra pessoa ("dele" ou "dela") conforme genero escolhido
3. Tela de instrucao e confirmacao de upload mencionam o nome da outra pessoa
4. Botoes Destra/Canhota, trocar camera, e badge descartavel tem aria-labels descritivos para leitores de tela
5. WrongHandFeedback e anunciado como assertive e HandExpectedBadge como polite via aria-live
6. Outlines SVG de mao tem role="img" e aria-label descrevendo a mao esperada
   **Plans**: 2 plans
   **UI hint**: yes

Plans:

- [x] 04-01-PLAN.md — Camera context: HandInstructionOverlay + HandExpectedBadge + WrongHandFeedback com targetName/isSelf/targetGender
- [ ] 04-02-PLAN.md — Upload context: UploadInstructionScreen + UploadConfirmScreen com targetName; A11Y-01 aria-labels em ToggleButton

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase                  | Milestone | Plans Complete | Status      | Completed  |
| ---------------------- | --------- | -------------- | ----------- | ---------- |
| 1. Camera UI           | v1.2      | 2/2            | Complete    | 2026-04-11 |
| 2. Upload Pipeline     | v1.2      | 3/3            | Complete    | 2026-04-11 |
| 3. Edge Cases + Prompt | v1.2      | 3/3            | Complete    | 2026-04-11 |
| 4. Outra Pessoa + A11y | v1.2      | 1/2 | In Progress|  |
