import { KigardToken } from "./kigardModels";

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

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(sequence: number[]): number[] {
    let shuffled = [...sequence];
    let currentIndex = shuffled.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
}

export class ProbaTree {
    public root: Branch;
    public expectedValue: number;

    public constructor(initialValue: number = 0) {
        this.expectedValue = 0;
        this.root = {
            weight: 1,
            depthWeight: 1,
            value: initialValue,
            token: {
                burning: 0,
                regeneration: 0,
                poison: 0,
                bleeding: 0,
                knockedOut: 0,
                breach: 0,
                terror: 0,
                necrosis: 0
            },
            //parent: undefined,
            branches: []
        };
    }

    public addLevel(currentBranch: Branch, weights: number[], values: number[], tokens: KigardToken[], isFinals: boolean[]): Branch[] {
        const newBranches: Branch[] = [];
        for(let i = 0; i < weights.length; i++) {
            const newBranch: Branch = {
                weight: weights[i],
                depthWeight: weights[i] * currentBranch.depthWeight,
                value: values[i],
                token: {...tokens[i]},
                //parent: currentBranch,
                branches: undefined
            }

            /*
            if (!currentBranch.branches) {
                currentBranch.branches = [];
            }
            currentBranch.branches.push(newBranch);
            */

            if (isFinals[i]) {
                this.expectedValue += newBranch.depthWeight * (this.root.value - newBranch.value); 
            }  
            else {
                newBranches.push(newBranch);
            }          
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
        let current = branch;
        /*
        while (current.parent) {
            pathWeight = pathWeight * current.weight;
            current = current.parent;
        }
        */

        return {
            weight: pathWeight,
            depthWeight: branch.depthWeight,
            value: this.root.value - branch.value,
            token: {...branch.token},
            //parent: undefined,
            branches: undefined
        };
    }

    public getTreeExpectedValue(): number {
        return this.expectedValue;
    }
}

export interface Branch {
    weight: number;
    depthWeight: number;
    value: number;
    token: KigardToken;
    //parent: Branch | undefined;
    branches: Branch[] | undefined; //undefined for final node
}