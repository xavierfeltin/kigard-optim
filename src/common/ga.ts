import { Attributes, Equipment } from "./kigardModels";

export interface Configuration {
    data: Attributes;
    populationSize: number;
    selectCutoff: number;
    keepPreviousRatio: number;
    newIndividualRatio: number;
    parentSelectionStrategy: string;
    crossoverStrategy: string;
    crossoverParentRatio: number;
    tournamentSize: number;
}

export interface SimuState {
    isRunning: boolean;
    bestSolution: Individual;
    population: Individual[];
}
export interface Individual {
    id: number;
    genes: number[];
    fitness: number;
    probability: number;
    phenotype: Equipment[];
}

export function createEmptyIndividual(): Individual {
    const ind: Individual = {
        id: 0,
        genes: [],
        fitness: 0,
        probability: 0,
        phenotype: []
    }

    return ind;
}

export function createIndividual(id: number, config: Configuration, masterData: Equipment[]): Individual {
    const equipmentIdx = Math.floor(Math.random() * masterData.length);
    const ind: Individual = {
        id: id,
        genes: [equipmentIdx],
        fitness: NaN,
        probability: NaN,
        phenotype: [masterData[equipmentIdx]]
    };
    return ind;
}

export function generatePopulation(config: Configuration, masterData: Equipment[]): Individual[] {
    let population: Individual[] = [];

    for(let i = 0; i < config.populationSize; i++) {
        const ind = createIndividual(i, config, masterData);
        population.push(ind);
    }

    return population;
}

export function evaluatePopulation(population: Individual[], config: Configuration) {
    let evaluated: Individual[] = [];
    for(let indiv of population) {

        const evalInd = evaluateIndividual(indiv, config);
        evaluated.push(evalInd);
    }
    return evaluated;
}

export function evaluateIndividual(ind: Individual, config: Configuration): Individual {
    let evaluated = {...ind};
    
    // Update configuration with individual
    let modifiedAttributes: Attributes = {...config.data};
    for (let idx of evaluated.genes) {            
        const equipment: Equipment = evaluated.phenotype[idx];
        Object.keys(equipment.attributes).forEach((attr) => {
            modifiedAttributes[attr as keyof Attributes] = config.data[attr as keyof Attributes] + equipment.attributes[attr as keyof Attributes];
        })
    }

    // Evaluate the individual
    evaluated.fitness = modifiedAttributes.int;
    return evaluated;
}

export function convertFitnessIntoProbabilities(population: Individual[]): Individual[] {
    let sumFit = 0.0;
    let scores = [];
    let populationWithProba = [...population];

    for (let ind of population) {
        const fitness = ind.fitness * ind.fitness;
        scores.push(fitness);
        sumFit += fitness;
    }

    let previousProba = 0.0;
    for (let i = 0; i < scores.length; i++) {
        const relativeFitness = scores[i] / sumFit;
        previousProba += relativeFitness;
        populationWithProba[i].probability = previousProba; // cumulation of probabilities for fortune of wheel
    }

    // Round last probability to 1
    const lastIndex = populationWithProba.length - 1;
    populationWithProba[lastIndex].probability = 1.0;
    return populationWithProba;
}

export function sortDescByFitness(population: Individual[]): Individual[] {
    const sortFn = (a: Individual, b: Individual): number => {
        return b.fitness - a.fitness;
    };

    return [...population].sort(sortFn);
}

export function sortDescByProbability(population: Individual[]): Individual[] {
    const sortFn = (a: Individual, b: Individual): number => {
        return a.probability - b.probability;
    };

    return [...population].sort(sortFn);
}


export function pickParent(population: Individual[]): Individual {
    const rand = Math.random();
    let i = 0;
    while (i < population.length && population[i].probability <= rand) {
        i++;
    }

    if (i === population.length) {
        i = i - 1;
    }
    return population[i];
}

export function generateTournamentPool(population: Individual[], poolSize: number): Individual[] {
    const pool: Individual[] = [];
    for (let i = 0; i < poolSize; i++) {
        const candidate = pickParent(population);
        pool.push(candidate);
    }
    return pool;
}

export function pickParentFromTournament(population: Individual[], tournamentSize: number): Individual {
    let best: Individual = createEmptyIndividual();
    for (let i = 0; i < tournamentSize; i++) {
        const index = Math.floor(Math.random() * population.length);
        const candidate = population[index];
        if (best.id === 0 || candidate.fitness > best.fitness) {
            best = candidate;
        }
    }
    return best;
}

export function randomNumberInRange(min: number, max: number, isInteger: boolean): number {
    let value = Math.random() * (max - min) + min;

    if (isInteger) {
        value = Math.floor(value);
    }
    else {
        value = Math.round(value * 1000.0) / 1000.0; // force 3 digits max
    }

    return value;
}

export function mutate(ind: Individual, config: Configuration, masterData: Equipment[]): Individual {
    return {...ind};
}

export function crossOver(parentA: Individual, parentB: Individual, config: Configuration): Individual {
    return {...parentA};
}

export function generateNewGeneration(population: Individual[], config: Configuration, masterData: Equipment[]): Individual[] {
    const poolSize = Math.round(population.length * config.selectCutoff);
    const tournamentPool = generateTournamentPool(population, poolSize);
    const nextPopulation: Individual[] = [];

    for (let i = 0; i < config.populationSize; i++) {
        const rand = Math.random();
        if (rand < config.keepPreviousRatio) {
            // Add an previous individual that may be mutated
            const happySelectInd = pickParent(population);
            let mutant: Individual = mutate(happySelectInd, config, masterData);

            mutant = evaluateIndividual(mutant, config);
            nextPopulation.push(mutant);
        }
        else if (rand < (config.keepPreviousRatio + config.newIndividualRatio)) {
            // Create a new individual
            let ind = createIndividual(i, config, masterData);
            ind = evaluateIndividual(ind, config);
            nextPopulation.push(ind);
        }
        else {
            // Create a child
            let parentA;
            let parentB;
            
            if (config.parentSelectionStrategy === "tournament") {
                parentA = pickParentFromTournament(tournamentPool, config.tournamentSize);
                parentB = pickParentFromTournament(tournamentPool, config.tournamentSize);
            }
            else {
                parentA = pickParent(population);
                parentB = pickParent(population);    
            }
            
            let child = crossOver(parentA, parentB, config);
            child = mutate(child, config, masterData);
            child = evaluateIndividual(child, config);
            nextPopulation.push(child);
        }
    }    

    return nextPopulation;
}