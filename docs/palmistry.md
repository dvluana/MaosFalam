# MaosFalam: Dicionario de Quiromancia Tecnica

## 4 Linhas Principais

| Linha | Simbolo | Planeta | Origem | Trajeto | Termino | Cor |
|-------|---------|---------|--------|---------|---------|-----|
| Coracao | ♀ | Venus | Borda ulnar (abaixo mindinho) | Horizontal, parte superior | Entre indicador e medio | Rose #C4647A |
| Cabeca | ☿ | Mercurio | Entre polegar e indicador | Horizontal, meio da palma | Varia (reta ou curva pra Lua) | Violet #7B6BA5 |
| Vida | ☉ | Sol | Entre polegar e indicador | Curva ao redor da base do polegar | Direcao ao pulso | Gold #C9A24A |
| Destino | ♄ | Saturno | Base da palma ou mais acima | Vertical, centro da palma | Direcao ao dedo medio | Bone #E8DFD0 |

## Deteccao por IA: instrucoes por linha

### Coracao (a mais alta, horizontal)
- Comprimento: CURTA (antes do medio), MEDIA (sob medio), LONGA (passa do medio)
- Curvatura: RETA, LEVEMENTE CURVADA, PROFUNDAMENTE CURVADA
- Profundidade: FRACA, NORMAL, PROFUNDA
- Ponto de termino: INDEX, MIDDLE, BETWEEN
- Bifurcacoes: end_fork, start_fork, both, none
- Ilhas: 0-3 (ovais formados pela linha se dividindo)
- Interrupcoes: 0-3 (gaps onde para e recomeca)

### Cabeca (segunda horizontal)
- Mesmos atributos + touches_life (boolean) + writers_fork (bifurcacao pro Monte da Lua)

### Vida (curva ao redor do polegar)
- Mesmos atributos + arc_width (tight|normal|wide) + break_offset (boolean) + sister_line + chained

### Destino (vertical, pode estar ausente)
- present (boolean) + start_point (wrist|mid_palm|life_line|luna_mount) + multiple (boolean)

## 8 Montes: localizacao e landmarks MediaPipe

| Monte | Planeta | Localizacao | Landmark |
|-------|---------|-------------|----------|
| Jupiter | Jupiter | Base do indicador | INDEX_FINGER_MCP (5) |
| Saturno | Saturno | Base do medio | MIDDLE_FINGER_MCP (9) |
| Apolo | Sol | Base do anelar | RING_FINGER_MCP (13) |
| Mercurio | Mercurio | Base do mindinho | PINKY_MCP (17) |
| Venus | Venus | Base do polegar (carnuda) | THUMB_CMC (1) a WRIST (0) |
| Lua | Lua | Borda oposta ao polegar | Entre WRIST (0) e PINKY_MCP (17) |
| Marte+ | Marte | Entre Jupiter e Venus | Entre THUMB_CMC e INDEX_MCP |
| Marte- | Marte | Entre Mercurio e Lua | Lateral abaixo PINKY_MCP |

Estados: flat | normal | pronounced
IA avalia por: volume aparente, sombras, proporcao relativa.

## Sinais Raros

| Sinal | ID | Onde | Forma |
|-------|-----|------|-------|
| Estrela em Jupiter | star_jupiter | Monte Jupiter | 3+ linhas cruzando |
| Estrela em Apolo | star_apollo | Monte Apolo | 3+ linhas cruzando |
| Cruz Mistica | mystic_cross | Centro da palma | X entre Coracao e Cabeca |
| Anel de Salomao | solomon_ring | Contorna indicador | Semicirculo |
| Linha do Sol | sun_line | Abaixo do anelar | Vertical |
| Linha de Intuicao | intuition_line | Lua a Mercurio | Semicurva lateral |
| Cinto de Venus | venus_girdle | Acima do Coracao | Semicirculo |
| Quadrado protetor | protection_square | Sobre linhas | 4 linhas retangulo |
| Triangulo central | triangle_center | Centro da palma | 3 linhas |

So reportar com confianca media-alta. Falso positivo pior que falso negativo.

## Tipo de mao (elemento)

| Elemento | Palma | Dedos | Deteccao |
|----------|-------|-------|----------|
| Fogo | Quadrada | Curtos (<75% palma) | WRIST>MCP vs MCP>TIP |
| Agua | Retangular longa | Longos e finos | Palma mais longa que larga |
| Terra | Quadrada grande | Curtos e largos | Palma robusta |
| Ar | Quadrada | Longos, juntas visiveis | Dedos longos com nos |

## JSON Schema completo

```json
{
  "hand_type": "fire|water|earth|air",
  "hand_shape": {
    "palm_proportion": "square|rectangular",
    "palm_width": "narrow|medium|wide",
    "finger_length": "short|medium|long",
    "finger_thickness": "thin|medium|thick",
    "knuckles_visible": boolean
  },
  "dominant_hand": "left|right",
  "lines": {
    "heart": {
      "length": "short|medium|long",
      "curve": "straight|slightly_curved|deeply_curved",
      "depth": "faint|normal|deep",
      "breaks": 0-3,
      "forks": "none|end_fork|start_fork|both",
      "islands": 0-3,
      "chained": boolean,
      "ends_at": "index|middle|between_index_middle",
      "starts_at": "below_pinky|below_ring"
    },
    "head": {
      "length", "curve" (includes "deeply_curved_to_luna"),
      "depth", "breaks", "forks" (includes "writers_fork"),
      "islands", "touches_life": boolean, "separated_from_life": boolean
    },
    "life": {
      "length", "depth", "arc_width": "tight|normal|wide",
      "breaks", "break_offset": boolean, "islands",
      "chained": boolean, "sister_line": boolean
    },
    "fate": {
      "present": boolean,
      "start_point": "wrist|mid_palm|life_line|luna_mount",
      "depth", "breaks", "multiple": boolean,
      "ends_at": "saturn|jupiter|between"
    }
  },
  "mounts": {
    "jupiter|saturn|apollo|mercury|venus|luna|mars_positive|mars_negative":
      "flat|normal|pronounced"
  },
  "rare_signs": ["star_jupiter", "mystic_cross", ...],
  "confidence": 0.0-1.0
}
```

## Prompt da IA de Visao

System: "Voce e um analista especializado em quiromancia. Analise a foto da palma e extraia
atributos estruturados. Retorne APENAS JSON valido. Avalie linhas pela localizacao anatomica
correta. Montes por volume aparente e sombras. Sinais raros so com confianca media-alta."

Confidence thresholds:
- 0.8-1.0: processar normal
- 0.5-0.79: processar com valores conservadores
- 0.3-0.49: so linhas principais, omitir montes e raros
- <0.3: REJEITAR ("Suas linhas estao timidas hoje.")
