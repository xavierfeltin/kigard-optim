export function map(val: number, minOrig: number, maxOrig: number, minDest: number, maxDest: number): number {
    const slope = (maxDest - minDest) / (maxOrig - minOrig);
    const mapped = minDest + slope * ( val - minOrig);
    return mapped;
}

export function expectedValue(probabilities: number[], gain: number[]): number {
    let expectedValue = 0;
    for (let i = 0; i < probabilities.length; i++) {
        expectedValue += probabilities[i] * gain[i];
    }
    return expectedValue;
}