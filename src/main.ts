import { Application } from "pixi.js";
import "./style.css";
import { GraphicGrid, UpdateService } from "math-understanding-tools";
import { Pen } from "./Pen";

const app = new Application({
    antialias: true,
    backgroundColor: 0xffffff,
});

const pen = new Pen();
const grid = new GraphicGrid(app.stage, 50);

function initialize(): void {
    UpdateService.add(gameLoop);
    app.stage.addChild(pen);
    // ICI, le code est executée une seule fois au tout début
}

function gameLoop(): void {
    // ICI, le code est executée toutes les frames
}

document.addEventListener("DOMContentLoaded", onDOMLoaded);
window.addEventListener("resize", resize);
GraphicGrid.defaultLineStyle.setColor(0).setAlpha(0.1);

function resize(_?: Event): void {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    grid.scheduleDraw();
}

function onDOMLoaded(_: Event): void {
    document.body.appendChild(<Node>(<unknown>app.view));

    app.ticker.add((_) => {
        UpdateService.update(app.ticker.deltaMS / 1000);
    });

    resize();
    initialize();
}
