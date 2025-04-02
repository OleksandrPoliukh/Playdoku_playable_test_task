import { Sprite, Point } from "pixi.js";

export default class AlphaCollisionHelper {
    static setAlphaHitArea(sprite: Sprite) {
        const tex = sprite.texture;
        const baseTex = tex.baseTexture;
        const source = (baseTex.resource as any).source;

        const canvas = document.createElement("canvas");
        canvas.width = tex.width;
        canvas.height = tex.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(source, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        sprite.containsPoint = (point: Point) => {
            const local = sprite.toLocal(point);
            const x = Math.round(local.x + sprite.anchor.x * tex.width);
            const y = Math.round(local.y + sprite.anchor.y * tex.height);
            if (x < 0 || y < 0 || x >= tex.width || y >= tex.height)
                return false;
            return data[(y * tex.width + x) * 4 + 3] > 1;
        };
    }

    static logOpaqueBounds(sprite: Sprite) {
        const tex = sprite.texture;
        const baseTex = tex.baseTexture;
        const source = (baseTex.resource as any).source;

        const canvas = document.createElement("canvas");
        canvas.width = tex.width;
        canvas.height = tex.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(source, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let minX = tex.width,
            maxX = 0;
        let minY = tex.height,
            maxY = 0;

        for (let y = 0; y < tex.height; y++) {
            for (let x = 0; x < tex.width; x++) {
                const alpha = data[(y * tex.width + x) * 4 + 3];
                if (alpha > 1) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        const localMinX = minX - tex.width / 2;
        const localMaxX = maxX - tex.width / 2;
        const localMinY = minY - tex.height / 2;
        const localMaxY = maxY - tex.height / 2;

        if (
            minX !== tex.width &&
            maxX !== 0 &&
            minY !== tex.height &&
            maxY !== 0
        ) {
            (sprite as any).outlineLocalMinX = localMinX;
            (sprite as any).outlineLocalMinY = localMinY;
            (sprite as any).outlineLocalMaxX = localMaxX;
            (sprite as any).outlineLocalMaxY = localMaxY;
        }
    }

    static alphaHitTestIntersection(
        a: Sprite,
        b: Sprite,
        mode: "intersect" | "inside" = "intersect"
    ): boolean {
        const step = 5;
        const boundsA = a.getBounds();

        for (let x = boundsA.left; x <= boundsA.right; x += step) {
            for (let y = boundsA.top; y <= boundsA.bottom; y += step) {
                const point = new Point(x, y);
                const aHasAlpha = a.containsPoint(point);
                const bHasAlpha = b.containsPoint(point);

                if (mode === "intersect") {
                    if (aHasAlpha && bHasAlpha) return true;
                } else if (mode === "inside") {
                    if (aHasAlpha && !bHasAlpha) return false;
                }
            }
        }

        return mode === "inside";
    }
}
