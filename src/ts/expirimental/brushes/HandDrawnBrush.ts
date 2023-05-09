import { Graphics2D } from "lib/graphics/Graphics2D";
import { PressurePath } from "./PressurePath";
import { Vector2 } from "lib/math/Vector2";
import { InterpolationCurve, InterpolationCurves } from "lib/math/InterpolationCurve";
import { MathHelper } from "lib/math/MathHelper";

export class HandDrawnBrush {
    pressureCurve: InterpolationCurve = InterpolationCurves.Linear;

    width: number = 1;

    subdivisionLength: number = 64;

    drawPressurePath(graphics: Graphics2D, path: PressurePath) {
        for(let i = 0; i < path.getSegmentCount(); i++){
            graphics.drawPath((p)=>{
                let start = path.getSegmentStart(i);
                let end = path.getSegmentEnd(i);

                // Origin
                let ox = start.position.x;
                let oy = start.position.y;


                // Deltas
                let dx = Vector2.dx(start.position, end.position);
                let dy = Vector2.dy(start.position, end.position);

                let l = Vector2.fLength(dx, dy);

                if(l <= 0.001) return;

                let subdivisions = Math.max(1, Math.round(l / this.subdivisionLength));

                dx /= l;
                dy /= l;

                // Normals
                let nx = -dy;
                let ny = dx;

                let startWidth = this.width * this.pressureCurve(start.pressure) * 0.5;
                
                // Start and end in the same spot
                p.moveTo(ox + startWidth * nx, oy + startWidth * ny);

                // Forward, towards the end
                for(let j = 1; j <= subdivisions; j++){
                    let f = j / subdivisions;

                    let pressure = MathHelper.lerp(start.pressure, end.pressure, f);
                    let w = this.width * this.pressureCurve(pressure) * 0.5;

                    let xx = ox + dx * f * l;
                    let yy = oy + dy * f * l;

                    xx += nx * w;
                    yy += ny * w;

                    p.lineTo(xx, yy);
                }

                for(let j = subdivisions; j >= 0; j--){
                    let f = j / subdivisions;

                    let pressure = MathHelper.lerp(start.pressure, end.pressure, f);
                    let w = this.width * this.pressureCurve(pressure) * 0.5;

                    let xx = ox + dx * f * l;
                    let yy = oy + dy * f * l;

                    xx -= nx * w;
                    yy -= ny * w;

                    p.lineTo(xx, yy);
                }

                // End in the same spot as we started.
                p.lineTo(ox + startWidth * nx, oy + startWidth * ny);
            }, true);
        }

        path.points.forEach(point => {
            graphics.drawCircle(point.position.x, point.position.y, this.pressureCurve(point.pressure) * this.width / 2, true);
        });
    }
}