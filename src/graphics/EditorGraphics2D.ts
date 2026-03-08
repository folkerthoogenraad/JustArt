import { Vector2 } from "../math/Vector2";
import { ViewportFit, ViewportSettings } from "../settings/ViewportSettings";
import { Graphics2D } from "./Graphics2D";

/**
 * @expirimental Because I'm not sure whether this is a good way of extending the graphics for editor stuff
 */
export const EditorGraphics2D = {
    /**
     * Draws a grid within the given rectangle with the given grid origin and offset.
     * @param graphics The graphics
     * @param x The x coordinate of the grid output
     * @param y The y coordinate of the grid output
     * @param width The width of the grid
     * @param height The height of the grid
     * @param gridOriginX The x origin of the grid (in viewport space)
     * @param gridOriginY The y origin of the grid (in viewport space)
     * @param gridCellWidth The horizontal spacing between grid lines
     * @param gridCellHeight The vertical spacing between grid lines
     */
    drawGrid(graphics: Graphics2D, x: number, y: number, width: number, height: number, gridOriginX: number, gridOriginY: number, gridCellWidth: number, gridCellHeight: number) {
        const gridHorizontalCells = width / gridCellWidth;
        const gridVerticalLines = height / gridCellHeight;

        const offsetX = (gridOriginX - x) % gridCellWidth;
        const offsetY = (gridOriginY - y) % gridCellHeight;

        for(let i = 0; i < gridHorizontalCells; i++) {
            graphics.drawLine(
                x + offsetX + i * gridCellWidth, 
                y, 
                x + offsetX + i * gridCellWidth, 
                y + height);
        }

        for(let i = 0; i < gridVerticalLines; i++) {
            graphics.drawLine(
                x, 
                y + offsetY + i * gridCellHeight, 
                x + width, 
                y + offsetY + i * gridCellHeight);
        }
    },

    /**
     * Draws a grid on the full document rectangle (the screen).
     * @param graphics The graphics
     * @param gridOriginX The x origin of the grid (in viewport space)
     * @param gridOriginY The y origin of the grid (in viewport space)
     * @param gridCellWidth The horizontal spacing between grid lines
     * @param gridCellHeight The vertical spacing between grid lines
     */
    drawGridScreen(graphics: Graphics2D, gridOriginX: number, gridOriginY: number, gridCellWidth: number, gridCellHeight: number) {
        let rect = graphics.getDocumentRectangle();
    
        EditorGraphics2D.drawGrid(graphics, rect.x, rect.y, rect.width, rect.height, gridOriginX, gridOriginY, gridCellWidth, gridCellHeight);
    },

    /**
     * Pan the viewport with the given x and y deltas
     * @param graphics The graphics
     * @param x The amount of panning in the x direction
     * @param y The amount of panning in the y direction
     */
    pan(graphics: Graphics2D, x: number, y: number) {
        let viewport = graphics.viewportSettings;

        viewport = viewport.translated(-x, -y);

        graphics.setViewportSettings(viewport);
    },

    /**
     * Pan the center of the viewport to the given x and y location
     * @param graphics The graphics
     * @param x The amount of panning in the x direction
     * @param y The amount of panning in the y direction
     */
    panTo(graphics: Graphics2D, x: number, y: number) {
        let viewport = graphics.viewportSettings;

        viewport = ViewportSettings.centered(x, y, viewport.width, viewport.height, viewport.fit);

        graphics.setViewportSettings(viewport);
    },

    /**
     * Zoom the viewport by a given zoom factor. This modifies the viewport fit as well.
     * @param graphics The graphics
     * @param factor The amount of zooming to do, where 1 is no zoom.
     * @param x The x location to keep pinned in the viewport (optional, defaults to viewport center)
     * @param y The y location to keep pinned in the viewport  (optional, defaults to viewport center)
     */
    zoom(graphics: Graphics2D, factor: number, x?: number, y?: number) {
        let rect = graphics.getDocumentRectangle();

        x ??= rect.centerX;
        y ??= rect.centerY;
        
        let minX = (rect.left - x) * factor + x;
        let maxX = (rect.right - x) * factor + x;
        let minY = (rect.top - y) * factor + y;
        let maxY = (rect.bottom - y) * factor + y;

        graphics.setViewportSettings(new ViewportSettings(minX, minY, maxX, maxY, ViewportFit.Contain));
    }
}