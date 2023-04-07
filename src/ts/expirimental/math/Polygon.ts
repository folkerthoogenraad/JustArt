import { Vector2 } from "./Vector2";

export class Polygon {
    vertices: Vector2[];

    constructor(){
        this.vertices = [];
    }

    getPoint(i: number){
        let index = i % this.vertices.length;

        if (index < 0){
            index += this.vertices.length;
        }

        return this.vertices[index];
    }
    getEdgeDirection(i: number){
        return this.getPoint(i).directionTo(this.getPoint(i + 1));
    }
    getEdgeNormal(i: number){
        return this.getEdgeDirection(i).perpendicularize();
    }
    getPointNormal(i: number){
        return this.getEdgeNormal(i).add(this.getEdgeNormal(i - 1));
    }
    getEdgeCenter(i: number){
        return this.getPoint(i).clone().add(this.getPoint(i + 1)).scale(0.5);
    }

    expanded(n: number): Polygon{
        let polygon = new Polygon();
        polygon.vertices = [...this.vertices];

        for(let i = 0; i < polygon.vertices.length; i++){
            polygon.vertices[i] = polygon.vertices[i].clone().add(this.getPointNormal(i).scale(n));
        }
        return polygon;
    }
}