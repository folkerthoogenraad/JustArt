import { MathHelper } from "expirimental/math/MathHelper";
import { Vector2 } from "expirimental/math/Vector2";

export interface PressurePoint {
    position: Vector2;
    pressure: number;
}

// In the end we want an immutable version of this to do the interpolation
// Or an additional interpolation object that caches stuff
export class PressurePath {
    points: PressurePoint[];

    constructor(){
        this.points = [];
    }

    addPoint(position: Vector2, pressure: number){
        this.points.push({position, pressure});
    }

    getTotalLength(){
        let l = 0;

        for(let i = 0; i < this.getSegmentCount(); i++){
            l += this.getSegmentLength(i);
        }

        return l;
    }

    getSegmentCount() {
        return this.points.length - 1;
    }

    getSegmentIndex(length: number){
        for(let i = 0; i < this.getSegmentCount(); i++){
            let p0 = this.getSegmentStart(i).position;
            let p1 = this.getSegmentEnd(i).position;

            length -= Vector2.distance(p0, p1);

            if(length < 0) return i;
        }

        return this.points.length - 1;
    }
    getSegmentStart(i: number): PressurePoint{
        return this.points[i];
    }
    getSegmentEnd(i: number): PressurePoint{
        return this.points[i + 1];
    }
    getSegmentLength(i: number){
        let p0 = this.getSegmentStart(i).position;
        let p1 = this.getSegmentEnd(i).position;

        return Vector2.distance(p0, p1);
    }

    interpolate(n: number, output?: PressurePoint): PressurePoint {
        return this.interpolateByDistance(this.getTotalLength() * n, output);
    }
    interpolateByDistance(distance: number, output?: PressurePoint): PressurePoint {
        let n = 0;
        let segmentIndex = 0;

        for(let i = 0; i < this.getSegmentCount(); i++){
            let p0 = this.getSegmentStart(segmentIndex).position;
            let p1 = this.getSegmentEnd(segmentIndex).position;

            segmentIndex = i;

            let d = Vector2.distance(p0, p1);
            
            if (distance < d){
                n = distance / d;
                break;
            }
            else{
                distance -= d;
            }
        }

        return this.interpolateSegment(segmentIndex, n, output);
    }
    interpolateSegmentByDistance(segmentIndex: number, distance: number, output?: PressurePoint): PressurePoint{
        let length = this.getSegmentLength(segmentIndex);

        return this.interpolateSegment(segmentIndex, distance / length, output);
    }
    interpolateSegment(segmentIndex: number, n: number, output?: PressurePoint): PressurePoint{
        let start = this.getSegmentStart(segmentIndex);
        let end = this.getSegmentEnd(segmentIndex);

        if(output === undefined) {
            output = { position: new Vector2(), pressure: 0};
        }

        output.position = Vector2.lerpOut(start.position, end.position, output.position, n);
        output.pressure = MathHelper.lerp(start.pressure, end.pressure, n);
        
        return output;
    }
}