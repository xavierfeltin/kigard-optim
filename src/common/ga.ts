import { Action, Attributes, buildTurns, defaultAttributes, defaultEquipment, Equipment, Localization, MasterDataOutfit, outfitParts, Profile } from "./kigardModels";
import { Branch, ProbaTree, shuffle } from "./math";

export interface GAParameters {
    optimProfile: Profile;
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
    carriedWeight: number,
    hands: number;
}

export function createEmptyIndividual(): Individual {
    const ind: Individual = {
        id: 0,
        genes: [],
        fitness: 0,
        probability: 0,
        carriedWeight: 0,
        hands: 0
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

    const genes: number[] = Array.from({length: outfitParts.length}, (_, i) => 0);

    let carriedWeight = 0;
    let allowedWeight = config.data.allowedWeight;
    let busyHands = 0;
    let selectedWeapon: Equipment = {...defaultEquipment};

    // Organize data depending of the profile
    let sequence = Array.from(Array(outfitParts.length).keys());
    sequence = shuffle(sequence);

    switch(config.parameters.optimProfile) {
        case Profile.mage:
        case Profile.healer: {
            // Require a left hand with at least one attach for a spell
            let leftHandIdx = outfitParts.findIndex(value => value === "leftHand");
            if (sequence[0] !== leftHandIdx) {
                let sequenceLeftHandIdx = sequence.findIndex(value => value === leftHandIdx);
                let tmp = sequence[0];
                sequence[0] = leftHandIdx;
                sequence[sequenceLeftHandIdx] = tmp;
            }

            break;
        }
        case Profile.archer: {
            // Require a right hand as an arc or a rifle
            let rightHandIdx = outfitParts.findIndex(value => value === "rightHand");
            if (sequence[0] !== rightHandIdx) {
                let sequencerightHandIdx = sequence.findIndex(value => value === rightHandIdx);
                let tmp = sequence[0];
                sequence[0] = rightHandIdx;
                sequence[sequencerightHandIdx] = tmp;
            }
            break;
        }
    }

    for (let idx of sequence) {
        let part = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[part as keyof MasterDataOutfit];
        const maxAuthorizedWeight = allowedWeight - carriedWeight;

        // Filter on weight
        let filtered = partMasterData.filter(value => {
            return value.weight <= maxAuthorizedWeight;
        });

        // Filter on hands
        let hands = busyHands;
        filtered = filtered.filter(value => {
            return value.hands <= 2 - hands;
        });

        switch(config.parameters.optimProfile) {
            case Profile.mage:
            case Profile.healer: {
                // Require a left hand with at least one attach for a spell
                filtered = filtered.filter(value => {
                    let magicFilter = true;
                    if(part.toLowerCase() === Localization[Localization.Lefthand].toLowerCase()) {
                        magicFilter = value.attributes.nbSpellAttach > 0;
                    }
                    return magicFilter;
                });

                break;
            }
            case Profile.archer: {
                // Require a right hand as an arc or a rifle
                filtered = filtered.filter(value => {
                    let isArcOrRifle = true;
                    if(part.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        isArcOrRifle = value.attributes.isBow === 1 || value.attributes.isRifle === 1;
                    }
                    return isArcOrRifle;
                });

                if (selectedWeapon.attributes.isBow) {
                    filtered = filtered.filter(value => {
                        let isContainerForWeapon = true;
                        if(part.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                            isContainerForWeapon = value.attributes.isBow === 1;
                        }
                        return isContainerForWeapon;
                    });
                }
                else { //rifle
                    filtered = filtered.filter(value => {
                        let isContainerForWeapon = true;
                        if(part.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                            isContainerForWeapon = value.attributes.isRifle === 1;
                        }
                        return isContainerForWeapon;
                    });
                }

                break;
            }
            case Profile.warrior: {
                // Exclude distant weapon
                filtered = filtered.filter(value => {
                    let isNotDistantWeapon = true;
                    if(part.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        isNotDistantWeapon = value.attributes.maxRange === 0;
                    }
                    return isNotDistantWeapon;
                });
                break;
            }
            case Profile.tank: {
                // Exclude distant weapon
                filtered = filtered.filter(value => {
                    let isNotDistantWeapon = true;
                    if(part.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        isNotDistantWeapon = value.attributes.maxRange === 0;
                    }
                    return isNotDistantWeapon;
                });
                break;
            }
        }

        let index = 0;
        let equipmentID = 0;
        if (filtered.length > 0) {
            index = Math.floor(Math.random() * filtered.length);
            equipmentID = filtered[index].id;
        }

        genes[idx] = equipmentID;
        const equipment: Equipment =  partMasterData.find(value => value.id === equipmentID) || defaultEquipment;

        if (part.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
            selectedWeapon =  equipment;
        }

        carriedWeight += equipment.weight;
        busyHands += equipment.hands;

        //Recompute the allowedWeight if the equipment is increasing the strength
        allowedWeight = Math.floor((config.data.con + (config.data.str + equipment.attributes.str)) / 2);
    }

    const ind: Individual = {
        id: id,
        genes: genes,
        fitness: 0,
        probability: 0,
        carriedWeight: carriedWeight,
        hands: busyHands
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

export function getPhenotype(ind: Individual, config: Configuration, masterData: MasterDataOutfit): Attributes {
    let modified: Attributes = {...config.data};
    for (let i = 0; i < ind.genes.length; i++) {
        const partOutfit = outfitParts[i].toLowerCase();
        const equipmentID = ind.genes[i];
        const equipment = masterData[partOutfit as keyof MasterDataOutfit].find(value => value.id === equipmentID) || defaultEquipment;
        Object.keys(equipment.attributes).forEach((attr) => {
            modified[attr as keyof Attributes] = modified[attr as keyof Attributes] + equipment.attributes[attr as keyof Attributes];
        });
    }
    return modified;
}

export function evaluateIndividual(ind: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    let evaluated = {...ind};

    // Update configuration with individual
    let modified: Attributes = getPhenotype(ind, config, masterData);

    let otherCharacter: Attributes = {...defaultAttributes};
    otherCharacter.pv = 80;
    otherCharacter.mr = 30;
    otherCharacter.dodge = 30;
    otherCharacter.armor = 5;

    //Warrior offense profile
    otherCharacter.acc = 35;
    otherCharacter.str = 12;
    otherCharacter.dex = 6;

    //Mage offense profile
    otherCharacter.int = 18;
    otherCharacter.rpm = 3;
    otherCharacter.mm = 45;

    let offensiveSimulation: ProbaTree | null = null;
    let defensePhysicalSimulation: ProbaTree | null = null;
    let defenseMagicalSimulation: ProbaTree | null = null;
    let action: Action;
    let coefficients = {
        offensive: 0,
        defensivePhysical: 0,
        defensiveMagical: 0
    };
    switch(config.parameters.optimProfile) {
        case Profile.mage: {
            action = {
                name: "fireball",
                pa: 6,
                pm: 6,
                magicSuccess: modified.int,
                magicResisted: Math.floor(modified.int / 2),
                physicalDamageSuccess: 0,
                criticalBonus: 0,
                isMagic: true,
                isThrowing: false,
                burning: 2,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensive = 3;
            coefficients.defensiveMagical = 0;
            coefficients.defensivePhysical = 0;
           break;
        }
        case Profile.healer: {
            action = {
                name: "healing",
                pa: 6,
                pm: 6,
                magicSuccess: modified.int,
                magicResisted: Math.floor(modified.int / 2),
                physicalDamageSuccess: 0,
                criticalBonus: 0,
                isMagic: true,
                isThrowing: false,
                burning: 0,
                regeneration: 3,
                isHealing: true
            };

            coefficients.offensive = 3;
            coefficients.defensiveMagical = 0;
            coefficients.defensivePhysical = 0;
            break;
        }
        case Profile.archer: {
            //Based on sylvanus arc, 6-10
            action = {
                name: "shoot",
                pa: 6,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.dex + 8,
                criticalBonus: Math.floor(modified.dex / 2),
                isMagic: false,
                isThrowing: true,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensive = 3;
            coefficients.defensiveMagical = 0;
            coefficients.defensivePhysical = 0;
            break;
        }
        case Profile.tank: {
            //Based on long sword, 5-7
            action = {
                name: "hit",
                pa: 6,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.str + 6,
                criticalBonus: modified.dex,
                isMagic: false,
                isThrowing: false,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensive = 1;
            coefficients.defensiveMagical = 1;
            coefficients.defensivePhysical = 1;
            break;
        }
        case Profile.warrior: {
            //Based on long sword, 5-7
            action = {
                name: "hit",
                pa: 6,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.str + 6,
                criticalBonus: modified.dex,
                isMagic: false,
                isThrowing: false,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensive = 3;
            coefficients.defensiveMagical = 1;
            coefficients.defensivePhysical = 1;
            break;
        }
        default: throw Error("optimization profile " + config.parameters.optimProfile + " not defined");
    }

    offensiveSimulation = buildTurns(5, [10, 10, 10, 10, 10], modified, otherCharacter, action);

    //Based on long sword, 5-7
    let physicalAction: Action = {
        name: "hit",
        pa: 6,
        pm: 0,
        magicSuccess: 0,
        magicResisted: 0,
        physicalDamageSuccess: modified.str + 6,
        criticalBonus: modified.dex,
        isMagic: false,
        isThrowing: false,
        burning: 0,
        regeneration: 0,
        isHealing: false
    };
    defensePhysicalSimulation = buildTurns(5, [10, 10, 10, 10, 10], otherCharacter, modified, physicalAction);

    let magicAction: Action = {
        name: "fireball",
        pa: 6,
        pm: 6,
        magicSuccess: modified.int,
        magicResisted: Math.floor(modified.int / 2),
        physicalDamageSuccess: 0,
        criticalBonus: 0,
        isMagic: true,
        isThrowing: false,
        burning: 2,
        regeneration: 0,
        isHealing: false
    };
    defenseMagicalSimulation = buildTurns(5, [10, 10, 10, 10, 10], otherCharacter, modified, magicAction);

    evaluated.fitness = 0;
    evaluated.fitness += coefficients.offensive * computeFitness(offensiveSimulation);
    evaluated.fitness += coefficients.defensivePhysical * (modified.pv - computeFitness(defensePhysicalSimulation));
    evaluated.fitness += coefficients.defensiveMagical * (modified.pv - computeFitness(defenseMagicalSimulation));

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
        carriedWeight: ind.carriedWeight,
        hands: ind.hands
    };

    const phenotype: Attributes = getPhenotype(ind, config, masterData);
    let maxAuthorizedWeight = Math.floor((phenotype.con + phenotype.str) / 2);

    const localizationIndexToMutate = Math.floor(Math.random() * outfitParts.length);
    const partOutfitToMutate = outfitParts[localizationIndexToMutate].toLowerCase();
    let partMasterData = masterData[partOutfitToMutate as keyof MasterDataOutfit];

    const previousEquipment: Equipment = partMasterData.find(value => value.id === mutant.genes[localizationIndexToMutate]) || defaultEquipment;
    let carriedWeight = mutant.carriedWeight - previousEquipment.weight; // remove previous equipment since we are replacing it
    maxAuthorizedWeight = Math.floor((phenotype.con + phenotype.str - previousEquipment.attributes.str) / 2);

    //Could happen if the str bonus is greater than the armor weight
    if (carriedWeight <= maxAuthorizedWeight) {

        // Filter on weight
        let filtered = partMasterData.filter(value => {
            return value.weight <= (config.data.allowedWeight - carriedWeight);
        });

        // Filter on hands
        let busyHands = mutant.hands - previousEquipment.hands; // remove previous equipment since we are replacing it
        filtered = filtered.filter(value => {
            return value.hands <= 2 - busyHands;
        });

        switch(config.parameters.optimProfile) {
            case Profile.mage:
            case Profile.healer: {
                // Require a left hand with at least one attach for a spell
                filtered = filtered.filter(value => {
                    let magicFilter = true;
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.Lefthand].toLowerCase()) {
                        magicFilter = value.attributes.nbSpellAttach > 0;
                    }
                    return magicFilter;
                });

                break;
            }
            case Profile.archer: {
                filtered = filtered.filter(value => {
                    let isSelected = true;
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        // Require a right hand as an arc or a rifle
                        isSelected = value.attributes.isBow === 1 || value.attributes.isRifle === 1;
                    }
                    else if (partOutfitToMutate.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                        // Filter containers depending of the selected weapon
                        const indexRightHand = outfitParts.findIndex(value => value.toLowerCase() === Localization[Localization.RightHand].toLowerCase());
                        const rightHandID = mutant.genes[indexRightHand];
                        const rightHandKey = Localization[Localization.RightHand].toLowerCase() as keyof MasterDataOutfit;
                        const selectRightHand: Equipment | undefined = masterData[rightHandKey].find(value => value.id === rightHandID);

                        if (selectRightHand && selectRightHand.attributes.isBow) {
                            isSelected = value.attributes.isBow === 1;
                        }
                        else if (selectRightHand && selectRightHand.attributes.isRifle) { //rifle
                            isSelected = value.attributes.isRifle === 1;
                        }
                    }
                    return isSelected;
                });
                break;
            }
            case Profile.warrior: {
                // Exclude distant weapon
                filtered = filtered.filter(value => {
                    let isNotDistantWeapon = true;
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        isNotDistantWeapon = value.attributes.maxRange === 0;
                    }
                    return isNotDistantWeapon;
                });
                break;
            }
            case Profile.tank: {
                // Exclude distant weapon
                filtered = filtered.filter(value => {
                    let isNotDistantWeapon = true;
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
                        isNotDistantWeapon = value.attributes.maxRange === 0;
                    }
                    return isNotDistantWeapon;
                });
                break;
            }
        }

        let index = 0;
        let equipmentID = 0;
        if (filtered.length > 0) {
            index = Math.floor(Math.random() * filtered.length);
            equipmentID = filtered[index].id;
        }

        mutant.genes[localizationIndexToMutate] = equipmentID;
        const newEquipment: Equipment =  partMasterData.find(value => value.id === equipmentID) || defaultEquipment;
        mutant.carriedWeight = carriedWeight + newEquipment.weight ;
        mutant.hands = busyHands + newEquipment.hands;
    }
    // else do not modify the individual

    return mutant;
}

export function crossOver(a: Individual, b: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    const child: Individual = {
        genes: Array.from({length: outfitParts.length}, (_, i) => 0),
        fitness: 0,
        probability: 0,
        id: Date.now(),
        carriedWeight: 0,
        hands: 0
    };

    const primaryGenes = a.fitness > b.fitness ? a.genes : b.genes;
    const secondaryGenes = a.fitness > b.fitness ? b.genes : a.genes;

    // Organize data depending of the profile
    let sequence = Array.from(Array(outfitParts.length).keys());
    switch(config.parameters.optimProfile) {
        case Profile.mage:
        case Profile.healer: {
            // Require a left hand with at least one attach for a spell
            let leftHandIdx = outfitParts.findIndex(value => value === "leftHand");
            if (sequence[0] !== leftHandIdx) {
                let sequenceLeftHandIdx = sequence.findIndex(value => value === leftHandIdx);
                let tmp = sequence[0];
                sequence[0] = leftHandIdx;
                sequence[sequenceLeftHandIdx] = tmp;
            }
            break;
        }
        case Profile.archer: {
            // Require a right hand as an arc or a rifle
            let rightHandIdx = outfitParts.findIndex(value => value === "rightHand");
            if (sequence[0] !== rightHandIdx) {
                let sequencerightHandIdx = sequence.findIndex(value => value === rightHandIdx);
                let tmp = sequence[0];
                sequence[0] = rightHandIdx;
                sequence[sequencerightHandIdx] = tmp;
            }
            break;
        }
    }

    const splitIndex = Math.floor(sequence.length * config.parameters.crossoverParentRatio);
    for (let i = 0; i < splitIndex; i++) {
        const idx = sequence[i];
        child.genes[idx] = primaryGenes[idx];     
    }

    // Get carried weight for the current genes
    let carriedWeight = 0;
    let busyHands = 0;
    for (let i = 0; i < child.genes.length; i++) {
        let part = outfitParts[i].toLowerCase();
        let partMasterData = masterData[part as keyof MasterDataOutfit];
        const equipment: Equipment =  partMasterData.find(value => value.id === child.genes[i]) || defaultEquipment;
        carriedWeight += equipment.weight;
        busyHands += equipment.hands;
    }

    //const remainingSecondaryGenes = secondaryGenes.slice(splitIndex);
    for (let i = splitIndex; i < sequence.length; i++) {
        const idx = sequence[i];
        let part = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[part as keyof MasterDataOutfit];

        const primaryEquipment: Equipment =  partMasterData.find(value => value.id === primaryGenes[idx]) || defaultEquipment;
        const secondaryEquipment: Equipment =  partMasterData.find(value => value.id === secondaryGenes[idx]) || defaultEquipment;

        if (secondaryEquipment.weight + carriedWeight <= config.data.allowedWeight
            && secondaryEquipment.hands + busyHands <= 2) {
            // Get secondary equipment if possible
            child.genes[idx] = secondaryGenes[idx];
            carriedWeight += secondaryEquipment.weight;
            busyHands += secondaryEquipment.hands;
        }
        else if (primaryEquipment.weight + carriedWeight <= config.data.allowedWeight
            && primaryEquipment.hands + busyHands <= 2) {
            // Get primary parent otherwise if possible
            child.genes[idx] = primaryGenes[idx];
            carriedWeight += primaryEquipment.weight;
            busyHands += primaryEquipment.hands;
        }
        else {
            // No equipment for this localization
            child.genes[idx] = 0;
        }
    }
    child.carriedWeight = carriedWeight;
    child.hands = busyHands;
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