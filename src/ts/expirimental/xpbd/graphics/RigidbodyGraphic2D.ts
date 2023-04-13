import { Graphics2D } from "lib/graphics/Graphics2D";
import { Rigidbody2D } from "../Rigidbody2D";
import { Vector2 } from "expirimental/math/Vector2";

export class RigidbodyGraphic2D {
    body: Rigidbody2D;
    alignWith?: Rigidbody2D; // Hacky solution but whatever :)

    path: Path2D;

    constructor(body: Rigidbody2D, path: Path2D){
        this.body = body;
        this.path = path;
    }

    draw(graphics: Graphics2D){
        graphics.push();

        graphics.translate(this.body.position.x, this.body.position.y);
        
        if(this.alignWith){
            let dx = Vector2.dx(this.body.position, this.alignWith.position);
            let dy = Vector2.dy(this.body.position, this.alignWith.position);

            let angle = Vector2.fAngle(dx, dy);

            graphics.rotate(angle);
        }
        else{
            graphics.rotate(this.body.rotation);
        }

        graphics.drawPath(this.path, false);
        graphics.drawPath(this.path, true);

        graphics.pop();
    }
}