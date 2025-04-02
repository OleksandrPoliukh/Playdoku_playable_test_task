import Level from "./Level/Level";
import { Application, Sprite, Texture } from "pixi.js";

export const app = new Application({
    eventMode: "passive",
    resolution: Math.max(window.devicePixelRatio, 2),
    backgroundColor: 0xff0000,
    backgroundAlpha: 1,
});

class GameScene {
    private static _instance = new GameScene();
    private backgroundImage: Sprite;
    private _width: number;
    private _height: number;
    private _level: Level;

    private constructor() {
        this._width = window.innerWidth;
        this._height = window.innerHeight;

        const canvas = document.querySelector<HTMLElement>("#scene");
        if (!canvas) {
            throw "unable to find canvas element";
        }

        window.addEventListener("resize", this.resize, false);
    }

    public static get instance() {
        return this._instance;
    }

    private initBackground() {
        this.backgroundImage = new Sprite(Texture.from("bg.png"));
        this.backgroundImage.width = app.screen.width;
        this.backgroundImage.height = app.screen.height;
        app.stage.addChild(this.backgroundImage);
    }

    public createLevel = async () => {
        this.initBackground();
        app.stage.interactive = true;

        this._level = new Level();
        this._level.init();

        app.stage.cursor = "none";
        app.stage.hitArea = app.screen;

        document.getElementById("game_app")?.appendChild((app as any).view);

        this.resize();
    };

    private resize = () => {
        this._width = window.innerWidth;
        this._height = window.innerHeight;

        if (app) {
            (
                (app?.renderer.view as any).style as any
            ).width = `${this._width}px`;
            (
                (app?.renderer.view as any).style as any
            ).height = `${this._height}px`;
            window.scrollTo(0, 0);

            app.renderer.resize(this._width, this._height);
            this._level?.resize();

            if (this.backgroundImage) {
                const scaleX = this._width / this.backgroundImage.texture.width;
                const scaleY =
                    this._height / this.backgroundImage.texture.height;

                this.backgroundImage.scale.set(Math.max(scaleX, scaleY));
            }
        }
    };

    public start = () => {
        this._level.startGame();
    };

    public render = () => {
        requestAnimationFrame(this.render);
    };
}

export default GameScene;
