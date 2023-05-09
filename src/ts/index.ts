import { gameLoop } from "lib/GameLoop";
import { Color } from "lib/graphics/Color";
import { Graphics2D } from "lib/graphics/Graphics2D";
import { GamepadAxis, GamepadButton, GamepadInput } from "lib/input/GamepadInput";
import { GamepadAxisAction, GamepadButtonInputAction as GamepadButtonAction } from "lib/input/InputAction";
import { InputMap } from "lib/input/InputMap";
import { KeyboardInput } from "lib/input/KeyboardInput";
import { MouseInput } from "lib/input/MouseInput";
import { MathHelper } from "lib/math/MathHelper";
import { RingBuffer } from "lib/math/RingBuffer";
import { Vector2 } from "lib/math/Vector2";
import { ViewportFit, ViewportSettings } from "lib/settings/ViewportSettings";
import { AxisConstraint2D } from "lib/xpbd/AxisConstraint2D";
import { ConstraintAttachment2D } from "lib/xpbd/ConstraintAttachment2D";
import { DistanceConstraint2D } from "lib/xpbd/DistanceConstraint2D";
import { Rigidbody2D } from "lib/xpbd/Rigidbody2D";
import { XPBDScene2D } from "lib/xpbd/XPBDScene2D";

let graphics: Graphics2D;

class WheelBody2D extends Rigidbody2D {
  wheelVelocity: number = 0;
  wheelInverseInertia: number = 1;

  frictionCoefficient: number = 1;

  debug = false;
  
  private _forward = new Vector2();
  private _right = new Vector2();

  private _nxr = new Vector2();
  private _r = new Vector2();
  private _n = new Vector2();
  private _impulse = new Vector2();

  applyFriction(delta: number): void {
    let forward = this.basis.getX(this._forward);
    let right = this.basis.getY(this._right);
    
    // Velocity in normal space
    let groundVelocity = Vector2.dot(forward, this.velocity);
    let forwardVelocity = groundVelocity - this.wheelVelocity;
    let lateralVelocity = Vector2.dot(right, this.velocity);

    let normalForce = this.frictionCoefficient * 500;
    let coefficient = 1;

    let slipAngle = Math.atan(lateralVelocity / Math.abs(this.wheelVelocity));
    let slipRatio = (this.wheelVelocity / groundVelocity - 1);

    if(!isNaN(slipRatio) && !isNaN(slipAngle) && isFinite(slipRatio) && isFinite(slipAngle)){
      let slipAnglePeak = 22 * (Math.PI / 180);
      let slipRatioPeak = 0.4;

      coefficient = Math.max(
        MathHelper.clamp(Math.abs(slipAngle) / slipAnglePeak, 0, 1),
        MathHelper.clamp(Math.abs(slipRatio) / slipRatioPeak, 0, 1));
    }

    let n = this._n.apply(this.velocity.x * delta, this.velocity.y * delta).addScaled(forward, -this.wheelVelocity * delta);
    let r = this._r.apply(forwardVelocity * delta, lateralVelocity * delta);
    let nxr = this._nxr.set(r).perpendicularize(); // Cross with (0, 0, 1)

    let distance = n.length;

    if(distance == 0) return;

    n.scale(1 / distance);

    let w1 = this.inverseMass + nxr.y * this.wheelInverseInertia * nxr.y; // Due to the inertia tensor being zero everywhere else, this would be the correct calculation
    let w2 = 0;

    let c = distance;
    let deltaLambda = (-c) / (w1 + w2);

    let lambdaMax = normalForce * coefficient * (delta * delta);

    if(Math.abs(deltaLambda) > lambdaMax){
      deltaLambda = Math.sign(deltaLambda) * lambdaMax;
    }

    let impulse = this._impulse.set(n).scale(deltaLambda);
  

    this.addImmediateImpulseAt(impulse.x, impulse.y, this.position.x, this.position.y, delta);
    this.wheelVelocity -= Vector2.dot(impulse, forward) / delta * this.wheelInverseInertia; // Note that the force on the x axis (the forward axis for the wheel) is the actual rotational impulse force
  }

