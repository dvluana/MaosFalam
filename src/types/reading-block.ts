export type BlockAxis = "element" | "heart" | "head" | "life" | "fate" | "mount" | "rare" | "cross";

export type BlockType = "intro" | "body" | "impact" | "cross";

export type BlockTier = "free" | "premium";

export interface ReadingBlock {
  axis: BlockAxis;
  variation: string;
  block_type: BlockType;
  tier: BlockTier;
  content: string;
  content_alt?: string;
  content_alt2?: string;
}
