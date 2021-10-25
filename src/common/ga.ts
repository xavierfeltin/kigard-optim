import { normalize } from "path";
import { Config } from "pretty-format";
import { Attributes, buildHostileMagicTurns, defaultEquipment, Equipment, getHostileMagicThreshold, MasterDataOutfit, outfitParts } from "./kigardModels";
import { Branch, expectedValue, map, ProbaTree } from "./math";

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
    maxData: Attributes;
    minData: Attributes;
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
    carriedWeight: number,
}

export function createEmptyIndividual(): Individual {
    const ind: Individual = {
        id: 0,
        genes: [],
        fitness: 0,
        probability: 0,
        carriedWeight: 0
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

    let carriedWeight = 0;
    for (let part of outfitParts) {
        let partMasterData = masterData[part as keyof MasterDataOutfit];
        const maxAuthorizedWeight = config.data.allowedWeight - carriedWeight;
        let filtered = partMasterData.filter(value => {
            return value.weight <= maxAuthorizedWeight;
        });

        let index = Math.floor(Math.random() * filtered.length);
        let equipmentID = filtered[index].id;
        genes.push(equipmentID);
        const equipment: Equipment =  partMasterData.find(value => value.id === equipmentID) || defaultEquipment;
        carriedWeight += equipment.weight;
    }

    const ind: Individual = {
        id: id,
        genes: genes,
        fitness: 0,
        probability: 0,
        carriedWeight: carriedWeight
    };
    return ind;
}

export function generatePopulation(config: Configuration, masterData: MasterDataOutfit): Individual[] {
    let population: Individual[] = [];

    for(let i = 0; i < config.parameters.populationSize; i++) {
        const ind = createIndividual(Date.now(), config, masterData);
        population.push(ind);
    }

    return population;
}

export function evaluatePopulation(population: Individual[], config: Configuration, masterData: MasterDataOutfit) {
    let evaluated: Individual[] = [];
    for(let indiv of population) {

        const evalInd = evaluateIndividual(indiv, config, masterData);
        evaluated.push(evalInd);
    }
    return evaluated;
}

export function evaluateIndividual(ind: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    let evaluated = {...ind};

    // Update configuration with individual
    let modified: Attributes = {...config.data};
    for (let i = 0; i < evaluated.genes.length; i++) {
        const partOutfit = outfitParts[i];
        const equipmentID = evaluated.genes[i];
        const equipment = masterData[partOutfit as keyof MasterDataOutfit].find(value => value.id === equipmentID) || defaultEquipment;
        Object.keys(equipment.attributes).forEach((attr) => {
            modified[attr as keyof Attributes] = modified[attr as keyof Attributes] + equipment.attributes[attr as keyof Attributes];
        });
    }

    //modified = normalizeAttributes(modified, config);

    // Evaluate the individual
    /*
    const hittingPercentage = (100 - getHostileMagicThreshold(modified.mm, 15)) / 100;
    const magicRecoveryCoefficient = [0, 1/5, 2/5, 3/5, 4/5, 1, 1]; // for a spell costing 5pm
    const percentages = [1 - hittingPercentage, hittingPercentage];
    const gains = [Math.floor(modified.int / 2), modified.int];
    const expected = expectedValue(percentages, gains);
    evaluated.fitness = expected * magicRecoveryCoefficient[modified.rpm]; //modified.int * 3 + modified.mm * 4 + modified.rpm * 2 + modified.armor;
    */

    const simulation = buildHostileMagicTurns(5, [10, 10, 10, 10, 10], modified, 80, 15, 5, 5);
    evaluated.fitness = computeFitness(simulation);
    return evaluated;
}

function computeFitness(simulation: ProbaTree): number {
    let finalBranches = simulation.getAllFinalBranches(simulation.root);

    let expectedValue = 0;
    finalBranches.forEach(branch => {
        let finalSituation: Branch = simulation.computeGlobalWeightAndValueForBranch(branch);
        expectedValue += finalSituation.weight * finalSituation.value;
    });

    return expectedValue;
}

function normalizeAttributes(attributes: Attributes, config: Configuration): Attributes {
    let normalized = {...attributes};
    Object.keys(normalized).forEach((attr) => {
        normalized[attr as keyof Attributes] = map(normalized[attr as keyof Attributes], config.minData[attr as keyof Attributes], config.maxData[attr as keyof Attributes], 0, 1);
    });
    return normalized;
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
    let mutant: Individual = {
        id: Date.now(),
        genes: [...ind.genes],
        fitness: 0,
        probability: 0,
        carriedWeight: ind.carriedWeight
    };

    const localizationIndexToMutate = Math.floor(Math.random() * outfitParts.length);
    const partOutfitToMutate = outfitParts[localizationIndexToMutate];
    let partMasterData = masterData[partOutfitToMutate as keyof MasterDataOutfit];

    const previousEquipment: Equipment = partMasterData.find(value => value.id === mutant.genes[localizationIndexToMutate]) || defaultEquipment;
    let carriedWeight = mutant.carriedWeight - previousEquipment.weight; // remove previous equipment since we are replacing it

    let filtered = partMasterData.filter(value => {
        return value.weight <= (config.data.allowedWeight - carriedWeight);
    });

    let index = Math.floor(Math.random() * filtered.length);
    let equipmentID = filtered[index].id;
    mutant.genes[localizationIndexToMutate] = equipmentID;
    const newEquipment: Equipment =  partMasterData.find(value => value.id === equipmentID) || defaultEquipment;
    mutant.carriedWeight = carriedWeight + newEquipment.weight ;

    return mutant;
}

export function crossOver(a: Individual, b: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    const child: Individual = {
        genes: [],
        fitness: 0,
        probability: 0,
        id: Date.now(),
        carriedWeight: 0
    };

    const primaryGenes = a.fitness > b.fitness ? a.genes : b.genes;
    const secondaryGenes = a.fitness > b.fitness ? b.genes : a.genes;
    const splitIndex = Math.floor(primaryGenes.length * config.parameters.crossoverParentRatio);
    child.genes = primaryGenes.slice(0, splitIndex);

    // Get carried weight for the current genes
    let carriedWeight = 0;
    for (let i = 0; i < child.genes.length; i++) {
        let part = outfitParts[i];
        let partMasterData = masterData[part as keyof MasterDataOutfit];
        const equipment: Equipment =  partMasterData.find(value => value.id === child.genes[i]) || defaultEquipment;
        carriedWeight += equipment.weight;
    }

    const remainingSecondaryGenes = secondaryGenes.slice(splitIndex);
    for (let i = 0; i < remainingSecondaryGenes.length; i++) {
        let part = outfitParts[i + splitIndex];
        let partMasterData = masterData[part as keyof MasterDataOutfit];

        const primaryEquipment: Equipment =  partMasterData.find(value => value.id === primaryGenes[child.genes.length + i]) || defaultEquipment;
        const secondaryEquipment: Equipment =  partMasterData.find(value => value.id === remainingSecondaryGenes[i]) || defaultEquipment;

        if (secondaryEquipment.weight + carriedWeight <= config.data.allowedWeight) {
            // Get secondary equipment if possible
            child.genes.push(remainingSecondaryGenes[i]);
            carriedWeight += secondaryEquipment.weight;
        }
        else if (primaryEquipment.weight + carriedWeight <= config.data.allowedWeight ) {
            // Get primary parent otherwise if possible
            child.genes.push(primaryGenes[child.genes.length + i]);
            carriedWeight += primaryEquipment.weight;
        }
        else {
            // No equipment for this localization
            child.genes.push(0);
        }
    }
    child.carriedWeight = carriedWeight;
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
            nextPopulation.push(mutant);
        }
        else if (rand < (config.parameters.keepPreviousRatio + config.parameters.newIndividualRatio)) {
            // Create a new individual
            let ind = createIndividual(Date.now(), config, masterData);
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
            nextPopulation.push(child);
        }
    }

    return nextPopulation;
}