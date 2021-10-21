import { Attributes, Equipment, MasterDataOutfit, outfitParts } from "./kigardModels";

export interface GAParameters {
    populationSize: number;
    selectCutoff: number;
    keepPreviousRatio: number;
    newIndividualRatio: number;
    parentSelectionStrategy: string;
    crossoverStrategy: string;
    crossoverParentRatio: number;
    tournamentSize: number;
}
export interface Configuration {
    data: Attributes;
    parameters: GAParameters;
}

export interface SimuState {
    isRunning: boolean;
    bestSolution: Individual;
    population: Individual[];
    generation: number;
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

export function isOutfitAllowed(outfit: Equipment[], config: Configuration): boolean {
    // Check carried weight to not go further character allowed weight
    let carriedWeight = 0;
    const allowedWeight = Math.floor((config.data.con + config.data.str) / 2);
    
    outfit.forEach(equipment => {
        carriedWeight += equipment.weight;
    })
    
    return carriedWeight <= allowedWeight;
}

export function createIndividual(id: number, config: Configuration, masterData: MasterDataOutfit): Individual {

    const genes: number[] = [];
    const phenotype: Equipment[] = [];

    let isOutfitValid = false;
    while (!isOutfitValid) {
        for (let part of outfitParts) {
            let partMasterData = masterData[part as keyof MasterDataOutfit];
            let equipmentIdx = Math.floor(Math.random() * partMasterData.length);
            genes.push(equipmentIdx);
            phenotype.push(partMasterData[equipmentIdx]);
        }    
        isOutfitValid = isOutfitAllowed(phenotype, config);
    }
    
    const ind: Individual = {
        id: id,
        genes: genes,
        fitness: NaN,
        probability: NaN,
        phenotype: phenotype
    };
    return ind;
}

export function generatePopulation(config: Configuration, masterData: MasterDataOutfit): Individual[] {
    let population: Individual[] = [];

    for(let i = 0; i < config.parameters.populationSize; i++) {
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
    for (let i = 0; i < evaluated.genes.length; i++) {
        const equipment: Equipment = evaluated.phenotype[i];
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

export function mutate(ind: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    let mutant = {...ind};

    let isOutfitValid = false;
    let mutatedGenes = [];
    let mutatedPhenotype = [];
    
    while (!isOutfitValid) {
        mutatedGenes = [];
        mutatedPhenotype = [];
        for (let part of outfitParts) {
            let partMasterData = masterData[part as keyof MasterDataOutfit];
    
            let delta = randomNumberInRange(-2, 2, true);
            let newGene = mutant.genes[0] + delta;
            newGene = Math.min(newGene, partMasterData.length);
            newGene = Math.max(newGene, 0);
            mutatedGenes.push(newGene);
            mutatedPhenotype.push(partMasterData[mutant.genes[0]]);
        }
        isOutfitValid = isOutfitAllowed(mutatedPhenotype, config);
    }

    mutant.genes = mutatedGenes;
    mutant.phenotype = mutatedPhenotype;
    return mutant;
}

export function crossOver(a: Individual, b: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    const child: Individual = {
        genes: [],
        fitness: 0,
        probability: 0,
        id: Date.now(),
        phenotype: []
    };

    const primaryGenes = a.fitness > b.fitness ? a.genes : b.genes;
    const secondaryGenes = a.fitness > b.fitness ? b.genes : a.genes;
    const splitIndex = Math.floor(primaryGenes.length * config.parameters.crossoverParentRatio);
    child.genes = child.genes.concat(primaryGenes.slice(0, splitIndex));
    child.genes = child.genes.concat(secondaryGenes.slice(splitIndex));

    if(!isEquipmentAllowed(masterData[child.genes[0]], config)) {
        child.genes = [...primaryGenes];
    }

    child.genes.forEach(gene => {
        child.phenotype.push(masterData[gene]);
    })

    return child;
}

export function generateNewGeneration(population: Individual[], config: Configuration, masterData: MasterDataOutfit): Individual[] {
    const poolSize = Math.round(population.length * config.parameters.selectCutoff);
    const tournamentPool = generateTournamentPool(population, poolSize);
    const nextPopulation: Individual[] = [];

    for (let i = 0; i < config.parameters.populationSize; i++) {
        const rand = Math.random();
        if (rand < config.parameters.keepPreviousRatio) {
            // Add an previous individual that may be mutated
            const happySelectInd = pickParent(population);
            let mutant: Individual = mutate(happySelectInd, config, masterData);

            mutant = evaluateIndividual(mutant, config);
            nextPopulation.push(mutant);
        }
        else if (rand < (config.parameters.keepPreviousRatio + config.parameters.newIndividualRatio)) {
            // Create a new individual
            let ind = createIndividual(i, config, masterData);
            ind = evaluateIndividual(ind, config);
            nextPopulation.push(ind);
        }
        else {
            // Create a child
            let parentA;
            let parentB;

            if (config.parameters.parentSelectionStrategy === "tournament") {
                parentA = pickParentFromTournament(tournamentPool, config.parameters.tournamentSize);
                parentB = pickParentFromTournament(tournamentPool, config.parameters.tournamentSize);
            }
            else {
                parentA = pickParent(population);
                parentB = pickParent(population);
            }

            let child = crossOver(parentA, parentB, config, masterData);
            child = mutate(child, config, masterData);
            child = evaluateIndividual(child, config);
            nextPopulation.push(child);
        }
    }

    return nextPopulation;
}