import { Matrix2 } from "expirimental/math/Matrix2";
import { Vector2 } from "expirimental/math/Vector2";

export class Rigidbody2D {
    inverseMass: number;
    inverseInertia: number;

    position: Vector2;
    
    velocity: Vector2;
    angularVelocity: number;
    
    private _basisDirty: boolean = false;
    private _basisInverseDirty: boolean = false;
    private _basis: Matrix2;
    private _basisInverse: Matrix2;

    private _rotation: number;

    constructor(){
        this.position = new Vector2();
        this._rotation = 0;

        this.velocity = new Vector2();
        this.angularVelocity = 0;

        this.inverseMass = 1;
        this.inverseInertia = 1;

        this._basis = Matrix2.identity();
        this._basisInverse = Matrix2.identity();
    }

    get mass(){
        return 1 / this.inverseMass;
    }
    set mass(v: number){
        this.inverseMass = 1 / v;
    }
    get inertia() {
        return 1 / this.inverseInertia;
    }
    set inertia(v: number) {
        this.inverseInertia = 1 / v;
    }
    get basis(): Matrix2{
        if(this._basisDirty){
            this.syncBasis();
        }
        return this._basis;
    }
    get basisInverse(): Matrix2{
        if(this._basisInverseDirty){
            this.syncBasisInverse();
        }
        return this._basisInverse;
    }
    get rotation(){
        return this._rotation;
    }
    set rotation(rotation: number){
        this._rotation = rotation;

        this.markBasisDirty();
    }

    rotate(angle: number){
        this.rotation += angle;
    }
    translate(x: number, y: number){
        this.position.addX(x).addY(y);
    }

    addImmediateCentralForce(fx: number, fy: number, delta: number){
        // F = m * a
        // a = F / m

        let ax = fx * this.inverseMass;
        let ay = fy * this.inverseMass;

        this.velocity.x += ax * delta;
        this.velocity.y += ay * delta;

        this.position.x += ax * delta * delta;
        this.position.y += ay * delta * delta;
    }
    addImmediateCentralImpulse(ix: number, iy: number, delta: number){
        let dx = ix * this.inverseMass;
        let dy = iy * this.inverseMass;
        this.position.x += dx;
        this.position.y += dy;

        this.velocity.x += dx / delta;
        this.velocity.y += dy / delta;
    }

    private markBasisDirty(){
        this._basisDirty = true;
        this._basisInverseDirty = true;
    }

    private syncBasis(){
        this._basis.setAsRotation(this.rotation);
        this._basisDirty = false;
    }

    private syncBasisInverse(){
        this._basisInverse.setAs(this.basis).inverse();
        this._basisInverseDirty = false;
    }
}