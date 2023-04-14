import { Vector2 } from "expirimental/math/Vector2";
import { Constraint2D } from "expirimental/xpbd/Constraint2D";
import { ConstraintAttachment2D } from "expirimental/xpbd/ConstraintAttachment2D";
import { DistanceConstraint2D } from "expirimental/xpbd/DistanceConstraint2D";
import { Rigidbody2D } from "expirimental/xpbd/Rigidbody2D";

interface EngineCylinderSettings {
    cylinderWidth: number;
    cylinderHeight: number;

    connectingRodLength: number;

    pistonThickness: number;

    crankRadius: number;

    valveWidth: number;
    valveOffsetFromCenter: number;

    camRadius: number;
    camRadiusOuter: number;
}

export class EngineCylinder {
    piston: Rigidbody2D;
    counterWeight: Rigidbody2D;

    connectingRod: DistanceConstraint2D;

    constructor(settings: EngineCylinderSettings){
        this.piston = new Rigidbody2D();
        this.piston.translateTo(0, -(settings.connectingRodLength + settings.crankRadius));

        this.counterWeight = new Rigidbody2D();
        this.counterWeight.position = new Vector2(0, 0);

        this.connectingRod = new DistanceConstraint2D(
            new ConstraintAttachment2D(this.piston),
            new ConstraintAttachment2D(this.counterWeight, new Vector2(settings.crankRadius, 0))
        );
    }

    getBodies(): Rigidbody2D[] {
        return [this.piston, this.counterWeight];
    }
    getConstraints(): Constraint2D[] {
        return [this.connectingRod];
    }
}