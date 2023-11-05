import { Point } from "pixi.js";
import { Step } from "./Step";
import { Pen } from "./Pen";

export class StepMove extends Step {
    private coordinates: Point;
    private draw: Boolean;

    public override get movingPosition(): Boolean {
        return true;
    }

    public constructor(pen: Pen, coordinates: Point, draw: Boolean = false) {
        super(pen);
        this.coordinates = new Point(coordinates.x, coordinates.y);
        this.draw = draw;
    }

    public override process(): void {
        this.pen.canvas.moveTo(this.pen.x, this.pen.y);

        this.pen.x = this.coordinates.x;
        this.pen.y = this.coordinates.y;

        if (this.draw)
            this.pen.canvas.lineTo(this.coordinates.x, this.coordinates.y);
    }
}
