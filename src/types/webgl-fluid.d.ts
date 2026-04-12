declare module "webgl-fluid" {
  type RGBColor = {
    r: number;
    g: number;
    b: number;
  };

  type FluidOptions = {
    TRIGGER?: "hover" | "click";
    IMMEDIATE?: boolean;
    AUTO?: boolean;
    INTERVAL?: number;
    SIM_RESOLUTION?: number;
    DYE_RESOLUTION?: number;
    CAPTURE_RESOLUTION?: number;
    COLORFUL?: boolean;
    COLOR_UPDATE_SPEED?: number;
    SPLAT_COUNT?: number;
    PAUSED?: boolean;
    SHADING?: boolean;
    BLOOM?: boolean;
    BLOOM_ITERATIONS?: number;
    BLOOM_RESOLUTION?: number;
    BLOOM_INTENSITY?: number;
    BLOOM_THRESHOLD?: number;
    BLOOM_SOFT_KNEE?: number;
    SUNRAYS?: boolean;
    SUNRAYS_RESOLUTION?: number;
    SUNRAYS_WEIGHT?: number;
    TRANSPARENT?: boolean;
    BACK_COLOR?: RGBColor;
    DENSITY_DISSIPATION?: number;
    VELOCITY_DISSIPATION?: number;
    PRESSURE?: number;
    PRESSURE_ITERATIONS?: number;
    CURL?: number;
    SPLAT_RADIUS?: number;
    SPLAT_FORCE?: number;
  };

  export default function WebGLFluid(
    canvas: HTMLCanvasElement,
    options?: FluidOptions,
  ): void;
}
