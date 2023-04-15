import { SolverScene } from "engine-sim/SolverScene";
import { createEngineTestScene } from "engine-sim/TestScenes";
import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { Vector2 } from "expirimental/math/Vector2";
import { EnginePartGraphics } from "expirimental/paths/EnginePartGraphics";
import { AxisConstraint2D } from "expirimental/xpbd/AxisConstraint2D";
import { AxleCosntraint2D } from "expirimental/xpbd/AxleConstraint2D";
import { Constraint2D } from "expirimental/xpbd/Constraint2D";
import { ConstraintAttachment2D } from "expirimental/xpbd/ConstraintAttachment2D";
import { DistanceConstraint2D } from "expirimental/xpbd/DistanceConstraint2D";
import { PinConstraint2D } from "expirimental/xpbd/PinConstraint2D";
import { Rigidbody2D } from "expirimental/xpbd/Rigidbody2D";
import { RigidbodyGraphic2D } from "expirimental/xpbd/graphics/RigidbodyGraphic2D";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { ImageLoader } from "lib/loader/ImageLoader";
import { ImageGrid } from "lib/pixels/ImageGrid";
import { Sampler } from "lib/pixels/Sampler";
import { ViewportFit, ViewportSettings } from "lib/settings/ViewportSettings";


let graphics: Graphics2D;
let scene: SolverScene;

function setupMouseControls(canvas: HTMLCanvasElement) {
   let selected: Rigidbody2D | undefined = undefined;

   let offsetX = 0;
   let offsetY = 0;

   // Hacky nullable stuff.
   let constraint = new PinConstraint2D(new ConstraintAttachment2D(selected!), new Vector2());
   constraint.enabled = false;

   scene.constraints.push(constraint);

   let select = (body?: Rigidbody2D) => {
      selected = body;

      constraint.attachment = new ConstraintAttachment2D(selected!, body?.inverseBasis?.transform(new Vector2(offsetX, offsetY)));
      constraint.enabled = body !== undefined;
      
   }

   canvas.addEventListener("mousedown", (ev) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      let distance = 0.4;

      scene.bodies.forEach(body => {
         let d = Vector2.fDistance(p.x, p.y, body.position.x, body.position.y);

         if (d < distance) {
            distance = d;
            offsetX = p.x - body.position.x;
            offsetY = p.y - body.position.y;
            select(body);
         }
      });
   });

   canvas.addEventListener("mousemove", (ev) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      constraint.origin.apply(p.x, p.y);
   });

   canvas.addEventListener("mouseup", ev => {
      select(undefined);
   });

}

document.addEventListener("DOMContentLoaded", async () => {
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   graphics = new Graphics2D(canvas);
   graphics.context.miterLimit = 10;
   graphics.setViewportSettings(new ViewportSettings(-5, -5, 5, 5, ViewportFit.Contain));
//    graphics.setViewportSettings(new ViewportSettings(-50, -50, 50, 50, ViewportFit.Contain));

   scene = createEngineTestScene();

   scene.substeps = 1;

   setupMouseControls(canvas);

   let update = (delta: number) => {
      scene.update(delta);
   };

   let draw = () => {
      graphics.setup();

      let background = "#e0ddd5";
      let foreground = "#352f20";
      
      graphics.setFillColor(background);
      graphics.drawBackground();

      graphics.setLineWidthInPoints(4);
      graphics.setStrokeColor(background);
      graphics.setFillColor(foreground);
      scene.draw(graphics);

      scene.drawDebug(graphics, 0.3);
   }

   let previousTime = window.performance.now();
   let tick = () => {
      requestAnimationFrame(tick);

      let currentTime = window.performance.now();

      let delta = (currentTime - previousTime) / 1000;

      if(delta > 0.2){
         delta = 0.2;
      }

      previousTime = currentTime;

      // In reality you should _never_ use the actual elapsed delta but a fixed delta time
      // but this is fine for a nice and smooth browser experience.
      update (delta);
      draw();
   }

   requestAnimationFrame(tick);
});
