import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { Vector2 } from "expirimental/math/Vector2";
import { EnginePartGraphics } from "expirimental/paths/EnginePartGraphics";
import { AxisConstraint2D } from "expirimental/xpbd/AxisConstraint2D";
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

let bodyGraphics: RigidbodyGraphic2D[] = [];
let bodies: Rigidbody2D[] = [];
let constraints: Constraint2D[] = [];

function updateBody(body: Rigidbody2D, delta: number) {
   body.applyMotion(delta);
   body.addImmediateForce(0, 20, delta);
}

function setupScene() {
   let cylinderWidth = 1;
   let pistonThickness = 0.8;

   let crankRadius = 0.6;
   let connectingRodLength = 1.7;
   let cylinderHeight = connectingRodLength + crankRadius + 0.5;

   let valveWidth = 0.3;
   let valveOffsetFromCenter = 0.15;
   let valveHeight = 0.5;
   let camRadius = valveWidth / 2;
   let camRadiusOuter = camRadius + 0.1;

   // Create the bodies
   let piston = new Rigidbody2D();
   piston.translateTo(0, -connectingRodLength - crankRadius);

   let arm = new Rigidbody2D();
   arm.translateTo(0, -crankRadius);

   let counterWeight = new Rigidbody2D();
   counterWeight.inverseMass = 0;
   counterWeight.position = new Vector2(0, 0);

   let cylinderWalls = new Rigidbody2D();
   cylinderWalls.inverseMass = 0;
   cylinderWalls.translateTo(0, -cylinderHeight);
   
   let intakeValve = new Rigidbody2D();
   intakeValve.inverseMass = 0;
   intakeValve.translateTo(-valveWidth * 0.5 - valveOffsetFromCenter, -cylinderHeight);

   let exhaustValve = new Rigidbody2D();
   exhaustValve.inverseMass = 0;
   exhaustValve.translateTo(valveWidth * 0.5 + valveOffsetFromCenter, -cylinderHeight);

   let intakeKnob = new Rigidbody2D();
   intakeKnob.inverseMass = 0;
   intakeKnob.translateTo(-valveWidth * 0.5 - valveOffsetFromCenter, -cylinderHeight - valveHeight - camRadius);

   let exhaustKnob = new Rigidbody2D();
   exhaustKnob.inverseMass = 0;
   exhaustKnob.translateTo(valveWidth * 0.5 + valveOffsetFromCenter, -cylinderHeight - valveHeight - camRadius);

   bodies.push(piston);
   bodies.push(arm);
   bodies.push(counterWeight);
   bodies.push(cylinderWalls);
   bodies.push(intakeValve);
   bodies.push(exhaustValve);
   bodies.push(intakeKnob);
   bodies.push(exhaustKnob);

   // Create the constraints
   let armAttachmentFixed = new DistanceConstraint2D(new ConstraintAttachment2D(arm), new ConstraintAttachment2D(counterWeight), 1);
   let headArmAttachment = new DistanceConstraint2D(new ConstraintAttachment2D(piston), new ConstraintAttachment2D(arm), 1);

   let headAxisConstraint = new AxisConstraint2D(new ConstraintAttachment2D(piston), new Vector2(0, -2), new Vector2(0, 1));

   armAttachmentFixed.resetRestDistance();
   headArmAttachment.resetRestDistance();

   constraints.push(armAttachmentFixed);
   constraints.push(headArmAttachment);
   constraints.push(headAxisConstraint);

   // Create the visuals
   let engineGraphics = new EnginePartGraphics();
   engineGraphics.lineWidth = graphics.pointSize * 8;

   let headGraphics = new RigidbodyGraphic2D(piston, engineGraphics.createPiston(cylinderWidth, pistonThickness));
   let armGraphics = new RigidbodyGraphic2D(arm, engineGraphics.createArm(headArmAttachment.restDistance));
   let fixedGraphics = new RigidbodyGraphic2D(counterWeight, engineGraphics.createCounterWeight(crankRadius));
   let cylinderWallsGraphics = new RigidbodyGraphic2D(cylinderWalls, engineGraphics.createCylinderWalls(1, 0, cylinderHeight - crankRadius, valveWidth, valveOffsetFromCenter));

   let intakeValveGraphics = new RigidbodyGraphic2D(intakeValve, engineGraphics.createValve(valveWidth, valveHeight));
   let exhaustValveGraphics = new RigidbodyGraphic2D(exhaustValve, engineGraphics.createValve(valveWidth, valveHeight));
   
   let intakeValveKnopGraphics = new RigidbodyGraphic2D(intakeKnob, engineGraphics.createCam(camRadius, camRadiusOuter));
   let exhaustValveKnopGraphics = new RigidbodyGraphic2D(exhaustKnob, engineGraphics.createCam(camRadius, camRadiusOuter));

   armGraphics.alignWith = piston;
   fixedGraphics.alignWith = arm;

   bodyGraphics.push(armGraphics);
   bodyGraphics.push(fixedGraphics);
   bodyGraphics.push(headGraphics);
   bodyGraphics.push(cylinderWallsGraphics);
   bodyGraphics.push(intakeValveGraphics);
   bodyGraphics.push(exhaustValveGraphics);
   bodyGraphics.push(intakeValveKnopGraphics);
   bodyGraphics.push(exhaustValveKnopGraphics);
}

