import { Step } from "./Step";
import { StepColor } from "./StepColor";
import { StepMove } from "./StepMove";
import { StepRotation } from "./StepRotation";
import { StepThickness } from "./StepThickness";
import { Point, Container, ObservablePoint } from "pixi.js";
import { Graphics } from "@pixi/graphics";
import { IUpdatable, OVector2, UpdateService } from "math-understanding-tools";

const DEFAULT_FORWARD_DIST: number = 50;
const QUARTER_ROTATION: number = 90;
const DEFAULT_LINE_THICKNESS: number = 3;
const IS_NOT_ON_STAGE_ERR: String =
    "Vous devez poser le crayon sur la feuille avant de pouvoir dessiner (ajouter le crayon à l'affichage)";
const DEG2RAD: number = Math.PI / 180; // constant à multiplier à une valeur en degrés pour la convertir en radians

export class Pen extends Graphics implements IUpdatable {
    private steps: Step[] = [];
    private currentCoordinates: Point = new Point();
    private currentRotation: number = 0;
    private _canvas: Graphics = new Graphics(); // la toile sur laquelle dessiner, le parent de Pen
    private frameCounter: number = 0;
    private lastPosition: Point = new Point();
    private isDrawing: boolean = false;
    private currentThickness: number = DEFAULT_LINE_THICKNESS;
    private _lastStepThickness: number = DEFAULT_LINE_THICKNESS;
    private color: number = 0;
    private pencilLead: Container = new Container();
    private tintedPencilLeadPart: Graphics = new Graphics();

    public framePerStep: number = 30;

    public get thickness(): number {
        return this._lastStepThickness;
    }

    public get canvas(): Graphics {
        return this._canvas;
    }

    override get position(): ObservablePoint<any> {
        const point = new ObservablePoint(
            () => {
                super.position.set(point.x, point.y);
                this.currentCoordinates.set(point.x, point.y);
            },
            this,
            super.position.x,
            super.position.y
        );

        return point;
    }

    public constructor() {
        super();
        this.addListener("added", this.init);

        const length = 70;
        const width = 30;
        const halfWidth = width / 2;
        const untintedPart: Graphics = new Graphics();
        this.pencilLead.addChild(this.tintedPencilLeadPart);
        this.pencilLead.addChild(untintedPart);
        const slope = 10;

        this.tintedPencilLeadPart.beginFill(0xffffff);
        this.tintedPencilLeadPart.drawPolygon([
            new Point(0, 0),
            new Point(halfWidth + slope, -slope),
            new Point(length + halfWidth, -length),
            new Point(length, -length - halfWidth),
            new Point(0 + slope, -halfWidth - slope),
        ]);

        this.tintedPencilLeadPart.endFill();
        this.tintedPencilLeadPart.tint = 0;

        untintedPart.beginFill(0xffffff);
        untintedPart.drawPolygon([
            new OVector2(halfWidth + slope, -slope).normalize(10),
            new Point(halfWidth + slope, -slope),
            new Point(0 + slope, -halfWidth - slope),
            new OVector2(0 + slope, -halfWidth - slope).normalize(10),
        ]);

        untintedPart.endFill();
        untintedPart.scale.set(0.8, 0.8);
        untintedPart.position.set(3, -3);
        this.addChild(this.pencilLead);
    }

    private init = (_: Event): void => {
        this.lastPosition = new Point(this.x, this.y);

        this.removeListener("added", this.init);
        this.addListener("removed", this.waitingAddOnStage);

        this.currentThickness = this._lastStepThickness = 3;
        this.parent.addChildAt(this._canvas, this.parent.getChildIndex(this));
        this._canvas.moveTo(this.x, this.y);
        this.updateLineStyle();
        this.currentCoordinates = new Point(this.x, this.y);
        this.currentRotation = this.rotation;
        UpdateService.add(this);
    };

    private waitingAddOnStage = (_: Event): void => {
        this.removeListener("removed", this.waitingAddOnStage);
        UpdateService.remove(this);
        this.addListener("added", this.init);
    };

    private updateLineStyle(): void {
        if (this._canvas) {
            this._canvas.lineStyle(this.currentThickness, this.color);
            this.tintedPencilLeadPart.tint = this.color;
        }
    }

    private internalSetColor = (color: number): void => {
        this.color = color;
        this.updateLineStyle();
    };

    private internalSetThickness = (thickness: number): void => {
        this.currentThickness = thickness;
        this.updateLineStyle();
    };

    private throwIfNotOnStage(): void {
        if (this._canvas == null) throw IS_NOT_ON_STAGE_ERR;
    }

