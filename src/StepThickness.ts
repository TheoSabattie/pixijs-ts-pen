import { Pen } from "./Pen";
import { Step } from "./Step";

export class StepThickness extends Step {
    private thickness: number;
    private setThicknessFunc: (thickness: number) => void;

    public constructor(
        pen: Pen,
        thickness: number = 0,
        setThicknessFunc: (thickness: number) => void
    ) {
        super(pen);
        this.thickness = thickness;
        this.setThicknessFunc = setThicknessFunc;
    }

    public override process(): void {
        this.setThicknessFunc(this.thickness);
    }
}
