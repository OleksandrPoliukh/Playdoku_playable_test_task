import { app } from "../GameScene";
import { audio, bgm } from "../../helpers/audio";
import UIManager from "./Managers/Mains/UIManager";
import FigureManager from "./Managers/Mains/FigureManager";
import ShapeManager from "./Managers/Mains/ShapeManager";
import FinalScreen from "./Components/FinalScreen";

export default class Level {
    private _hasInteracted: boolean;

    private _uiManager: UIManager;
    private _figureManager: FigureManager;
    private _shapeManager: ShapeManager;
    private _finalScreen: FinalScreen;

    private _baseDesignWidth = 1080;
    private _baseDesignHeight = 1080;
    private scaleRatio: number;

    constructor() {}

    public init() {
        this.initUIManager();
        this.initShapeManager();
        this.initFigureManager();
        this.initFinalScreen();

        app.stage.on("pointermove", this.onGlobalPointerMove);

        app.stage.setChildIndex(
            this._uiManager.hand,
            app.stage.children.length - 1
        );
    }

    private initFinalScreen() {
        this._finalScreen = new FinalScreen();
        this._finalScreen.init();
    }

    private initUIManager() {
        this._uiManager = new UIManager();
        this._uiManager.initUI();
    }

    private initFigureManager() {
        this._figureManager = new FigureManager(
            this._shapeManager.shape,
            this._uiManager,
            this.scaleRatio
        );
        this._figureManager.initFigures(6);
    }

    private initShapeManager() {
        this._shapeManager = new ShapeManager();
        this._shapeManager.init();
    }

    private onGlobalPointerMove = (event) => {
        const pos = event.data.global;

        this._uiManager.updateHandPosition(pos);

        this._figureManager.onPointerMove(pos);
    };

    private setupAudio() {
        audio.muted(true);

        document.addEventListener("pointerdown", () => {
            if (!this._hasInteracted) {
                audio.muted(false);
                bgm?.play("bg.mp3");
            }

            this._hasInteracted = true;
        });
    }

    public startGame() {
        this._uiManager.animateHeader();
        this.setupAudio();
    }

    public resize = () => {
        const screenW = app.screen.width;
        const screenH = app.screen.height;
        const aspectRatio = screenW / screenH;

        this.scaleRatio =
            Math.min(
                screenW / this._baseDesignWidth,
                screenH / this._baseDesignHeight
            ) * 1.3;

        if (aspectRatio > 1.2 && aspectRatio < 1.5) {
            this.scaleRatio *= aspectRatio / 1.6;
        }

        this._shapeManager.resize(
            this.scaleRatio,
            screenW,
            screenH,
            aspectRatio
        );
        this._figureManager.resize(
            this.scaleRatio,
            screenW,
            screenH,
            aspectRatio
        );
        this._finalScreen.resize(this.scaleRatio, screenW, screenH);
        this._uiManager.resize(this.scaleRatio);
    };
}
