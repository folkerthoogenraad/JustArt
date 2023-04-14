import { Graphics2D } from "lib/graphics/Graphics2D";
import { Rigidbody2D } from "../Rigidbody2D";
import { Vector2 } from "expirimental/math/Vector2";
import { DistanceConstraint2D } from "../DistanceConstraint2D";

export class DistanceConstraintGraphic2D {
    constraint: DistanceConstraint2D;

    path: Path2D;

    constructor(constraint: DistanceConstraint2D, path: Path2D){
        this.constraint = constraint;
        this.path = path;
    }

    draw(graphics: Graphics2D){
        graphics.push();

        graphics.translate(this.constraint.from.body.position.x, this.constraint.from.body.position.y);
        
        let dx = Vector2.dx(this.constraint.from.body.position, this.constraint.to.body.position);
        let dy = Vector2.dy(this.constraint.from.body.position, this.constraint.to.body.position);

        let angle = Vector2.fAngle(dx, dy);

        graphics.rotate(angle);

        graphics.drawPath(this.path, false);
        graphics.drawPath(this.path, true);

        graphics.pop();
    }
}