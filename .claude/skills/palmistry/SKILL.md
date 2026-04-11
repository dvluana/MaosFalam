---
name: palmistry
description: |
  Trigger this skill when working on palm detection, reading blocks, vision API
  prompt, attribute JSON schema, or any code that maps hand features to text.
  Ensures all palmistry terminology and detection logic is accurate.
---

# MaosFalam Palmistry Reference

## Hand type classification

| Element | Palm                    | Fingers                   | Detection                                   |
| ------- | ----------------------- | ------------------------- | ------------------------------------------- |
| Fire    | Square (width ~ length) | Short (< 75% palm length) | WRIST>MCP distance vs MCP>TIP distance      |
| Water   | Rectangular long        | Long and thin             | Palm visibly longer than wide, thin fingers |
| Earth   | Square and large        | Short and thick           | Robust palm, proportionally short fingers   |
| Air     | Square                  | Long, visible knuckles    | Long fingers with visible joints            |

## Lines (origin, trajectory, end)

- Heart: HIGHEST horizontal. Starts ulnar edge (below pinky) > crosses upper palm > ends between index and middle.
- Head: SECOND horizontal. Starts between thumb and index > crosses mid palm. Curved = toward Mount of Luna.
- Life: Starts between thumb and index > curves around thumb base (Mount of Venus) > toward wrist.
- Fate: VERTICAL. Base of palm upward > toward middle finger (Mount of Saturn). ~25% of people lack this line.

## Mounts and their landmarks

| Mount   | Planet  | Location                  | MediaPipe landmark                               |
| ------- | ------- | ------------------------- | ------------------------------------------------ |
| Jupiter | Jupiter | Base of index             | INDEX_FINGER_MCP (5)                             |
| Saturn  | Saturn  | Base of middle            | MIDDLE_FINGER_MCP (9)                            |
| Apollo  | Sun     | Base of ring              | RING_FINGER_MCP (13)                             |
| Mercury | Mercury | Base of pinky             | PINKY_MCP (17)                                   |
| Venus   | Venus   | Thumb base (fleshy area)  | THUMB_CMC (1) to WRIST (0)                       |
| Luna    | Moon    | Opposite side to thumb    | Between WRIST (0) and PINKY_MCP (17), ulnar edge |
| Mars+   | Mars    | Between Jupiter and Venus | Between THUMB_CMC and INDEX_FINGER_MCP           |
| Mars-   | Mars    | Between Mercury and Luna  | Lateral below PINKY_MCP                          |

## Rare signs

star_jupiter, star_apollo, mystic_cross, solomon_ring, sun_line,
intuition_line, venus_girdle, protection_square, triangle_center

Only report if medium-high confidence. False positive worse than false negative.

## See full reference

@docs/palmistry.md for complete detection instructions, all variations, and JSON schema.
@docs/blocks.md for all text blocks mapped to each variation.
