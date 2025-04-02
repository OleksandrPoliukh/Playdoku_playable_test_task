import {
    Assets,
    extensions,
    ExtensionType,
    resolveTextureUrl,
    ResolveURLParser,
    settings,
} from "pixi.js";

export async function loadAssets() {
    await Promise.all([
        loadImageAssets(),
        loadAudioAssets(),
        loadFontsAssets(),
    ]);
}

async function loadImageAssets() {
    const assetsList = [
        "cupcake/cupcake.png",
        "cupcake/figure_1.png",
        "cupcake/figure_2.png",
        "cupcake/figure_3.png",
        "cupcake/figure_4.png",
        "cupcake/figure_5.png",
        "cupcake/figure_6.png",
        "cupcake/red_fill.png",
        "final/sheet.png",
        "final/button.png",
        "final/logo.png",
        "final/newFig1.png",
        "final/newFig2.png",
        "final/newFig3.png",
        "final/newFig4.png",
        "bg.png",
        "plashka.png",
        "hand.png",
    ];

    const context = require.context(
        "../../assets/ui-assets/",
        true,
        /\.(png|json)$/
    );
    const assetsData: { [key: string]: any } = {};

    for (const asset of assetsList) {
        assetsData[asset] = context("./" + asset);
    }

    try {
        const bundle = await Promise.all(
            assetsList.map(async (assetName) => {
                return {
                    name: assetName,
                    srcs: assetsData[assetName],
                };
            })
        );

        Assets.addBundle("default", bundle);

        await Assets.loadBundle(["default"]);
    } catch (error) {
        console.error("Failed to load assets", error);
    }
}

async function loadAudioAssets() {
    const assetsList = [
        "wrong.mp3",
        "place-figure.mp3",
        "bg.mp3",
        "well-done.mp3",
        "final-screen.mp3",
    ];

    try {
        const requireContext = require.context(
            "../../assets/audio/",
            true,
            /\.mp3$/
        );
        const assetsData: { [key: string]: any } = {};

        for (const asset of assetsList) {
            assetsData[asset] = requireContext("./" + asset);
        }

        const bundle = await Promise.all(
            assetsList.map(async (assetName) => {
                return {
                    name: assetName,
                    srcs: assetsData[assetName],
                };
            })
        );

        Assets.addBundle("audio", bundle);
        await Assets.loadBundle("audio");
    } catch (error) {
        console.error("Failed to load assets", error);
    }
}

async function loadFontsAssets() {
    const assetsList = ["Montserrat-Semibold.ttf"];

    try {
        const requireContext = require.context(
            "../../assets/fonts/",
            true,
            /\.(woff2|ttf)$/
        );
        const assetsData: { [key: string]: any } = {};

        for (const asset of assetsList) {
            assetsData[asset] = requireContext("./" + asset);
        }

        await Promise.all(
            assetsList.map(async (assetName) => {
                const style = document.createElement("style");
                const fontName = assetName
                    .replace(/\.(woff2|ttf)$/, "")
                    .replace(/-/g, " ");
                style.innerHTML = `
        @font-face {
          font-family: '${fontName}';
          src: url('${assetsData[assetName]}') format('truetype');
        }
      `;
                document.head.appendChild(style);
                await (document as any).fonts.load(`16px '${fontName}'`);
            })
        );
    } catch (error) {
        console.error("Failed to load assets", error);
    }
}

export async function checkAssetsLoaded(bundleName: string) {
    const isLoaded = Assets.cache.has(bundleName);
    return isLoaded;
}