    public rotateLeft(degrees: number = QUARTER_ROTATION): void {
        this.rotate(-Math.max(0, degrees));
    }

    public rotateRight(degrees: number = QUARTER_ROTATION): void {
        this.rotate(Math.max(0, degrees));
    }

    public rotate(degrees: number): void {
        this.throwIfNotOnStage();
        this.updateCurrentRotation(degrees);
        this.addStep(new StepRotation(this, this.currentRotation));
    }

    /**
     * Move the pen forward (depend of its rotation) with drawing
     * @param	distance length of the move
     */
    public drawForward(distance: number = DEFAULT_FORWARD_DIST): void {
        this.forward(distance, true);
    }

    /**
     * Move the pen forward (depend of its rotation) without drawing
     * @param	distance length of the move
     */
    public jumpForward(distance: number = DEFAULT_FORWARD_DIST): void {
        this.forward(distance, false);
    }

    /**
     * Add thickness to the current tickness
     * @param	thickness épaisseur à ajouter à l'épaisseur actuelle
     */
    public addThickness(thickness: number = 1): void {
        this.addThicknessStep(this._lastStepThickness + Math.max(0, thickness));
    }

    /**
     * Remove thickness to the current thickness
     * @param thickness
     */
    public removeThickness(thickness: number = 1): void {
        this.addThicknessStep(this._lastStepThickness - Math.max(0, thickness));
    }

    private addThicknessStep(thickness: number): void {
        this._lastStepThickness = thickness;
        this.addStep(
            new StepThickness(this, thickness, this.internalSetThickness)
        );
    }

    public setColor(color: number): void {
        if (this.hasStep)
            this.addStep(new StepColor(this, color, this.internalSetColor));
        else this.internalSetColor(color);
    }

    public setRandomColor(): void {
        var color: number = Math.random() * 16777216;

        if (this.hasStep)
            this.addStep(new StepColor(this, color, this.internalSetColor));
        else this.internalSetColor(color);
    }

    private forward(distance: number, draw: Boolean): void {
        this.throwIfNotOnStage();
        var coordinates: Point = this.calculCoordinates(distance);
        this.updateCurrentCoordinates(coordinates);
        this.addStep(new StepMove(this, this.currentCoordinates, draw));
    }

    private updateCurrentCoordinates(coordinates: Point): void {
        this.currentCoordinates.x += coordinates.x;
        this.currentCoordinates.y += coordinates.y;
    }

    private updateCurrentRotation(rotation: number): void {
        this.currentRotation += rotation;
    }

    private calculCoordinates(distance: number): Point {
        var point: Point = new Point(0, 0);
        point.x = Math.cos(this.currentRotation * DEG2RAD) * distance;
        point.y = Math.sin(this.currentRotation * DEG2RAD) * distance;
        return point;
    }

    private get hasStep(): boolean {
        return Boolean(this.steps.length);
    }

    private addStep(step: Step): void {
        this.steps.push(step);
    }

    public startDraw(): void {
        if (this.isDrawing) return;

        this.isDrawing = true;
        this.lastPosition = new Point(this.x, this.y);
    }

    public stopDraw(): void {
        this.isDrawing = false;
    }

    private processAllSteps(): void {
        if (this.steps.length > 0) {
            var positionMoved: boolean = false;
            var step: Step;

            while (this.steps.length > 0) {
                step = <Step>this.steps.shift();
                step.process();

                if (step.movingPosition) positionMoved = true;
            }

            if (positionMoved) this.lastPosition = new Point(this.x, this.y);
        }
    }

    public update(): void {
        var currentPosition: Point;

        if (this.isDrawing) {
            this.processAllSteps();

            currentPosition = new Point(this.x, this.y);

            this._canvas.moveTo(this.lastPosition.x, this.lastPosition.y);
            this._canvas.lineTo(currentPosition.x, currentPosition.y);

            this.lastPosition = currentPosition;
            this.currentCoordinates.set(this.x, this.y);
        } else if (this.steps.length > 0) {
            if (this.frameCounter > this.framePerStep) {
                (<Step>this.steps.shift()).process();
                this.frameCounter = 0;
            } else {
                this.frameCounter++;
            }

            this.lastPosition = new Point(this.x, this.y);
        } else this.currentCoordinates.set(this.x, this.y);
    }

    public destroy(): void {
        UpdateService.remove(this);
        this.removeListener("added", this.init);
        this.removeListener("removed", this.waitingAddOnStage);

        if (this.parent) this.parent.removeChild(this);
    }
}
