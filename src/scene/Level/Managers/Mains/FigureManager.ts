import { app } from "../../../GameScene";
import { Point, Sprite, Texture, Text } from "pixi.js";
import UIManager from "./UIManager";
import gsap from "gsap";
import EventHelper from "../../../../helpers/EventHelper";
import { sfx } from "../../../../helpers/audio";
import DragManager from "../Additional/DragManager";
import AlphaCollisionHelper from "../../../../helpers/AlphaCollisionHelper";
import FigurePositionHelper from "../../../../helpers/FigurePositionHelper";
import FigureSnapManager from "../Additional/FigureSnapManager";
import FigureStateManager from "../Additional/FigureStateManager";

export default class FigureManager {
    private dragManager: DragManager;
    private snapManager: FigureSnapManager;

    private _figures: Sprite[] = [];
    private _draggedFigure: Sprite | null = null;
    private _aspectRatio: number;
    private _screenW: number;
    private _screenH: number;
    private startFigCoord: Point | null;
    private shapeCenter: Point | null;
    private _insideLocalPositions: Map<number, Point> = new Map();

    constructor(
        private shape: Sprite,
        private uiManager: UIManager,
        private scaleRatio: number
    ) {
        this.initDragManager();
        this.initSnapManager();
        AlphaCollisionHelper.setAlphaHitArea(this.shape);
        AlphaCollisionHelper.logOpaqueBounds(this.shape);
        this.setupEvents();
    }

    private initDragManager() {
        this.dragManager = new DragManager(
            this.tryAgain.bind(this),
            this.intersectsOthers.bind(this),
            this.shouldReturn.bind(this),
            this.uiManager.updateIQ.bind(this.uiManager),
            (figure) => {
                app.stage.setChildIndex(figure, app.stage.children.length - 1);
                app.stage.setChildIndex(
                    this.uiManager.hand,
                    app.stage.children.length - 1
                );
            }
        );
    }

    private initSnapManager() {
        this.snapManager = new FigureSnapManager();
    }

    private setupEvents() {
        EventHelper.instance.signals.onFinish.connect(() => {
            this.hideAllStaff();
        });
    }

    private hideAllStaff() {
        this._figures.forEach((fig) => {
            gsap.to(fig, {
                alpha: 0,
                duration: 0.5,
            });
        });
    }

    public initFigures(count: number) {
        for (let i = 0; i < count; i++) {
            const texture = Texture.from(`cupcake/figure_${i + 1}.png`);
            const figure = new Sprite(texture);

            figure.anchor.set(0.5);
            figure.x = app.screen.width * 0.5;
            figure.y = app.screen.height * 0.5;
            figure.interactive = true;
            figure.cursor = "none";

            this.dragManager.register(figure);

            AlphaCollisionHelper.setAlphaHitArea(figure);
            AlphaCollisionHelper.logOpaqueBounds(figure);

            FigureStateManager.resetFigure(figure, this.scaleRatio);

            this._figures.push(figure);
            app.stage.addChild(figure);

            const text = new Text("10PTS", {
                fontFamily: "Montserrat Semibold",
                fontSize: 20,
                fill: 0xffffff,
                align: "center",
            });
            text.anchor.set(0.5);

            FigurePositionHelper.positionText(figure, text, 30);

            text.scale.set(this.scaleRatio || 1);
            app.stage.addChild(text);
            (figure as any).pointsText = text;
        }
    }

    private tryAgain(): void {
        EventHelper.instance.signals.onTryAgain.emit();
        sfx.play("wrong.mp3");
        this.uiManager.updateIQ(0, 60);
        this.uiManager.showMessage("TRY AGAIN", "red");
        this._figures.forEach((fig) => {
            this.shouldReturn(fig);

            if (fig.parent !== app.stage) {
                const globalPos = fig.getGlobalPosition();
                app.stage.addChild(fig);
                fig.position.set(globalPos.x, globalPos.y);
            }

            FigureStateManager.resetFigure(fig, this.scaleRatio);
        });

        this._draggedFigure = null;
    }

    public onPointerMove(globalPos: Point) {
        this.dragManager.onPointerMove(globalPos);
    }

