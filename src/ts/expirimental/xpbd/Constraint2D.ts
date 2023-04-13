export abstract class Constraint2D{
    abstract init(delta: number): void;
    abstract apply(delta: number): void;
}