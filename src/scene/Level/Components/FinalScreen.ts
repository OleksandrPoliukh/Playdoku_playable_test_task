import gsap from "gsap";
import { app } from "../../GameScene";
import { Sprite, Texture } from "pixi.js";
import EventHelper from "../../../helpers/EventHelper";
import { network } from "../../../main";
import { sfx } from "../../../helpers/audio";

export default class FinalScreen {
    private _decorFigure1: Sprite;
    private _decorFigure2: Sprite;
    private _decorFigure3: Sprite;
    private _decorFigure4: Sprite;
    private _button: Sprite;
    private _logo: Sprite;
    private _scaleRatio: number;

    constructor() {
        this.setupEvents();
    }

    private setupEvents() {
        EventHelper.instance.signals.onFinish.connect(() => {
            this.showAllStaff(this._scaleRatio);
            sfx.play("final-screen.mp3");
        });
    }

    private showAllStaff(scaleRatio: number) {
        const duration = 0.5;
        const ease = "back.out(1.5)";
        const delayBetween = 0.1;

        const targetPos1 = this._decorFigure1.position.clone();
        const targetPos2 = this._decorFigure2.position.clone();
        const targetPos3 = this._decorFigure3.position.clone();
        const targetPos4 = this._decorFigure4.position.clone();

        const figures = [
            { sprite: this._decorFigure1, target: targetPos1 },
            { sprite: this._decorFigure2, target: targetPos2 },
            { sprite: this._decorFigure3, target: targetPos3 },
            { sprite: this._decorFigure4, target: targetPos4 },
        ];

        figures.forEach((fig, i) => {
            const startPos = this.getStartPositionForFigure(i);
            fig.sprite.position.set(startPos.x, startPos.y);
            fig.sprite.alpha = 1;
            fig.sprite.scale.set(0);

            gsap.to(fig.sprite, {
                duration,
                delay: i * delayBetween,
                x: fig.target.x,
                y: fig.target.y,
                ease,
            });

            gsap.to(fig.sprite.scale, {
                duration,
                delay: i * delayBetween,
                x: scaleRatio,
                y: scaleRatio,
                ease,
            });
        });

        const totalDelay = (figures.length - 1) * delayBetween + duration;

        this._button.alpha = 1;
        this._button.scale.set(0);
        gsap.to(this._button.scale, {
            duration: totalDelay,
            delay: 0,
            x: scaleRatio * 0.8,
            y: scaleRatio * 0.8,
            ease: "back.out(1.7)",
            onComplete: () => {
                this.makeButtonInteractive();
            },
        });

        this._logo.alpha = 1;
        this._logo.scale.set(0);
        gsap.to(this._logo.scale, {
            duration: totalDelay,
            delay: 0,
            x: scaleRatio * 0.8,
            y: scaleRatio * 0.8,
            ease: "back.out(1.7)",
        });
    }

    private getStartPositionForFigure(index: number): { x: number; y: number } {
        switch (index) {
            case 0:
                return { x: -100, y: -100 };
            case 1:
                return { x: app.screen.width + 100, y: -100 };
            case 2:
                return {
                    x: app.screen.width + 100,
                    y: app.screen.height + 100,
                };
            case 3:
                return { x: -100, y: app.screen.height + 100 };
            default:
                return { x: 0, y: 0 };
        }
    }

    public init() {
        this.initDecorFigures();
        this.initLogo();
        this.initButton();
    }

    private initDecorFigures() {
        this._decorFigure1 = new Sprite(Texture.from("final/newFig1.png"));
        this._decorFigure1.anchor.set(0.5);
        this._decorFigure1.alpha = 0;
        app.stage.addChild(this._decorFigure1);

        this._decorFigure2 = new Sprite(Texture.from("final/newFig2.png"));
        this._decorFigure2.anchor.set(0.5);
        this._decorFigure2.alpha = 0;
        app.stage.addChild(this._decorFigure2);

        this._decorFigure3 = new Sprite(Texture.from("final/newFig3.png"));
        this._decorFigure3.anchor.set(0.5);
        this._decorFigure3.alpha = 0;
        app.stage.addChild(this._decorFigure3);

        this._decorFigure4 = new Sprite(Texture.from("final/newFig4.png"));
        this._decorFigure4.anchor.set(0.5);
        this._decorFigure4.alpha = 0;
        app.stage.addChild(this._decorFigure4);
    }

    private initButton() {
        this._button = new Sprite(Texture.from("final/button.png"));
        this._button.anchor.set(0.5);
        this._button.alpha = 0;
        app.stage.addChild(this._button);
    }

    private makeButtonInteractive() {
        this._button.interactive = true;
        this._button.on("pointerdown", () => {
            network.signals.onClickRedirect.emit();
        });
        app.stage.setChildIndex(this._button, app.stage.children.length - 1);
    }

    private initLogo() {
        this._logo = new Sprite(Texture.from("final/logo.png"));
        this._logo.anchor.set(0.5);
        this._logo.alpha = 0;
        app.stage.addChild(this._logo);
    }

    public resize(scaleRatio: number, screenW: number, screenH: number) {
        this._scaleRatio = scaleRatio;

        this._button.position.set(screenW * 0.5, screenH * 0.5);
        const logoOffset = 50 * scaleRatio;
        this._logo.position.set(screenW * 0.5, this._button.y - logoOffset);

        const figureWidth = this._decorFigure1.texture.width * scaleRatio;
        const figureHeight = this._decorFigure1.texture.height * scaleRatio;

        this._decorFigure1.position.set(figureWidth / 2, figureHeight / 2);

        this._decorFigure2.position.set(
            screenW - figureWidth / 2,
            figureHeight / 2
        );

        this._decorFigure3.position.set(
            screenW - figureWidth / 2,
            screenH - figureHeight / 2
        );

        this._decorFigure4.position.set(
            figureWidth / 2,
            screenH - figureHeight / 2
        );

        this._decorFigure1.scale.set(scaleRatio);
        this._decorFigure2.scale.set(scaleRatio);
        this._decorFigure3.scale.set(scaleRatio);
        this._decorFigure4.scale.set(scaleRatio);
        this._button.scale.set(scaleRatio * 0.8);
        this._logo.scale.set(scaleRatio * 0.8);
    }

    public get button(): Sprite {
        return this._button;
    }
}
