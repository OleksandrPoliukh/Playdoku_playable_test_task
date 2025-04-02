import Network from "./Network";

export default class Applovin extends Network {
    constructor() {
        super();
    }

    public openStore() {
        let gw = window as any;
        gw.mraid ? gw.mraid.open(this.getUrl()) : gw.top.open(this.getUrl());
    }
}
