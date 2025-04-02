import gsap from "gsap";
import { app } from "../../../GameScene";
import { Sprite, Texture } from "pixi.js";
import EventHelper from "../../../../helpers/EventHelper";

export default class ShapeManager {
    private _shape: Sprite;
    private _redFill: Sprite;
    private _sheet: Sprite;

    constructor() {
        this.setupEvents();
    }

    private setupEvents() {
        EventHelper.instance.signals.onTryAgain.connect(() => {
            this.showRedFill();
        });

        EventHelper.instance.signals.onFinish.connect(() => {
            this.hideAllStaff();
        });
    }

    private hideAllStaff() {
        gsap.to(this._shape, {
            alpha: 0,
            duration: 0.5,
        });
    }

    public init() {
        this._redFill = new Sprite(Texture.from("cupcake/red_fill.png"));
        this._redFill.anchor.set(0.5);
        this._redFill.alpha = 0;
        app.stage.addChild(this._redFill);

        this._sheet = new Sprite(Texture.from("final/sheet.png"));
        this._sheet.anchor.set(0.5);
        app.stage.addChild(this._sheet);

        this._shape = new Sprite(Texture.from("cupcake/cupcake.png"));
        this._shape.anchor.set(0.5);
        app.stage.addChild(this._shape);
    }

    private showRedFill() {
        const tl = gsap.timeline({ repeat: 2 });

        tl.to(this._redFill, {
            alpha: 1,
            duration: 0.2,
        }).to(this._redFill, {
            alpha: 0,
            duration: 0.2,
        });
    }

    public resize(
        scaleRatio: number,
        screenW: number,
        screenH: number,
        aspectRatio: number
    ) {
        if (aspectRatio > 1.2) {
            this._shape.position.set(screenW * 0.65, screenH * 0.45);
            this._redFill.position.set(screenW * 0.65, screenH * 0.42);
            if (aspectRatio < 1.5) {
                scaleRatio *= aspectRatio / 1.6;
            }
        } else {
            this._shape.position.set(screenW * 0.5, screenH * 0.6);
            this._redFill.position.set(screenW * 0.5, screenH * 0.57);
        }

        const sheetOriginalWidth = this._sheet.texture.width || 100;
        const sheetOriginalHeight = this._sheet.texture.height || 100;

        const sheetScaleX = screenW / sheetOriginalWidth;
        const sheetScaleY = scaleRatio;

        this._sheet.scale.set(sheetScaleX, sheetScaleY);

        const sheetY = screenH - (sheetOriginalHeight * sheetScaleY) / 2;
        this._sheet.position.set(screenW * 0.5, sheetY);

        this._shape.scale.set(scaleRatio);
        this._redFill.scale.set(scaleRatio);
    }

    public get shape(): Sprite {
        return this._shape;
    }

    public get redFill(): Sprite {
        return this._redFill;
    }
}
