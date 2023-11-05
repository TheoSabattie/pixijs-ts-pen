import { Pen } from "./Pen";

export class Step {
    protected pen: Pen;

    public get movingPosition(): Boolean {
        return false;
    }

    public constructor(pPen: Pen) {
        this.pen = pPen;
    }

    public process(): void {}
}
