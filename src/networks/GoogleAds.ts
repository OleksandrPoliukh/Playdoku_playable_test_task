import Network from "./Network";

export default class Google extends Network {
    constructor() {
        let exitApi = document.createElement("script");
        exitApi.type = "text/javascript";
        exitApi.src =
            "https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js";

        setTimeout(() => {
            document.body.appendChild(exitApi);
        }, 100);
        super();
    }

    openStore() {
        (window as any).ExitApi
            ? (window as any).ExitApi.exit()
            : window.top.open(this.getUrl());
    }
}
