import "./style.css";
import FontFaceObserver from "fontfaceobserver";
import GameScene from "./scene/GameScene";
import { loadAssets } from "./loader/pixi-loader";

import Network from "./networks/Network";
import Applovin from "./networks/Applovin";
import Mintegral from "./networks/Mintegral";
import Moloco from "./networks/Moloco";
import Google from "./networks/GoogleAds";
import UnityAds from "./networks/UnityAds";

const FONT = new FontFaceObserver("Montserrat Semibold", { weight: 700 });

async function start() {
    await loadAssets();
    FONT.load();
    (window as any).gameReady && (window as any).gameReady();
    await GameScene.instance.createLevel();
    GameScene.instance.start();
    GameScene.instance.render();
}

window.addEventListener("load", () => {
    start();
});

const currentVersion = document.body.dataset.pageTitle;

export let network: Network;
switch (currentVersion) {
    case "Applovin":
        network = new Applovin();
        break;
    case "Mintegral":
        network = new Mintegral();
        break;
    case "Moloco":
        network = new Moloco();
        break;
    case "Google":
        network = new Google();
        break;
    case "UnityAds":
        network = new UnityAds();
        break;
}
