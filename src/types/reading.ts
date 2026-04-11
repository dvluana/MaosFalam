// Backward compat — re-exports from v2 types.
// TODO: migrate all imports to @/types/report directly, then delete this file.
export type {
  HandElement,
  Tier,
  Reading,
  ReportJSON,
  ReportSection,
  ReportVenus,
  ReportCrossing,
  ReportCompat,
  ReportRareSign,
  Accent,
  SectionKey,
} from './report';
export type { HandAttributes } from './hand-attributes';
