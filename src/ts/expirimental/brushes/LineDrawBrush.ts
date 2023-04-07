import { Graphics2D } from "lib/graphics/Graphics2D";

export interface LineDrawBrush{
    drawLine(graphics: Graphics2D, x: number, y: number, x2: number, y2: number): void;
}