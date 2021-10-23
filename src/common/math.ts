export function map(val: number, minOrig: number, maxOrig: number, minDest: number, maxDest: number): number {
    const slope = (maxDest - minDest) / (maxOrig - minOrig);
    const mapped = minDest + slope * ( val - minOrig);
    return mapped;
}