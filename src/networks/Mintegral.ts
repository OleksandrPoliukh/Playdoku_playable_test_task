import Network from "./Network";
declare global {
    interface Window {
        install: any;
        gameEnd: any;
        gameStart: any;
        gameClose: any;
    }
}

window.gameStart = () => {};

window.gameClose = () => {};
export default class Mintegral extends Network {
    constructor() {
        super();
    }

    gameStart() {
        console.log("STARTED");
    }

    openStore() {
        console.log("OPENSTORE");

        window.install && window.install();
        window.gameEnd && window.gameEnd();
    }
}