  get wheelInertia(){
    return 1 / this.wheelInverseInertia;
  }
  set wheelInertia(inertia: number){
    this.wheelInverseInertia = 1 / inertia;
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  // Graphics etc
  let canvas = document.getElementById("canvas") as HTMLCanvasElement;
  graphics = new Graphics2D(canvas);
  graphics.setViewportSettings(ViewportSettings.centered(0, 0, 640, 360, ViewportFit.Cover));
  
  // Input devices setup (?)
  let keyboard = new KeyboardInput();
  let gamepads = new GamepadInput();
  let mouse = new MouseInput();

  // Input mapping
  let inputMap = new InputMap();

  inputMap.registerAction("steer_left", new GamepadAxisAction(gamepads, 0, GamepadAxis.LeftStickLeft));
  inputMap.registerAction("steer_right", new GamepadAxisAction(gamepads, 0, GamepadAxis.LeftStickRight));

  inputMap.registerAction("accelerate", new GamepadAxisAction(gamepads, 0, GamepadAxis.RightTrigger));
  inputMap.registerAction("brake", new GamepadAxisAction(gamepads, 0, GamepadAxis.LeftTrigger));

  inputMap.registerAction("boost", new GamepadButtonAction(gamepads, 0, GamepadButton.A));

  // Physics setup
  let scene = new XPBDScene2D();
  
  let car = new Rigidbody2D();
  let leftFrontWheel = new WheelBody2D();
  let rightFrontWheel = new WheelBody2D();
  let leftRearWheel = new WheelBody2D();
  let rightRearWheel = new WheelBody2D();

  car.mass = 20;
  car.inertia = 80;

  car.translateTo(0, 0);
  leftFrontWheel.translateTo(10, -6);
  leftRearWheel.translateTo(-10, -6);
  rightFrontWheel.translateTo(10, 6);
  rightRearWheel.translateTo(-10, 6);

  scene.addBody(car);
  scene.addBody(leftFrontWheel);
  scene.addBody(leftRearWheel);
  scene.addBody(rightFrontWheel);
  scene.addBody(rightRearWheel);

  let leftFrontWheelConstraint = new DistanceConstraint2D(new ConstraintAttachment2D(car, leftFrontWheel.position.clone()), new ConstraintAttachment2D(leftFrontWheel));
  let leftRearWheelConstraint = new DistanceConstraint2D(new ConstraintAttachment2D(car, leftRearWheel.position.clone()), new ConstraintAttachment2D(leftRearWheel));
  let rightFrontWheelConconstraint = new DistanceConstraint2D(new ConstraintAttachment2D(car, rightFrontWheel.position.clone()), new ConstraintAttachment2D(rightFrontWheel));
  let rightRearWheelConstraint = new DistanceConstraint2D(new ConstraintAttachment2D(car, rightRearWheel.position.clone()), new ConstraintAttachment2D(rightRearWheel));

  scene.addConstraint(leftFrontWheelConstraint);
  scene.addConstraint(leftRearWheelConstraint);
  scene.addConstraint(rightFrontWheelConconstraint);
  scene.addConstraint(rightRearWheelConstraint);
  

  scene.substeps = 10;

  scene.addExternalForce((delta: number) => {
    let inputSteer = inputMap.getAxis("steer_left", "steer_right");
    let inputAccelerate = inputMap.getActionStrength("accelerate");
    let inputBrake = inputMap.getActionStrength("brake");
    let inputBoost = inputMap.isActionPressed("boost");

    leftFrontWheel.rotation = car.rotation + inputSteer * Math.PI * 0.25;
    rightFrontWheel.rotation = car.rotation + inputSteer * Math.PI * 0.25;

    leftRearWheel.rotation = car.rotation;
    rightRearWheel.rotation = car.rotation;
    
    leftRearWheel.wheelVelocity = MathHelper.moveToward(leftRearWheel.wheelVelocity, 200, inputAccelerate * delta * 1500 * leftRearWheel.wheelInverseInertia);
    rightRearWheel.wheelVelocity = MathHelper.moveToward(rightRearWheel.wheelVelocity, 200, inputAccelerate * delta * 1500 * rightRearWheel.wheelInverseInertia);

    leftRearWheel.wheelVelocity = MathHelper.moveToward(leftRearWheel.wheelVelocity, 0, inputBrake * delta * 2000 * leftRearWheel.wheelInverseInertia);
    leftFrontWheel.wheelVelocity = MathHelper.moveToward(leftFrontWheel.wheelVelocity, 0, inputBrake * delta * 2000 * leftFrontWheel.wheelInverseInertia);
    rightRearWheel.wheelVelocity = MathHelper.moveToward(rightRearWheel.wheelVelocity, 0, inputBrake * delta * 2000 * rightRearWheel.wheelInverseInertia);
    rightFrontWheel.wheelVelocity = MathHelper.moveToward(rightFrontWheel.wheelVelocity, 0, inputBrake * delta * 2000 * rightFrontWheel.wheelInverseInertia);

    
    
    if(inputBoost){
      var forward = leftRearWheel.basis.getX(new Vector2()).scale(10000);
      leftRearWheel.addImmediateForce(forward.x, forward.y, delta);
    }
  });

  let trailLength = 1000;

  let rightFrontWheelTrail = new RingBuffer<Vector2>(trailLength);
  let leftFrontWheelTrail = new RingBuffer<Vector2>(trailLength);
  let rightRearWheelTrail = new RingBuffer<Vector2>(trailLength);
  let leftRearWheelTrail = new RingBuffer<Vector2>(trailLength);
  let trailAccumulator = 0;

  // Game loop
  gameLoop((delta) => {
    keyboard.poll();
    gamepads.poll();
    mouse.poll();
  
    graphics.setup();

    scene.update(delta);

    trailAccumulator -= delta;
    if(trailAccumulator < 0){
      rightFrontWheelTrail.push(rightFrontWheel.position.clone());
      leftFrontWheelTrail.push(leftFrontWheel.position.clone());
      rightRearWheelTrail.push(rightRearWheel.position.clone());
      leftRearWheelTrail.push(leftRearWheel.position.clone());

      trailAccumulator += 0.01;
    }
    
    graphics.setStrokeColor(new Color(0.9, 0.9, 0.9, 1));
    graphics.setLineWidthInPoints(8);
    graphics.drawPath(path => {
      rightFrontWheelTrail.forEach(v => path.lineTo(v.x, v.y));
    }, false);
    graphics.drawPath(path => {
      leftFrontWheelTrail.forEach(v => path.lineTo(v.x, v.y));
    }, false);
    graphics.drawPath(path => {
      rightRearWheelTrail.forEach(v => path.lineTo(v.x, v.y));
    }, false);
    graphics.drawPath(path => {
      leftRearWheelTrail.forEach(v => path.lineTo(v.x, v.y));
    }, false);

    graphics.setStrokeColor(Color.black);
    graphics.setLineWidthInPoints(1);

    // Draw the car
    graphics.push();
    graphics.translate(car.position.x, car.position.y);
    graphics.rotate(car.rotation);
    graphics.drawRectangle(-16, -8, 32, 16, false);
    graphics.pop();
    
    // Draw the wheels
    graphics.push();
    graphics.translate(leftFrontWheel.position.x, leftFrontWheel.position.y);
    graphics.rotate(leftFrontWheel.rotation);
    graphics.drawRectangle(-4, -2, 8, 4, false);
    graphics.pop();
    
    graphics.push();
    graphics.translate(leftRearWheel.position.x, leftRearWheel.position.y);
    graphics.rotate(leftRearWheel.rotation);
    graphics.drawRectangle(-4, -2, 8, 4, false);
    graphics.pop();
    
    graphics.push();
    graphics.translate(rightFrontWheel.position.x, rightFrontWheel.position.y);
    graphics.rotate(rightFrontWheel.rotation);
    graphics.drawRectangle(-4, -2, 8, 4, false);
    graphics.pop();
    
    graphics.push();
    graphics.translate(rightRearWheel.position.x, rightRearWheel.position.y);
    graphics.rotate(rightRearWheel.rotation);
    graphics.drawRectangle(-4, -2, 8, 4, false);
    graphics.pop();

  });
});
