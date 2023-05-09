import { Constraint2D } from "./Constraint2D";
import { ExternalForce2D } from "./ExternalForce2D";
import { Rigidbody2D } from "./Rigidbody2D";

export class XPBDScene2D {
    bodies: Rigidbody2D[];
    constraints: Constraint2D[];

    externalForces: ExternalForce2D[];

    substeps: number = 10;

    constructor(){
        this.bodies = [];
        this.constraints = [];
        this.externalForces = [];
    }

    addBody(body: Rigidbody2D){
        this.bodies.push(body);
    }
    addConstraint(constraint: Constraint2D){
        this.constraints.push(constraint);
    }
    addExternalForce(force: ExternalForce2D){
        this.externalForces.push(force);
    }

    update(delta: number){
        let subdelta = delta / this.substeps;
        for(let i = 0; i < this.substeps; i++){
            this.step(subdelta);
        }
    }

    private step(delta: number){
        this.bodies.forEach(body => body.applyMotion(delta));

        this.externalForces.forEach(force => force(delta, this));

        this.constraints.forEach(constraint => {
            if (constraint.enabled) {
                constraint.init(delta)
            }
        });
        this.constraints.forEach(constraint => {
            if (constraint.enabled) {
                constraint.apply(delta);
            }
        });

        this.bodies.forEach(body => body.recalculateVelocity(delta));
        
        this.bodies.forEach(body => body.applyFriction(delta));

        this.constraints.forEach(constraint => {
            if (constraint.enabled) {
                constraint.applyDamping(delta);
            }
        });

    }
}