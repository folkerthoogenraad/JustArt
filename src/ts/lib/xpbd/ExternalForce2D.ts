import { XPBDScene2D } from "./XPBDScene2D";

export type ExternalForce2D = (delta: number, scene: XPBDScene2D) => void;