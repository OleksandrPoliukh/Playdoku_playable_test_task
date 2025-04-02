import Network from "./Network";
declare global {
    interface Window {
        FbPlayableAd: any;
    }
}
export default class Facebook extends Network {
    constructor() {
        super();
    }

    openStore() {
        window.FbPlayableAd
            ? window.FbPlayableAd.onCTAClick()
            : window.top.open(this.getUrl());
    }
}
