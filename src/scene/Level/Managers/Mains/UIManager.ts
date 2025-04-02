import { Container, Sprite, Text, Texture, Point } from "pixi.js";
import { app } from "../../../GameScene";
import gsap from "gsap";
import EventHelper from "../../../../helpers/EventHelper";
import { sfx } from "../../../../helpers/audio";

export default class UIManager {
    private _headerContainer: Container;
    private _headerBar: Sprite;
    private _headerText: Text;
    private _midText: Text;
    private _hand: Sprite;
    private _scaleRatio: number = 1;
    private _currentCounter: number = 60;
    private _iqTweenActive = false;
    private _messageText: Text | null = null;
    private _handAnimation: gsap.core.Timeline | null = null;
    private _shapeCenter;
    private _figureCenter;
    private aspectRatio: number;
    private playerStartedPlay: boolean = false;

    constructor() {
        this.setupEvents();
    }

    private setupEvents() {
        EventHelper.instance.signals.onGetCoordStartAnim.connect(
            (figure, shape) => {
                this._figureCenter = figure;
                this._shapeCenter = shape;

                if (!this.playerStartedPlay) {
                    this.updateHandAnimationCoords();
                }
            }
        );

        EventHelper.instance.signals.onFinish.connect(() => {
            this.hideAllStaff();
        });
    }

    public initUI() {
        this.initHand();
        this.initHeader();
        this.initMidText();
    }

    private hideAllStaff() {
        gsap.to([this._midText, this._headerContainer, this._hand], {
            alpha: 0,
            duration: 0.5,
        });
    }

    public updateHandAnimationCoords() {
        if (this._handAnimation && this._handAnimation.isActive()) {
            this._handAnimation.kill();
            this.startHandAnimation();
        } else if (!this._handAnimation) {
            this.startHandAnimation();
        }
    }

    private initHeader() {
        this._headerContainer = new Container();
        app.stage.addChild(this._headerContainer);

        this._headerBar = new Sprite(Texture.from("plashka.png"));
        this._headerBar.anchor.set(0.5);
        this._headerContainer.addChild(this._headerBar);

        this._headerText = new Text("Fill up the cupcake\nfor IQ 120+", {
            fontFamily: "Montserrat Semibold",
            fontSize: 50,
            fill: 0xffffff,
            align: "center",
            letterSpacing: 3,
        });
        this._headerText.anchor.set(0.5);
        this._headerContainer.addChild(this._headerText);
    }

    private initMidText() {
        this._midText = new Text(`IQ = ${this._currentCounter}`, {
            fontFamily: "Montserrat Semibold",
            fontSize: 100,
            fill: 0xffffff,
            align: "center",
            letterSpacing: 2,
        });
        this._midText.anchor.set(0.5);
        app.stage.addChild(this._midText);
    }

    private initHand() {
        this._hand = new Sprite(Texture.from("hand.png"));
        this._hand.anchor.set(0.2, 0.1);
        this._hand.alpha = 0;
        app.stage.addChild(this._hand);
    }

    private startHandAnimation() {
        const figure5 = this._figureCenter;
        const shapeCenter = this._shapeCenter;

        if (!figure5 || !shapeCenter) return;

        this._hand.x = figure5.x;
        this._hand.y = figure5.y;

        const timeline = gsap.timeline({
            onComplete: () => {
                this._hand.x = figure5.x;
                this._hand.y = figure5.y;
                this.startHandAnimation();
            },
        });

        timeline.to(
            this._hand,
            {
                alpha: 1,
                duration: 0.3,
                ease: "power1.inOut",
            },
            0
        );

        timeline.to(
            this._hand,
            {
                x: shapeCenter.x,
                y: shapeCenter.y,
                duration: 1.5,
                ease: "power1.inOut",
            },
            0
        );

        timeline.to(this._hand, {
            alpha: 0,
            duration: 0.3,
            ease: "power1.inOut",
        });

        this._handAnimation = timeline;

        app.stage.once("pointermove", () => {
            if (this._handAnimation) {
                this._handAnimation.kill();
                this._handAnimation = null;
                this.playerStartedPlay = true;
                this._hand.alpha = 1;
            }
        });
    }

