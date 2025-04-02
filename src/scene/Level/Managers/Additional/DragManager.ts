import { Point, Sprite } from "pixi.js";
import gsap from "gsap";
import { app } from "../../../GameScene";
import { sfx } from "../../../../helpers/audio";

export default class DragManager {
    private _draggedFigure: Sprite | null = null;
    private _dragOffsetX = 0;
    private _dragOffsetY = 0;

    constructor(
        private onTryAgain: () => void,
        private intersectsOthers: (figure: Sprite) => boolean,
        private shouldReturn: (figure: Sprite) => void,
        private updateIQ: (delta: number) => void,
        private bringToFront?: (figure: Sprite) => void,
        private onSnap?: (figure: Sprite) => void
    ) {}

    public register(figure: Sprite) {
        figure
            .on("pointerdown", this.onDragStart)
            .on("pointerup", this.onDragEnd)
            .on("pointerupoutside", this.onDragEnd);
    }

    public onDragStart = (event) => {
        const figure = event.currentTarget as Sprite;

        (figure as any).myData.isWrong = false;

        if (figure.parent !== app.stage) {
            const globalPos = figure.getGlobalPosition();
            app.stage.addChild(figure);
            figure.position.set(globalPos.x, globalPos.y);
        }

        this._draggedFigure = figure;

        const pos = event.data.getLocalPosition(app.stage);
        this._dragOffsetX = pos.x - figure.x;
        this._dragOffsetY = pos.y - figure.y;

        app.stage.setChildIndex(figure, app.stage.children.length - 1);

        figure.scale.set(1.02 * figure.scale.x);

        if ((figure as any).pointsText) {
            const text = (figure as any).pointsText;
            gsap.to(text, {
                alpha: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        }

        if ((figure as any).myData.isBlocked) {
            (figure as any).dragTimeout = setTimeout(() => {
                if (this._draggedFigure === figure) {
                    this.onTryAgain();
                    this._draggedFigure = null
                }
            }, 1000);
        }

        if (this.bringToFront) this.bringToFront(figure);
    };

    public onDragEnd = () => {
        if (!this._draggedFigure) return;

        const figure = this._draggedFigure;

        if ((figure as any).dragTimeout) {
            clearTimeout((figure as any).dragTimeout);
            delete (figure as any).dragTimeout;
        }

        const intersects = this.intersectsOthers(figure);

        if (intersects) {
            this.shouldReturn(figure);
        }

        sfx.play("place-figure.mp3");

        figure.scale.set(figure.scale.x / 1.02);
        this._draggedFigure = null;

        if (this.onSnap) this.onSnap(figure);
    };

    public onPointerMove(globalPos: Point) {
        if (!this._draggedFigure) return;
        const local = this._draggedFigure.parent.toLocal(globalPos);
        this._draggedFigure.x = local.x - this._dragOffsetX;
        this._draggedFigure.y = local.y - this._dragOffsetY;
    }

    public clear() {
        this._draggedFigure = null;
    }
}
