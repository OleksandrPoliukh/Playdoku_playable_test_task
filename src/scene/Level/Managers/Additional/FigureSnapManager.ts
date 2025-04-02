import { Point, Sprite } from "pixi.js";

export default class FigureSnapManager {
    private readonly _targetPositions: Point[];

    constructor(positions?: Point[]) {
        this._targetPositions = positions || [
            new Point(241, 10),
            new Point(-405, 40),
            new Point(426, -148),
            new Point(-272, -352),
            new Point(217, -353),
            new Point(-219, 315),
        ];
    }

    public getTarget(index: number): Point | null {
        return this._targetPositions[index] || null;
    }

    public trySnapToTarget(
        figure: Sprite,
        shape: Sprite,
        index: number,
        distanceThreshold = 30
    ): boolean {
        const targetLocal = this._targetPositions[index];
        if (!targetLocal) return false;

        const globalTarget = shape.toGlobal(targetLocal);

        const dx = figure.x - globalTarget.x;
        const dy = figure.y - globalTarget.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < distanceThreshold) {
            figure.position.set(globalTarget.x, globalTarget.y);
            figure.interactive = false;
            return true;
        }

        return false;
    }

    public getGlobalTarget(index: number, shape: Sprite): Point | null {
        const local = this.getTarget(index);
        return local ? shape.toGlobal(local) : null;
    }

    public getAllTargets(): Point[] {
        return this._targetPositions;
    }
}
