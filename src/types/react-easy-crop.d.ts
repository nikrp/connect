declare module "react-easy-crop" {
  import type { FC } from "react";

  export type CropArea = {
    width: number;
    height: number;
    x: number;
    y: number;
  };

  export type CropPoint = {
    x: number;
    y: number;
  };

  export type CropperClasses = {
    containerClassName?: string;
    mediaClassName?: string;
  };

  export interface CropperProps {
    image: string;
    crop: CropPoint;
    zoom: number;
    aspect?: number;
    cropShape?: "rect" | "round";
    showGrid?: boolean;
    restrictPosition?: boolean;
    classes?: CropperClasses;
    zoomWithScroll?: boolean;
    onCropChange: (location: CropPoint) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete?: (croppedArea: CropArea, croppedAreaPixels: CropArea) => void;
  }

  const Cropper: FC<CropperProps>;
  export default Cropper;
}
