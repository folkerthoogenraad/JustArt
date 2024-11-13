// This class should probably be immutable but isn't for performance reasons...
export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vector3) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;

        return this;
    }
    addX(x: number) {this.x += x; return this; }
    addY(y: number) {this.y += y; return this; }
    addZ(z: number) {this.z += z; return this; }
    addScaled(other: Vector3, scaler: number) {
        this.x += other.x * scaler;
        this.y += other.y * scaler;
        this.z += other.z * scaler;

        return this;
    }

    sub(other: Vector3) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;

        return this;
    }
    subX(x: number) {this.x -= x; return this; }
    subY(y: number) {this.y -= y; return this; }
    subZ(z: number) {this.z -= z; return this; }
    
    mul(other: Vector3) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;

        return this;
    }
    mulX(x: number) {this.x *= x; return this; }
    mulY(y: number) {this.y *= y; return this; }
    mulZ(z: number) {this.z *= z; return this; }

    div(other: Vector3) {
        this.x /= other.x;
        this.y /= other.y;
        this.z /= other.z;

        return this;
    }
    divX(x: number) {this.x /= x; return this; }
    divY(y: number) {this.y /= y; return this; }
    divZ(z: number) {this.z /= z; return this; }

    scale(scaler: number) {
        this.x *= scaler;
        this.y *= scaler;
        this.z *= scaler;

        return this;
    }
    set(other: Vector3) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;

        return this;
    }
    setZero() {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        return this;
    }
    apply(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;

        return this;
    }
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;

        return this;
    }

    normalize() {
        let length = this.length;

        if (length > 0) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }

        return this;
    }

    get normalized() {
        return this.clone().normalize();
    }

    get sqrLength() {
        return Vector3.dot(this, this);
    }

    get length() {
        return Math.sqrt(this.sqrLength);
    }

    distanceTo(other: Vector3) {
        return Vector3.distance(this, other);
    }
    directionTo(other: Vector3) {
        return Vector3.direction(this, other);
    }

    static direction(a: Vector3, b: Vector3) {
        return this.directionOut(a, b, new Vector3());
    }
    static directionOut(a: Vector3, b: Vector3, out: Vector3) {
        let dx = Vector3.dx(a, b);
        let dy = Vector3.dy(a, b);
        let dz = Vector3.dz(a, b);

        out.x = dx;
        out.y = dy;
        out.z = dz;

        return out;
    }
    static distance(a: Vector3, b: Vector3) {
        return Vector3.fDistance(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    lerpTo(other: Vector3, f: number) {
        return Vector3.lerpOut(this, other, this, f);
    }

    static lerp(a: Vector3, b: Vector3, f: number) {
        return this.lerpOut(a, b, new Vector3(), f);
    }

    static lerpOut(a: Vector3, b: Vector3, out: Vector3, f: number) {
        out.x = a.x + (b.x - a.x) * f;
        out.y = a.y + (b.y - a.y) * f;
        out.z = a.z + (b.z - a.z) * f;

        return out;
    }

    static dot(a: Vector3, b: Vector3) {
        return this.fDot(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    static cross(a: Vector3, b: Vector3) {            
        return this.crossOut(a, b, new Vector3());
    }
    static crossOut(a: Vector3, b: Vector3, out: Vector3) {            
        return out.apply(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x);
    }
    

    // ============================================================== //
    // Helper functions to work without the Vector3 class
    // ============================================================== //
    static dx(a: Vector3, b: Vector3) {
        return b.x - a.x;
    }
    static dy(a: Vector3, b: Vector3) {
        return b.y - a.y;
    }
    static dz(a: Vector3, b: Vector3) {
        return b.z - a.z;
    }
    static fDot(ax: number, ay: number, az: number, bx: number, by: number, bz: number){
        return ax * bx + ay * by + az * bz;
    }
    static fDistance(ax: number, ay: number, az: number, bx: number, by: number, bz: number){
        let dx = ax - bx;
        let dy = ay - by;
        let dz = az - bz;

        return this.fLength(dx, dy, dz);
    }
    static fSquareLength(x: number, y: number, z: number){
        return this.fDot(x, y, z, x, y, z);
    }
    static fAngle(x: number, y: number){
        return Math.atan2(y, x);
    }
    static fLength(x: number, y: number, z: number){
        return Math.sqrt(this.fSquareLength(x, y, z));
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    toString(){
        return `(${this.x},${this.y},${this.z})`;
    }
    toShortString(){
        return `(${Math.round(this.x * 100) / 100},${Math.round(this.y * 100) / 100},${Math.round(this.z * 100) / 100})`;
    }

    static readonly zero: Vector3 = new Vector3(0, 0, 0);
    static readonly one: Vector3 = new Vector3(1, 1, 1);
    static readonly unitX: Vector3 = new Vector3(1, 0, 0);
    static readonly unitY: Vector3 = new Vector3(0, 1, 0);
    static readonly unitZ: Vector3 = new Vector3(0, 0, 1);
}