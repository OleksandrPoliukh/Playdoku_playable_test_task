import { Signal } from "typed-signals";

export default class EventHelper {
    private static _instance = new EventHelper();
    public static get instance() {
        return this._instance;
    }

    public signals = {
        onFinish: new Signal<() => void>(),
        onTryAgain: new Signal<() => void>(),
        onGetCoordStartAnim: new Signal<(figure, shape) => void>(),
    };

    constructor() {}
}
