import { Rect2 } from "lib/math/Rect2";
import { ImageGrid } from "./ImageGrid";
import { Vector2 } from "lib/math/Vector2";

interface VoronoiPixel {
    index: number;
    distance: number;
}

interface VoronoiResult {
    voronoiCells: ImageGrid<VoronoiPixel>;
    points: Vector2[];
    centerOfMass: Vector2[];
    rectangles: Rect2[];
}

export class Voronoi {
    static generateVoronoiTexture(width: number, height: number, points: Vector2[]): VoronoiResult {
        let image = new ImageGrid<VoronoiPixel>(width, height);

        const getClosestIndex = (x: number, y: number): VoronoiPixel => {
            let distance = width * 10;
            let closest = 0;

            for(let i = 0; i < points.length; i++){
                let d = Vector2.fDistance(x, y, points[i].x, points[i].y);

                if(d < distance) {
                    distance = d;
                    closest = i;
                }
            }

            return {
                distance: distance,
                index: closest,
            };
        };
        const extendRectangle = (rect: Rect2, x: number, y: number) => {
            // Base case
            if(rect.width == 0 || rect.height == 0) {
                rect.position.x = x;
                rect.position.y = y;
                rect.size.x = 1;
                rect.size.y = 1;
                return;
            }

            if(x < rect.left) {
                rect.left = x;
            }
            if(x + 1 > rect.right) {
                rect.right = x + 1;
            }
            if(y < rect.top){
                rect.top = y;
            }
            if(y + 1 > rect.bottom){
                rect.bottom = y + 1;
            }
        }

        image.mapSelf((v, x, y) => {
            return getClosestIndex(x, y);
        });

        let rectangles: Rect2[] = points.map(p => new Rect2(new Vector2(0, 0), new Vector2(0, 0)));
        let centerOfMass: Vector2[] = points.map(p => new Vector2(0, 0));
        let totalMass: number[] = points.map(p => 0);

        image.foreachPixel((pixel, x, y) => {
            extendRectangle(rectangles[pixel.index], x, y);

            centerOfMass[pixel.index].addX(x).addY(y);
            totalMass[pixel.index] += 1;
        });

        return {
            voronoiCells: image,
            points: points,
            rectangles: rectangles,
            centerOfMass: centerOfMass.map((center, index) => center.scale(1 / totalMass[index]))
        }
    }
}