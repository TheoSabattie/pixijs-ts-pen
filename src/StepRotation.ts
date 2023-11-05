import { Pen } from "./Pen";
import { Step } from "./Step";

export class StepRotation extends Step {
    private rotation: number;

    public constructor(pen: Pen, rotation: number = 0) {
        super(pen);
        this.rotation = rotation;
    }

    public override process(): void {
        this.pen.rotation = this.rotation;
    }
}
