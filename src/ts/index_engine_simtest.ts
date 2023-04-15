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

let bodies: Rigidbody2D[] = [];
let constraints: Constraint2D[] = [];

let bodyRadius = 0.4;

function updateBody(body: Rigidbody2D, delta: number) {
   body.applyMotion(delta);
   
   if(body.inverseMass > 0){
      body.addImmediateForce(0, 20 / body.inverseMass, delta);
   }
}

function setupScene_gears() {
   let a = new Rigidbody2D();
   a.translateTo(-2, 0);
   
   let aWeight = new Rigidbody2D();
   aWeight.translateTo(-2.5, 1);
   aWeight.inverseMass = 1;

   let b = new Rigidbody2D();
   b.translateTo(2, 0);

   let bWeight = new Rigidbody2D();
   bWeight.translateTo(2 + 1, 1);

   bWeight.inverseMass = 1 / 1;

   bodies.push(a);
   bodies.push(b);
   bodies.push(aWeight);
   bodies.push(bWeight);

   let aPin = new PinConstraint2D(new ConstraintAttachment2D(a), a.position.clone());
   let bPin = new PinConstraint2D(new ConstraintAttachment2D(b), b.position.clone());

   let aWeightConstraint = new DistanceConstraint2D(new ConstraintAttachment2D(a, new Vector2(-0.5, 0)), new ConstraintAttachment2D(aWeight));
   let bWeightConstraint = new DistanceConstraint2D(new ConstraintAttachment2D(b, new Vector2(1, 0)), new ConstraintAttachment2D(bWeight));

   let axleConstraint = new AxleCosntraint2D(a, b);
   axleConstraint.gearRatio = 2;

   constraints.push(aPin);
   constraints.push(bPin);

   constraints.push(aWeightConstraint);
   constraints.push(bWeightConstraint);
   constraints.push(axleConstraint);
}

function setupScene(){
   let piston = new Rigidbody2D();
   piston.translateTo(0, -2);

   // Make sure we cannot rotate the piston.
   piston.inverseInertia = 0;

   let counterWeight = new Rigidbody2D();
   counterWeight.translateTo(0, 0);

   let pistonWalls = new AxisConstraint2D(new ConstraintAttachment2D(piston), new Vector2(0, 0), new Vector2(0, 1));
   let crankArm = new DistanceConstraint2D(new ConstraintAttachment2D(piston), new ConstraintAttachment2D(counterWeight, new Vector2(0.5, 0)));
   let crankShaft = new PinConstraint2D(new ConstraintAttachment2D(counterWeight), counterWeight.position.clone());

   bodies.push(piston);
   bodies.push(counterWeight);

   constraints.push(pistonWalls);
   constraints.push(crankShaft);
   constraints.push(crankArm);
}

function setupScene_axle() {
   // Create the bodies
   let piston = new Rigidbody2D();
   piston.translateTo(-1, -3);
   piston.inverseMass = 1;
   piston.inverseInertia = 1 / 10; // MR^2
   
   let counterweight = new Rigidbody2D();
   counterweight.translateTo(0, -0.5);
   counterweight.inverseInertia = 1 / 10; // MR^2

   let axle = new Rigidbody2D();
   axle.translateTo(-2, 0);

   bodies.push(piston);
   bodies.push(counterweight);
   bodies.push(axle);

   let connectionrod = new DistanceConstraint2D(new ConstraintAttachment2D(piston, new Vector2(-0.4, 0.5)), new ConstraintAttachment2D(counterweight, new Vector2(-0.5, 0)));
   let crankshaft = new PinConstraint2D(new ConstraintAttachment2D(counterweight, new Vector2(0.5, 0.5)), new Vector2(0.5, 0));
   let axlePin = new PinConstraint2D(new ConstraintAttachment2D(axle), axle.position.clone());

   let axisConstraint = new AxisConstraint2D(new ConstraintAttachment2D(piston, new Vector2(0, -0.5)), piston.position.clone().addY(-0.5), new Vector2(0, 1).normalize())
   let axleConstraint = new AxleCosntraint2D(axle, counterweight);
   axleConstraint.gearRatio = 2;

   constraints.push(connectionrod);
   constraints.push(crankshaft);
   constraints.push(axisConstraint);
   constraints.push(axlePin);
   constraints.push(axleConstraint);
}