    public updateHandPosition(globalPos: Point) {
        if (!this._hand) return;
        this._hand.x = globalPos.x;
        this._hand.y = globalPos.y;
    }

    public updateIQ(amount: number, resetTo?: number): void {
        if (this._iqTweenActive) return;

        const start = this._currentCounter;
        const target = resetTo !== undefined ? resetTo : start + amount;
        const totalSteps = Math.abs(target - start);

        if (totalSteps === 0) return;

        const duration = 0.5;
        const step = target > start ? 1 : -1;
        const stepTime = (duration * 1000) / totalSteps;

        this._iqTweenActive = true;

        let current = start;

        const interval = setInterval(() => {
            current += step;
            this._currentCounter = current;
            this._midText.text = `IQ = ${current}`;
            if (this._currentCounter == 120) {
                sfx.play("well-done.mp3");
                this.showMessage("WELL DONE", "white");
                gsap.delayedCall(1, () => {
                    EventHelper.instance.signals.onFinish.emit();
                });
            }

            if (current === target) {
                clearInterval(interval);
                this._iqTweenActive = false;
            }
        }, stepTime);
    }

    public showMessage(message: string, color: string): void {
        if (this._messageText) {
            app.stage.removeChild(this._messageText);
            gsap.killTweensOf(this._messageText);
            this._messageText = null;
        }

        this._messageText = new Text(message, {
            fontFamily: "Montserrat Semibold",
            fontSize: 80,
            fill: color,
            align: "center",
            letterSpacing: 2,
            stroke: 0xffffff,
            strokeThickness: 5,
        });
        this._messageText.anchor.set(0.5);

        const messageOffset = this.aspectRatio > 0.63 ? 100 : 50;

        this._messageText.position.set(
            this._midText.x,
            this._midText.y + messageOffset
        );

        this._messageText.scale.set(this._scaleRatio);
        this._messageText.alpha = 0;
        app.stage.addChild(this._messageText);

        gsap.to(this._messageText, {
            alpha: 1,
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
                gsap.to(this._messageText, {
                    alpha: 0,
                    duration: 0.25,
                    delay: 1,
                    ease: "power2.out",
                    onComplete: () => {
                        if (this._messageText) {
                            app.stage.removeChild(this._messageText);
                            this._messageText = null;
                        }
                    },
                });
            },
        });
    }

    public resize(scaleRatio: number) {
        this._scaleRatio = scaleRatio;

        const screenW = app.screen.width;
        const screenH = app.screen.height;
        const aspectRatio = screenW / screenH;
        this.aspectRatio = aspectRatio;

        if (aspectRatio > 1.2) {
            if (aspectRatio < 1.55) {
                scaleRatio *= aspectRatio / 1.6;
                this._scaleRatio = scaleRatio;
            }

            this._headerContainer.scale.set(scaleRatio * 0.7);
            this._headerBar.scale.x = 0.8;
            this._headerContainer.position.set(screenW * 0.25, 0);

            this._midText.scale.set(scaleRatio);
            this._midText.position.set(screenW * 0.25, screenH * 0.3);
        } else {
            if (aspectRatio > 0.63) {
                scaleRatio *= 0.9;
            }

            this._headerContainer.scale.set(scaleRatio);
            this._headerBar.scale.x = 0.8;
            this._headerContainer.position.set(screenW * 0.5, 0);

            this._midText.scale.set(scaleRatio);
            this._midText.position.set(screenW * 0.5, screenH * 0.25);
        }

        this._hand.scale.set(scaleRatio * 0.6);

        if (this._messageText) {
            this._messageText.scale.set(scaleRatio);
            this._messageText.position.set(
                this._midText.x,
                this._midText.y + 50
            );
        }

        this.animateHeader();
    }

    public animateHeader() {
        gsap.killTweensOf(this._headerContainer.position);
        gsap.to(this._headerContainer.position, {
            y:
                this._headerContainer.position.y +
                this._headerContainer.height * 0.4,
            duration: 1,
        });
    }

    public get hand() {
        return this._hand;
    }
}
