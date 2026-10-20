import type { RotationAngle } from "@ops/core";

export interface CardCropSpec {
  relX: number;
  relY: number;
  relW: number;
  relH: number;
  defaultRotation: RotationAngle;
}

export interface DisclaimerRegionSpec {
  relX: number;
  relY: number;
  relW: number;
  relH: number;
}

export interface IdCardTemplate {
  id: string;
  name: string;
  targetCard: "CR-80";
  front: CardCropSpec;
  back: CardCropSpec | null;
  disclaimerRegion?: DisclaimerRegionSpec;
}

export interface CropTemplateFileSchema {
  version: number;
  templates: IdCardTemplate[];
}
