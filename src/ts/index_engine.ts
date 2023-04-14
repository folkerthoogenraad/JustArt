import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { EnginePartGraphics } from "expirimental/paths/EnginePartGraphics";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { ImageLoader } from "lib/loader/ImageLoader";
import { ImageGrid } from "lib/pixels/ImageGrid";
import { Sampler } from "lib/pixels/Sampler";
import { ViewportFit, ViewportSettings } from "lib/settings/ViewportSettings";


let graphics: Graphics2D;



document.addEventListener("DOMContentLoaded", async ()=>{
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    graphics = new Graphics2D(canvas);
    graphics.context.miterLimit = 10; // Kinda stupid but works :)
    graphics.setViewportSettings(new ViewportSettings(-2, -2, 2, 2, ViewportFit.Contain));

    let engineGraphics = new EnginePartGraphics();
    engineGraphics.lineWidth = graphics.pointSize * 10;

    let piston = engineGraphics.createPiston(1, 0.8);
    let arm = engineGraphics.createArm(1.5);
    let weight = engineGraphics.createCounterWeight(0.7);

    graphics.setFillColor("black");
    graphics.setStrokeColor("white");
    graphics.setLineWidthInPoints(20);

    graphics.translate(0, -0.75);
    
    graphics.push();
    graphics.translate(0, 1.5);
    graphics.rotateDeg(-90);
    graphics.drawPath(arm, true);
    graphics.pop();
    
    graphics.push();
    
    graphics.translate(0, 1.5 - 0.7);
    graphics.rotateDeg(90);
    graphics.drawPath(weight, false);
    graphics.drawPath(weight, true);
    
    graphics.pop();

    graphics.drawPath(piston, false);
    graphics.drawPath(piston, true);
 });
 