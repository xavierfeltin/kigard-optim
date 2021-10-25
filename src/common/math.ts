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

export class ProbaTree {
    public root: Branch;
    public constructor() {
        this.root = {
            weight: 1,
            value: 0,
            parent: undefined,
            branches: []
        };
    }

    public addLevel(currentBranch: Branch, weights: number[], values: number[]): Branch[] {
        const newBranches: Branch[] = [];
        for(let i = 0; i < weights.length; i++) {
            const newBranch: Branch = {
                weight: weights[i],
                value: values[i],
                parent: currentBranch,
                branches: undefined
            }
            newBranches.push(newBranch);

            if (!currentBranch.branches) {
                currentBranch.branches = [];
            }
            currentBranch.branches.push(newBranch);
        }

        return newBranches;
    }

    public getAllFinalBranches(root: Branch): Branch[] {
        if (!root.branches) {
            return [root];
        }

        let finalBranches: Branch[] = [];
        for (let i = 0; i < root.branches.length; i++) {
            finalBranches = finalBranches.concat(this.getAllFinalBranches(root.branches[i]));
        }

        return finalBranches;
    }

    public computeGlobalWeightAndValueForBranch(branch: Branch): Branch {
        let pathWeight = 1;
        let pathValue = 0;
        let current = branch;
        while (current.parent) {
            pathWeight = pathWeight * current.weight;
            pathValue = pathValue + current.value;
            current = current.parent;
        }

        return {
            weight: pathWeight,
            value: pathValue,
            parent: undefined,
            branches: undefined
        };
    }
}

export interface Branch {
    weight: number;
    value: number;
    parent: Branch | undefined;
    branches: Branch[] | undefined; //undefined for final node
}