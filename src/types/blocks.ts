export interface TextBlock {
  readonly content: string;
  readonly alt: string;
  readonly alt2: string;
}

export interface LineBlocks {
  readonly opening: TextBlock;
  readonly body_past: TextBlock;
  readonly body_present: TextBlock;
}

export interface MountBlocks {
  readonly intro: TextBlock;
  readonly body: TextBlock;
}

export interface MeasurementSet {
  readonly [field: string]: string;
}
