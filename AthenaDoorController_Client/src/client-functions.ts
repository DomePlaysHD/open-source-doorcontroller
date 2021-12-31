import * as native from 'natives';

export function getDoorVectors() {}
// >> Thanks to YANN (alt:V Discord - Snippets)
export function waitUntilDoorIsClosed(entity: number, originOrientationYaw: number): Promise<boolean> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            clearInterval(interval), resolve(false);
        }, 5000);
        let i = 0;

        const interval = setInterval(() => {
            if (i === 5) {
                clearTimeout(timeout), clearInterval(interval), resolve(true);
            }
            if (isNumberBetween(originOrientationYaw, native.getEntityRotation(entity, 2).z, 1)) {
                i++;
            } else {
                i = 0;
            }
        }, 10);
    });
}

export function isNumberBetween(n1: number, n2: number, range: number): boolean {
    return n1 - range < n2 && n2 < n1 + range;
}

export function getEntityCenter(entity: number) {
    const [, min, max] = native.getModelDimensions(native.getEntityModel(entity));
    return native.getOffsetFromEntityInWorldCoords(
        entity,
        (min.x + max.x) / 2,
        (min.y + max.y) / 2,
        (min.z + max.z) / 2,
    );
}