function setupMouseControls(canvas: HTMLCanvasElement) {
   let selected: Rigidbody2D | undefined = undefined;

   let offsetX = 0;
   let offsetY = 0;

   let previousMouseX = 0;
   let previousMouseY = 0;

   // Hacky nullable stuff.
   let constraint = new PinConstraint2D(new ConstraintAttachment2D(selected!), new Vector2());
   constraint.enabled = false;

   constraints.push(constraint);

   let select = (body?: Rigidbody2D) => {
      selected = body;

      constraint.attachment = new ConstraintAttachment2D(selected!);
      constraint.enabled = body !== undefined;
   }

   canvas.addEventListener("mousedown", (ev) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      let distance = 0.4;

      bodies.forEach(body => {
         let d = Vector2.fDistance(p.x, p.y, body.position.x, body.position.y);

         if (d < distance) {
            distance = d;
            select(body);
            offsetX = body.position.x - p.x;
            offsetY = body.position.y - p.y;
         }
      });

      previousMouseX = p.x;
      previousMouseY = p.y;
   });

   canvas.addEventListener("mousemove", (ev) => {
      let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

      constraint.origin.apply(p.x - offsetX, p.y - offsetY);

      previousMouseX = p.x;
      previousMouseY = p.y;
   });

   canvas.addEventListener("mouseup", ev => {
      select(undefined);
   });

}

document.addEventListener("DOMContentLoaded", async () => {
   let canvas = document.getElementById("canvas") as HTMLCanvasElement;
   graphics = new Graphics2D(canvas);
   graphics.context.miterLimit = 10; // Kinda stupid but works :)
   graphics.setViewportSettings(new ViewportSettings(-3, -5, 3, 1, ViewportFit.Contain));

   let lineWidth = 10;

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
      constraints.forEach(constraint => {
         if (constraint.enabled) {
            constraint.apply(delta);
         }
      });

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
      graphics.setLineWidthInPoints(10);


      bodyGraphics.forEach(graphic => graphic.draw(graphics));

      if(true)return;

      graphics.setStrokeColor("red");
      constraints.forEach(constraint => {
         if (!(constraint instanceof DistanceConstraint2D)) return;

         graphics.drawLine(constraint.from.body.position.x, constraint.from.body.position.y, constraint.to.body.position.x, constraint.to.body.position.y);
      });
      bodies.forEach(body => {
         graphics.drawCircle(body.position.x, body.position.y, graphics.pointSize * lineWidth * 2, false);
      });
   }

   let previousTime = window.performance.now();

   let tick = () => {
      let currentTime = window.performance.now();

      let delta = (currentTime - previousTime) / 1000;

      if(delta > 0.2){
         delta = 0.2;
      }

      previousTime = currentTime;

      let substeps = 1;
      for (let i = 0; i < substeps; i++) {
         update(delta / substeps);
      }
      draw();
      requestAnimationFrame(tick);
   }

   requestAnimationFrame(tick);
});
