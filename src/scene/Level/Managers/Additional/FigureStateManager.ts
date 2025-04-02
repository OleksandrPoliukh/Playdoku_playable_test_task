import { Sprite } from "pixi.js";

export default class FigureStateManager {
    static resetFigure(fig: Sprite, defaultScale = 1) {
        fig.interactive = true;
        fig.cursor = "none";
        fig.scale.set(defaultScale);

        (fig as any).myData = {
            insideShape: false,
            isWrong: false,
            isBlocked: false,
        };
    }

    static markAsWrong(fig: Sprite) {
        (fig as any).myData.isWrong = true;
    }

    static markAsBlocked(fig: Sprite) {
        (fig as any).myData.isBlocked = true;
    }

    static clearBlocked(fig: Sprite) {
        (fig as any).myData.isBlocked = false;
    }

    static isInsideShape(fig: Sprite): boolean {
        return (fig as any).myData?.insideShape === true;
    }

    static setInsideShape(fig: Sprite, inside: boolean) {
        (fig as any).myData.insideShape = inside;
    }

    static clearAllBlocked(figures: Sprite[]) {
        figures.forEach((f) => this.clearBlocked(f));
    }
}
