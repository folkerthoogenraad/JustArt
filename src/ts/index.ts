import { InterpolationCurves } from "expirimental/math/InterpolationCurve";
import { MathHelper } from "expirimental/math/MathHelper";
import { Vector2 } from "expirimental/math/Vector2";
import { EnginePartGraphics } from "expirimental/paths/EnginePartGraphics";
import { AxisConstraint2D } from "expirimental/xpbd/AxisConstraint2D";
import { Constraint2D } from "expirimental/xpbd/Constraint2D";
import { ConstraintAttachment2D } from "expirimental/xpbd/ConstraintAttachment2D";
import { DistanceConstraint2D } from "expirimental/xpbd/DistanceConstraint2D";
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

function updateBody(body: Rigidbody2D, delta: number){
    body.applyMotion(delta);
    body.addImmediateCentralForce(0, 20, delta);
}

function setupScene(){
    let fixedLength = 0.6;
    let headLength = 1.7;
    // Create the bodies
    let head = new Rigidbody2D();
    head.position = new Vector2(0, -headLength);
    
    let arm = new Rigidbody2D();
    arm.position = new Vector2(fixedLength, 0);
    arm.velocity = new Vector2(0, 0);
    
    let fixedAttachment = new Rigidbody2D();
    fixedAttachment.inverseMass = 0;
    fixedAttachment.position = new Vector2(0, 0);

    bodies.push(head);
    bodies.push(arm);
    bodies.push(fixedAttachment);

    // Create the constraints
    let armAttachmentFixed = new DistanceConstraint2D(new ConstraintAttachment2D(arm), new ConstraintAttachment2D(fixedAttachment), 1);
    let headArmAttachment = new DistanceConstraint2D(new ConstraintAttachment2D(head), new ConstraintAttachment2D(arm), 1);

    let headAxisConstraint = new AxisConstraint2D(new ConstraintAttachment2D(head), new Vector2(0, -2), new Vector2(0, 1));

    armAttachmentFixed.resetRestDistance();
    headArmAttachment.resetRestDistance();

    constraints.push(armAttachmentFixed);
    constraints.push(headArmAttachment);
    constraints.push(headAxisConstraint);

    // Create the visuals
    let engineGraphics = new EnginePartGraphics();
    engineGraphics.lineWidth = graphics.pointSize * 10;

    let headGraphics = new RigidbodyGraphic2D(head, engineGraphics.createPiston(1, 0.8));
    let armGraphics = new RigidbodyGraphic2D(arm, engineGraphics.createArm(headArmAttachment.restDistance));
    let fixedGraphics = new RigidbodyGraphic2D(fixedAttachment, engineGraphics.createWeight(fixedLength));

    armGraphics.alignWith = head;
    fixedGraphics.alignWith = arm;

    bodyGraphics.push(armGraphics);
    bodyGraphics.push(fixedGraphics);
    bodyGraphics.push(headGraphics);
}

function setupMouseControls(canvas: HTMLCanvasElement){
    let selected: Rigidbody2D|undefined = undefined;

    let offsetX = 0;
    let offsetY = 0;

    let previousMouseX = 0;
    let previousMouseY = 0;

    // Very hacky, should be solved with a nice constraint instead.
    let select = (body?: Rigidbody2D) => {
        selected = body;
    }
    
    canvas.addEventListener("mousedown", (ev) => {
        let p = graphics.canvasToViewport(ev.offsetX, ev.offsetY);

        let distance = 0.4;

        bodies.forEach(body => {
            let d = Vector2.fDistance(p.x, p.y, body.position.x, body.position.y);

            if(d < distance){
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

        if(selected !== undefined){
            selected.position.apply(p.x - offsetX, p.y - offsetY);
        }
        
        previousMouseX = p.x;
        previousMouseY = p.y;
    });

    canvas.addEventListener("mouseup", ev => {
        select(undefined);
    });
    
}

document.addEventListener("DOMContentLoaded", async ()=>{
    let canvas = document.getElementById("canvas") as HTMLCanvasElement;
    graphics = new Graphics2D(canvas);
    graphics.context.miterLimit = 10; // Kinda stupid but works :)
    graphics.setViewportSettings(new ViewportSettings(-3, -3, 3, 3, ViewportFit.Contain));

    let lineWidth = 4;

    graphics.setLineWidthInPoints(lineWidth);

    setupScene();
    setupMouseControls(canvas);

    let update = (delta: number) => {
        bodies.forEach(body => updateBody(body, delta));
        constraints.forEach(constraint => constraint.init(delta));
        constraints.forEach(constraint => constraint.apply(delta));
    };

    let draw = () => {
        graphics.setup();

        graphics.setStrokeColor("white");
        graphics.setLineWidthInPoints(10);

        bodyGraphics.forEach(graphic => graphic.draw(graphics));

        if (true) return;

        graphics.setStrokeColor("red");
        constraints.forEach(constraint => {
            if(!(constraint instanceof DistanceConstraint2D)) return;

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

        previousTime = currentTime;

        let substeps = 1;
        for(let i = 0; i < substeps; i++){
            update(delta / substeps);
        }
        draw();
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
 });
 