/**
 * @file image.d.ts
 * This file contains TypeScript declarations for image file types.
 * It allows TypeScript to recognize and import image files (PNG, JPG, JPEG, GIF, SVG) as modules.
 */
declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

declare module "*.jpeg" {
  const value: any;
  export default value;
}

declare module "*.gif" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  const value: any;
  export default value;
}
