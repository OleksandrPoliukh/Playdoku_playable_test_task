import { Signal } from "typed-signals";
const APP_STORE_URL =
    "https://apps.apple.com/us/app/playdoku-block-puzzle-game/id6443701534";
const GOOGLE_PLAY_URL =
    "https://play.google.com/store/apps/details?id=games.burny.playdoku.block.puzzle&hl=en&gl=US";

export default class Network {
    public signals = {
        onClickRedirect: new Signal<() => void>(),
    };
    constructor() {
        this.signals.onClickRedirect.connect(() => {
            console.log("GO TO STORE");
            this.complete();
            this.openStore();
        });
    }

    public getUrl() {
        var userAgent =
            navigator.userAgent || navigator.vendor || (window as any).opera;

        if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
            return APP_STORE_URL;
        } else if (/android/i.test(userAgent)) {
            return GOOGLE_PLAY_URL;
        } else {
            return GOOGLE_PLAY_URL;
        }
    }

    public openStore() {}

    public complete() {}
}