    private shouldReturn(figure: Sprite): void {
        const targetX =
            this._aspectRatio > 1.2
                ? this._screenW * 0.65
                : this._screenW * 0.5;
        const targetY =
            this._aspectRatio > 1.2
                ? this._screenH * 0.45
                : this._screenH * 0.6;

        gsap.to(figure, {
            x: targetX,
            y: targetY,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                if ((figure as any).pointsText) {
                    const text = (figure as any).pointsText;
                    gsap.to(text, {
                        alpha: 1,
                        duration: 0.3,
                        ease: "power2.in",
                    });

                    FigurePositionHelper.positionText(figure, text, 10);
                }
            },
        });
    }

    private intersectsOthers(current: Sprite): boolean {
        let result = false;

        const intersectsOtherFigures = this._figures.some(
            (other) =>
                other !== current &&
                AlphaCollisionHelper.alphaHitTestIntersection(current, other)
        );

        const intersectsShape = AlphaCollisionHelper.alphaHitTestIntersection(
            current,
            this.shape
        );

        const wasInsideShape = FigureStateManager.isInsideShape(current);

        const insideShape = AlphaCollisionHelper.alphaHitTestIntersection(
            current,
            this.shape,
            "inside"
        );

        const snapped = this.snapFigure(current);

        if ((insideShape && !intersectsOtherFigures) || snapped) {
            if (!wasInsideShape) {
                this.uiManager.updateIQ(10);
            }
            if (!snapped) {
                this.checkOtherFiguresPossibilityToSnap(current);
            } else if (snapped) {
                this.checkAllFiguresState();
            }

            FigureStateManager.setInsideShape(current, true);

            const index = this._figures.indexOf(current);
            if (!snapped && index !== -1) {
                this._insideLocalPositions.set(
                    index,
                    this.shape.toLocal(new Point(current.x, current.y))
                );
            }
        } else {
            if (wasInsideShape) {
                this.uiManager.updateIQ(-10);
                this.checkAllFiguresState();
                const index = this._figures.indexOf(current);
                this._insideLocalPositions.delete(index);
            }
            FigureStateManager.setInsideShape(current, false);
        }

        if (
            (intersectsOtherFigures || (intersectsShape && !insideShape)) &&
            !snapped
        ) {
            result = true;
        }

        return result;
    }

    private checkAllFiguresState(): void {
        const hasWrongFigures = this._figures.some(
            (figure) => (figure as any).myData.isWrong
        );

        if (!hasWrongFigures) {
            FigureStateManager.clearAllBlocked(this._figures);
        }
    }

    private checkOtherFiguresPossibilityToSnap(
        wrongInput: Sprite | Sprite[]
    ): void {
        const blockedFigures: string[] = [];

        if (!Array.isArray(wrongInput)) {
            FigureStateManager.markAsWrong(wrongInput);
        }

        const allWrongFigures = this._figures.filter(
            (f) => (f as any).myData.isWrong
        );
        this._figures.forEach((figure, index) => {
            if (figure.interactive && !allWrongFigures.includes(figure)) {
                const originalX = figure.x;
                const originalY = figure.y;

                const globalTarget = this.snapManager.getGlobalTarget(
                    index,
                    this.shape
                );
                if (!globalTarget) return;
                figure.x = globalTarget.x;
                figure.y = globalTarget.y;

                const isIntersecting = allWrongFigures.some((wrong) =>
                    AlphaCollisionHelper.alphaHitTestIntersection(figure, wrong)
                );

                if (isIntersecting) {
                    FigureStateManager.markAsBlocked(figure);
                    blockedFigures.push(`Figure ${index + 1}`);
                }

                figure.x = originalX;
                figure.y = originalY;
            }
        });
    }

    private snapFigure(figure: Sprite): boolean {
        const index = this._figures.indexOf(figure);
        if (index === -1) return false;
        if ((figure as any).myData.isBlocked) return false;

        return this.snapManager.trySnapToTarget(figure, this.shape, index);
    }

    public getFigure(index: number): Point | null {
        const figure = this._figures[index];

        if (!figure) return null;

        return FigurePositionHelper.getGlobalCenter(figure);
    }

    public getShapeCenter(): Point | null {
        if (!this.shape) return null;

        const minX = (this.shape as any).outlineLocalMinX;
        const maxX = (this.shape as any).outlineLocalMaxX;
        const minY = (this.shape as any).outlineLocalMinY;
        const maxY = (this.shape as any).outlineLocalMaxY;

        const localCenterX = (minX + maxX) / 2;
        const localCenterY = (minY + maxY) / 2;

        return this.shape.toGlobal(new Point(localCenterX, localCenterY));
    }

    public resize(
        scaleRatio: number,
        screenW: number,
        screenH: number,
        aspectRatio: number
    ) {
        this.scaleRatio = scaleRatio;
        this._aspectRatio = aspectRatio;
        this._screenW = screenW;
        this._screenH = screenH;

        if (aspectRatio > 1.2) {
            if (aspectRatio < 1.55) {
                this.scaleRatio *= aspectRatio / 1.6;
            }
        }

        this._figures.forEach((fig, index) => {
            fig.scale.set(this.scaleRatio);

            if (!fig.interactive) {
                const globalTarget = this.snapManager.getGlobalTarget(
                    index,
                    this.shape
                );
                if (globalTarget) {
                    fig.x = globalTarget.x;
                    fig.y = globalTarget.y;
                }
            } else if (fig.interactive && (fig as any).myData.insideShape) {
                const localPos = this._insideLocalPositions.get(index);
                if (localPos) {
                    const newGlobalPos = this.shape.toGlobal(localPos);
                    fig.x = newGlobalPos.x;
                    fig.y = newGlobalPos.y;
                }

                if ((fig as any).pointsText) {
                    const text = (fig as any).pointsText;
                    FigurePositionHelper.positionText(fig, text, 10);

                    text.scale.set(this.scaleRatio);
                }
            } else {
                if (aspectRatio > 1.2) {
                    fig.x = screenW * 0.65;
                    fig.y = screenH * 0.45;
                } else {
                    fig.x = screenW * 0.5;
                    fig.y = screenH * 0.6;
                }

                if ((fig as any).pointsText) {
                    const text = (fig as any).pointsText;
                    FigurePositionHelper.positionText(fig, text, 10);

                    text.scale.set(this.scaleRatio);
                    text.alpha = 1;
                }
            }
        });

        this.sendHandCoord();
    }

    private sendHandCoord() {
        gsap.delayedCall(1, () => {
            this.startFigCoord = this.getFigure(4);
            this.shapeCenter = this.getShapeCenter();

            if (this.startFigCoord && this.shapeCenter) {
                EventHelper.instance.signals.onGetCoordStartAnim.emit(
                    this.startFigCoord,
                    this.shapeCenter
                );
            } else {
                this.sendHandCoord();
            }
        });
    }
}