function setupMouseControls(canvas: HTMLCanvasElement) {
   let selected: Rigidbody2D | undefined = undefined;

   let offsetX = 0;
   let offsetY = 0;

   // Hacky nullable stuff.
   let constraint = new PinConstraint2D(new ConstraintAttachment2D(selected!), new Vector2());
   constraint.enabled = false;

   constraints.push(constraint);

   let select = (body?: Rigidbody2D) => {
      selected = body;

      constraint.attachment = new ConstraintAttachment2D(selected!, body?.inverseBasis?.transform(new Vector2(offsetX, offsetY)));
      constraint.enabled = body !== undefined;
      
   }

   canvas.addEventListener("mousedown", (ev) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      let distance = bodyRadius;

      bodies.forEach(body => {
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
   graphics.context.miterLimit = 10; // Kinda stupid but works :)
   graphics.setViewportSettings(new ViewportSettings(-5, -5, 5, 5, ViewportFit.Contain));

   let lineWidth = 4;

   graphics.setLineWidthInPoints(lineWidth);

   setupMouseControls(canvas);
   setupScene();

   let update = (delta: number) => {
      bodies.forEach(body => updateBody(body, delta));

      constraints.forEach(constraint => {
         if (constraint.enabled) {
            constraint.init(delta)
         }
      });
      for(let i = 0; i < 1; i++){
         constraints.forEach(constraint => {
            if (constraint.enabled) {
               constraint.apply(delta);
            }
         });
      }

      bodies.forEach(body => body.recalculateVelocity(delta));
   };

   let draw = () => {
      graphics.setup();

      let background = "#e0ddd5";
      let foreground = "#352f20";
      
      graphics.setFillColor(background);
      graphics.drawBackground();
      
      graphics.setFillColor(foreground);
      graphics.setStrokeColor(background);
      graphics.setLineWidthInPoints(2);

      graphics.setStrokeColor("red");
      constraints.forEach(constraint => {
         if(!constraint.enabled) return;

         if ((constraint instanceof DistanceConstraint2D)){
            let from = constraint.from.getGlobalAttachmentPosition(new Vector2());
            let to = constraint.to.getGlobalAttachmentPosition(new Vector2());
            
            graphics.drawLine(from.x, from.y, to.x, to.y);
            graphics.drawCircle(from.x, from.y, graphics.pointSize * lineWidth, false);
            graphics.drawCircle(to.x, to.y, graphics.pointSize * lineWidth, false);
         }
         if ((constraint instanceof PinConstraint2D)){
            let attachment = constraint.attachment.getGlobalAttachmentPosition(new Vector2());
            let origin = constraint.origin;

            let size = lineWidth * graphics.pointSize * 1;
            
            graphics.drawLine(origin.x, origin.y, attachment.x, attachment.y);
            graphics.drawLine(attachment.x - size, attachment.y - size, attachment.x + size, attachment.y + size);
            graphics.drawLine(attachment.x - size, attachment.y + size, attachment.x + size, attachment.y - size);
         }
         if ((constraint instanceof AxisConstraint2D)){
            let attachment = constraint.attachment.getGlobalAttachmentPosition(new Vector2());
            let origin = constraint.origin;
            let axis = constraint.axis;

            origin = attachment;

            let axisSize = lineWidth * graphics.pointSize * 8;

            let anx = axis.y * axisSize / 4;
            let any = -axis.x * axisSize / 4;
            
            graphics.drawLine(origin.x - anx, origin.y - any, origin.x + anx, origin.y + any);
            graphics.drawLine(origin.x - axis.x * axisSize, origin.y - axis.y * axisSize, origin.x + axis.x * axisSize, origin.y + axis.y * axisSize);
         }
      });

      graphics.setStrokeColor("green");
      bodies.forEach(body => {
         graphics.drawCircle(body.position.x, body.position.y, bodyRadius, false);

         graphics.drawLine(body.position.x, body.position.y, body.position.x + body.basis.xx * bodyRadius * 1.1, body.position.y + body.basis.xy * bodyRadius * 1.1);
      });
   }

   let previousTime = window.performance.now();
   let elapsedTime = 0;

   let tick = () => {
      requestAnimationFrame(tick);

      let currentTime = window.performance.now();

      // Unsecure whatever context so 100
      let delta = (currentTime - previousTime) / 1000;

      if(delta > 0.2){
         delta = 0.2;
      }

      previousTime = currentTime;

      let substeps = 1;
      for (let i = 0; i < substeps; i++) {
         update (delta / substeps);
      }
      draw();
   }

   requestAnimationFrame(tick);
});
