import { Sprite, Point, Text } from "pixi.js";

export default class FigurePositionHelper {
    static getGlobalCenter(sprite: Sprite): Point {
        const minX = (sprite as any).outlineLocalMinX || -sprite.width / 2;
        const maxX = (sprite as any).outlineLocalMaxX || sprite.width / 2;
        const minY = (sprite as any).outlineLocalMinY || -sprite.height / 2;
        const maxY = (sprite as any).outlineLocalMaxY || sprite.height / 2;

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        return sprite.toGlobal(new Point(centerX, centerY));
    }

    static positionText(sprite: Sprite, text: Text, offsetY: number = 30) {
        const minX = (sprite as any).outlineLocalMinX || -sprite.width / 2;
        const maxX = (sprite as any).outlineLocalMaxX || sprite.width / 2;
        const minY = (sprite as any).outlineLocalMinY || -sprite.height / 2;
        const maxY = (sprite as any).outlineLocalMaxY || sprite.height / 2;

        const topLeft = sprite.toGlobal(new Point(minX, minY));
        const bottomRight = sprite.toGlobal(new Point(maxX, maxY));

        text.x = topLeft.x + (bottomRight.x - topLeft.x) / 2;
        text.y = bottomRight.y + offsetY;
    }
}
