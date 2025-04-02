import Network from "./Network";

export default class Moloco extends Network {
    constructor() {
        super();
    }

    openStore() {
        window.FbPlayableAd
            ? window.FbPlayableAd.onCTAClick()
            : window.top.open(this.getUrl());
    }
}
