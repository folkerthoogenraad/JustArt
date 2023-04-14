import { Vector2 } from "expirimental/math/Vector2";
import { Constraint2D } from "./Constraint2D";
import { Rigidbody2D } from "./Rigidbody2D";
import { ConstraintAttachment2D } from "./ConstraintAttachment2D";


export class DistanceConstraint2D extends Constraint2D {
    compliance: number;
    restDistance: number;

    from: ConstraintAttachment2D;
    to: ConstraintAttachment2D;

    lambda: number = 0;

    constructor(from: ConstraintAttachment2D, to: ConstraintAttachment2D, distance?: number, compliance: number = 0) {
        super();

        this.from = from;
        this.to = to;

        if(distance !== undefined){
            this.restDistance = distance;
        }
        else{
            this.restDistance = this.calculateDistance();
        }
        this.compliance = compliance;
    }

    resetRestDistance(){
        this.restDistance = this.calculateDistance();
    }

    calculateDistance(){
        let fromGlobalAttachmentPosition = this.from.getGlobalAttachmentPosition(this._fromGlobalAttachmentPosition);
        let toGlobalAttachmentPosition = this.to.getGlobalAttachmentPosition(this._toGlobalAttachmentPosition);
        
        let direction = Vector2.directionOut(fromGlobalAttachmentPosition, toGlobalAttachmentPosition, this._direction);
        let distance = direction.length;

        return distance;
    }

    init(delta: number): void {
        this.lambda = 0;
    }

    // Variables needed in the apply function that we don't want to reallocate :)
    private _fromGlobalAttachmentPosition: Vector2 = new Vector2();
    private _toGlobalAttachmentPosition: Vector2 = new Vector2();

    private _direction: Vector2 = new Vector2();
    private _fromLocalDirection: Vector2 = new Vector2();
    private _toLocalDirection: Vector2 = new Vector2();

    private _impulse: Vector2 = new Vector2();

    apply(delta: number): void {
        let fromGlobalAttachmentPosition = this.from.getGlobalAttachmentPosition(this._fromGlobalAttachmentPosition);
        let toGlobalAttachmentPosition = this.to.getGlobalAttachmentPosition(this._toGlobalAttachmentPosition);
        
        let direction = Vector2.directionOut(fromGlobalAttachmentPosition, toGlobalAttachmentPosition, this._direction);
        let distance = direction.length;
        
        if(distance == 0) return;

        direction.scale(1 / distance);

        let fromLocalDirection = this.from.getLocalDirection(direction, this._fromLocalDirection);
        let toLocalDirection = this.to.getLocalDirection(direction, this._toLocalDirection);
        
        let w1 = this.from.getLocalGeneralizedInverseMass(fromLocalDirection);
        let w2 = this.to.getLocalGeneralizedInverseMass(toLocalDirection);

        let alpha = this.compliance / (delta * delta);

        let c = distance - this.restDistance;
        let deltaLambda = (-c + this.lambda * alpha) / (w1 + w2 + alpha);

        this.lambda += deltaLambda;

        let impulse = this._impulse.set(direction).scale(deltaLambda);
        
        this.from.body.addImmediateImpulseAt(-impulse.x, -impulse.y, fromGlobalAttachmentPosition.x, fromGlobalAttachmentPosition.y, delta);
        this.to.body.addImmediateImpulseAt(impulse.x, impulse.y, toGlobalAttachmentPosition.x, toGlobalAttachmentPosition.y, delta);
    }
}