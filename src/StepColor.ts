import { Pen } from "./Pen";
import { Step } from "./Step";

export class StepColor extends Step {
    private color: number;
    private setColorFunc: (color: number) => void;

    public constructor(
        pen: Pen,
        color: number = 0,
        setColorFunc: (color: number) => void
    ) {
        super(pen);
        this.color = color;
        this.setColorFunc = setColorFunc;
    }

    public override process(): void {
        this.setColorFunc(this.color);
    }
}
