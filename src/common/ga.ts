import { Action, Attributes, buildTurns, defaultAttributes, defaultEquipment, Equipment, Localization, MasterDataOutfit, Outfit, outfitParts, Profile } from "./kigardModels";
import { profileAdvancedAssassin, profileAdvancedMage, profileAdvancedWarrior, profileBeginnerAssassin, profileBeginnerMage, profileBeginnerWarrior, profileIntermediateAssassin, profileIntermediateMage, profileIntermediateWarrior } from "./kigardProfiles";
import { ProbaTree, shuffle } from "./math";

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
    optimSimuTurns: number[];
}
export interface Configuration {
    data: Attributes;
    currentOutfit: Outfit;
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
    fitness: Fitness;
    probability: number;
    carriedWeight: number,
    hands: number;
    phenotype: Attributes;
}

export interface Fitness {
    fitness: number;

    offenseBeginnerWarrior: number;
    offenseIntermediateWarrior: number;
    offenseAdvancedWarrior: number;
    offenseBeginnerAssassin: number;
    offenseIntermediateAssassin: number;
    offenseAdvancedAssassin: number;
    offenseBeginnerMage: number;
    offenseIntermediateMage: number;
    offenseAdvancedMage: number;

    defenseBeginnerWarrior: number;
    defenseIntermediateWarrior: number;
    defenseAdvancedWarrior: number;
    defenseBeginnerAssassin: number;
    defenseIntermediateAssassin: number;
    defenseAdvancedAssassin: number;
    defenseBeginnerMage: number;
    defenseIntermediateMage: number;
    defenseAdvancedMage: number;

    /*
    healingBeginnerMage: number;
    healingIntermediateMage: number;
    healingAdvancedMage: number;
    */
}

export function createEmptyIndividual(): Individual {
    const ind: Individual = {
        id: Date.now(),
        genes: [],
        fitness: {
            fitness: 0,
            offenseBeginnerWarrior: 0,
            offenseIntermediateWarrior: 0,
            offenseAdvancedWarrior: 0,
            offenseBeginnerAssassin: 0,
            offenseIntermediateAssassin: 0,
            offenseAdvancedAssassin: 0,
            offenseBeginnerMage: 0,
            offenseIntermediateMage: 0,
            offenseAdvancedMage: 0,
            defenseBeginnerWarrior: 0,
            defenseIntermediateWarrior: 0,
            defenseAdvancedWarrior: 0,
            defenseBeginnerAssassin: 0,
            defenseIntermediateAssassin: 0,
            defenseAdvancedAssassin: 0,
            defenseBeginnerMage: 0,
            defenseIntermediateMage: 0,
            defenseAdvancedMage: 0
        },
        probability: 0,
        carriedWeight: 0,
        hands: 0,
        phenotype: {...defaultAttributes}
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

    // Initialize with preselected equipment
    for (let idx of sequence) {
        let part = outfitParts[idx];
        let preSelectedEquipment = config.currentOutfit[part as keyof Outfit];
        if (preSelectedEquipment.id !== 0) {
            const equipmentID = preSelectedEquipment.id;
            genes[idx] = equipmentID;
            carriedWeight += preSelectedEquipment.weight;
            busyHands += preSelectedEquipment.hands;
        }
    }

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

        if (genes[idx] === 0) {
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

                    // no container
                    filtered = filtered.filter(value => {
                        if(part.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                            return value.id === 0;
                        }
                        return true;
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

                    filtered = filtered.filter(value => {
                        if(part.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                            return value.id === 0;
                        }
                        return true;
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

                    // no container
                    filtered = filtered.filter(value => {
                        if(part.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                            return value.id === 0;
                        }
                        return true;
                    });
                    break;
                }
            }

            let index = 0;
            let equipmentID = 0;
            if (filtered.length > 0) {
                index = Math.floor(Math.random() * filtered.length);
                equipmentID = filtered[index].id;
                carriedWeight += filtered[index].weight;
                busyHands += filtered[index].hands;
            }
            genes[idx] = equipmentID;
        }
        // else equipment has been preselected

        const equipment: Equipment =  partMasterData.find(value => value.id === genes[idx]) || defaultEquipment;

        if (part.toLowerCase() === Localization[Localization.RightHand].toLowerCase()) {
            selectedWeapon =  equipment;
        }

        //Recompute the allowedWeight if the equipment is increasing the strength
        allowedWeight = Math.floor((config.data.con + (config.data.str + equipment.attributes.str)) / 2);
    }

    const ind: Individual = {
        id: id,
        genes: genes,
        fitness: {
            fitness: 0,
            offenseBeginnerWarrior: 0,
            offenseIntermediateWarrior: 0,
            offenseAdvancedWarrior: 0,
            offenseBeginnerAssassin: 0,
            offenseIntermediateAssassin: 0,
            offenseAdvancedAssassin: 0,
            offenseBeginnerMage: 0,
            offenseIntermediateMage: 0,
            offenseAdvancedMage: 0,
            defenseBeginnerWarrior: 0,
            defenseIntermediateWarrior: 0,
            defenseAdvancedWarrior: 0,
            defenseBeginnerAssassin: 0,
            defenseIntermediateAssassin: 0,
            defenseAdvancedAssassin: 0,
            defenseBeginnerMage: 0,
            defenseIntermediateMage: 0,
            defenseAdvancedMage: 0
        },
        probability: 0,
        carriedWeight: carriedWeight,
        hands: busyHands,
        phenotype: {...defaultAttributes}
    };

    if (ind.genes.findIndex(val => val === null) !== -1) {
        throw new Error("Contains null value when creating individual");
    }
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

export function getEquipment(ind: Individual, part: Localization, masterData: MasterDataOutfit): Equipment | undefined {
    const masterWeapons = masterData[Localization[part].toLowerCase() as keyof MasterDataOutfit];
    const idx = outfitParts.findIndex(val => val.toLowerCase() === Localization[part].toLowerCase());
    const equipmentID = ind.genes[idx];
    const equipment = masterWeapons.find(val => val.id === equipmentID);
    return equipment;
}

export function evaluateIndividual(ind: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    let evaluated = {...ind};
    evaluated.genes = [...ind.genes];
    evaluated.fitness = {...ind.fitness};

    // Update configuration with individual
    let modified: Attributes = getPhenotype(ind, config, masterData);
    let defaultWeapon = {...defaultEquipment};
    defaultWeapon.pa = 6;
    let weapon: Equipment = getEquipment(ind, Localization.RightHand, masterData) || defaultWeapon;
    let avgWeaponDamage = (modified.minDamage + modified.maxDamage) / 2; // some armor gives damage bonus
    if (weapon.hands === 2) {
        avgWeaponDamage += 1;
    }

    const fights: number[][] = [];
    fights.push(config.parameters.optimSimuTurns);

    let action: Action;
    let coefficients = {
        offensiveWarrior: 0,
        offensiveAssassin: 0,
        offensiveMage: 0,
        defensiveWarrior: 0,
        defensiveAssassin: 0,
        defensiveMage: 0
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

            coefficients.offensiveWarrior = 3;
            coefficients.offensiveAssassin = 3;
            coefficients.offensiveMage = 3;
            coefficients.defensiveWarrior = 1;
            coefficients.defensiveAssassin = 1;
            coefficients.defensiveMage = 0;
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

            coefficients.offensiveWarrior = 3;
            coefficients.offensiveAssassin = 3;
            coefficients.offensiveMage = 3;
            coefficients.defensiveWarrior = 1;
            coefficients.defensiveAssassin = 1;
            coefficients.defensiveMage = 0;
            break;
        }
        case Profile.archer: {
            action = {
                name: weapon.name,
                pa: weapon.pa,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.dex + avgWeaponDamage,
                criticalBonus: Math.floor(modified.dex / 2),
                isMagic: false,
                isThrowing: true,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensiveWarrior = 3;
            coefficients.offensiveAssassin = 3;
            coefficients.offensiveMage = 3;
            coefficients.defensiveWarrior = 1;
            coefficients.defensiveAssassin = 1;
            coefficients.defensiveMage = 0;
            break;
        }
        case Profile.tank: {
            action = {
                name: weapon.name,
                pa: weapon.pa,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.str + avgWeaponDamage,
                criticalBonus: modified.dex,
                isMagic: false,
                isThrowing: false,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensiveWarrior = 0;
            coefficients.offensiveAssassin = 0;
            coefficients.offensiveMage = 0;
            coefficients.defensiveWarrior = 5;
            coefficients.defensiveAssassin = 5;
            coefficients.defensiveMage = 2;
            break;
        }
        case Profile.warrior: {
            action = {
                name: weapon.name,
                pa: weapon.pa,
                pm: 0,
                magicSuccess: 0,
                magicResisted: 0,
                physicalDamageSuccess: modified.str + avgWeaponDamage,
                criticalBonus: modified.dex,
                isMagic: false,
                isThrowing: false,
                burning: 0,
                regeneration: 0,
                isHealing: false
            };

            coefficients.offensiveWarrior = 5;
            coefficients.offensiveAssassin = 5;
            coefficients.offensiveMage = 2;
            coefficients.defensiveWarrior = 1;
            coefficients.defensiveAssassin = 1;
            coefficients.defensiveMage = 1;
            break;
        }
        default: throw Error("optimization profile " + config.parameters.optimProfile + " not defined");
    }

    let beginnerWarriorOffenseSimulation = buildTurns(fights[0], modified, profileBeginnerWarrior, action);
    let intermediateWarriorOffenseSimulation = buildTurns(fights[0], modified, profileIntermediateWarrior, action);
    let advancedWarriorOffenseSimulation = buildTurns(fights[0], modified, profileAdvancedWarrior, action);

    let beginnerAssassinOffenseSimulation = buildTurns(fights[0], modified, profileBeginnerAssassin, action);
    let intermediateAssassinOffenseSimulation = buildTurns(fights[0], modified, profileIntermediateAssassin, action);
    let advancedAssassinOffenseSimulation = buildTurns(fights[0], modified, profileAdvancedAssassin, action);

    let beginnerMageOffenseSimulation = buildTurns(fights[0], modified, profileBeginnerMage, action);
    let intermediateMageOffenseSimulation = buildTurns(fights[0], modified, profileIntermediateMage, action);
    let advancedMageOffenseSimulation = buildTurns(fights[0], modified, profileAdvancedMage, action);


    //Based on long sword, 5-7
    let opponentAction: Action = {
        name: "agression",
        pa: 0,
        pm: 0,
        magicSuccess: 0,
        magicResisted: 0,
        physicalDamageSuccess: modified.str,
        criticalBonus: modified.dex,
        isMagic: false,
        isThrowing: false,
        burning: 0,
        regeneration: 0,
        isHealing: false
    };

    opponentAction.pa = 6; //short sword
    opponentAction.physicalDamageSuccess = profileBeginnerWarrior.str + (profileBeginnerWarrior.minDamage + profileBeginnerWarrior.maxDamage) / 2;
    opponentAction.criticalBonus = profileBeginnerWarrior.dex;
    let beginnerWarriorDefenseSimulation = buildTurns(fights[0], profileBeginnerWarrior, modified, opponentAction);

    opponentAction.pa = 6; // fleau
    opponentAction.physicalDamageSuccess = profileIntermediateWarrior.str + (profileIntermediateWarrior.minDamage + profileIntermediateWarrior.maxDamage) / 2;
    opponentAction.criticalBonus = profileIntermediateWarrior.dex;
    let intermediateWarriorDefenseSimulation = buildTurns(fights[0], profileIntermediateWarrior, modified, opponentAction);

    opponentAction.pa = 8; // lance
    opponentAction.physicalDamageSuccess = profileAdvancedWarrior.str + (profileAdvancedWarrior.minDamage + profileAdvancedWarrior.maxDamage) / 2;
    opponentAction.criticalBonus = profileAdvancedWarrior.dex;
    let advancedWarriorDefenseSimulation = buildTurns(fights[0], profileAdvancedWarrior, modified, opponentAction);

    opponentAction.pa = 6; // poignard
    opponentAction.physicalDamageSuccess = profileBeginnerAssassin.str + (profileBeginnerAssassin.minDamage + profileBeginnerAssassin.maxDamage) / 2;
    opponentAction.criticalBonus = profileBeginnerAssassin.dex;
    let beginnerAssassinDefenseSimulation = buildTurns(fights[0], profileBeginnerAssassin, modified, opponentAction);

    opponentAction.pa = 6; // poignard
    opponentAction.physicalDamageSuccess = profileIntermediateAssassin.str + (profileIntermediateAssassin.minDamage + profileIntermediateAssassin.maxDamage) / 2;
    opponentAction.criticalBonus = profileIntermediateAssassin.dex;
    let intermediateAssassinDefenseSimulation = buildTurns(fights[0], profileIntermediateAssassin, modified, opponentAction);

    opponentAction.pa = 6; // poignard
    opponentAction.physicalDamageSuccess = profileAdvancedAssassin.str + (profileAdvancedAssassin.minDamage + profileAdvancedAssassin.maxDamage) / 2;
    opponentAction.criticalBonus = profileAdvancedAssassin.dex;
    let advancedAssassinDefenseSimulation = buildTurns(fights[0], profileAdvancedAssassin, modified, opponentAction);

    opponentAction.pa = 6; // fireball
    opponentAction.pm = 6;
    opponentAction.isMagic = true;
    opponentAction.magicSuccess = profileBeginnerMage.int;
    opponentAction.magicResisted = Math.floor(profileBeginnerMage.int / 2);
    let beginnerMageDefenseSimulation = buildTurns(fights[0], profileBeginnerMage, modified, opponentAction);

    opponentAction.magicSuccess = profileIntermediateMage.int;
    opponentAction.magicResisted = Math.floor(profileIntermediateMage.int / 2);
    let intermediateMageDefenseSimulation = buildTurns(fights[0], profileIntermediateMage, modified, opponentAction);

    opponentAction.magicSuccess = profileAdvancedMage.int;
    opponentAction.magicResisted = Math.floor(profileAdvancedMage.int / 2);
    let advancedMageDefenseSimulation = buildTurns(fights[0], profileAdvancedMage, modified, opponentAction);

    const f: Fitness = {
        fitness: 0,
        offenseBeginnerWarrior: computeExpectedValue(beginnerWarriorOffenseSimulation),
        offenseIntermediateWarrior: computeExpectedValue(intermediateWarriorOffenseSimulation),
        offenseAdvancedWarrior: computeExpectedValue(advancedWarriorOffenseSimulation),
        offenseBeginnerAssassin: computeExpectedValue(beginnerAssassinOffenseSimulation),
        offenseIntermediateAssassin: computeExpectedValue(intermediateAssassinOffenseSimulation),
        offenseAdvancedAssassin: computeExpectedValue(advancedAssassinOffenseSimulation),
        offenseBeginnerMage: computeExpectedValue(beginnerMageOffenseSimulation),
        offenseIntermediateMage: computeExpectedValue(intermediateMageOffenseSimulation),
        offenseAdvancedMage: computeExpectedValue(advancedMageOffenseSimulation),

        defenseBeginnerWarrior: computeExpectedValue(beginnerWarriorDefenseSimulation),
        defenseIntermediateWarrior: computeExpectedValue(intermediateWarriorDefenseSimulation),
        defenseAdvancedWarrior: computeExpectedValue(advancedWarriorDefenseSimulation),
        defenseBeginnerAssassin: computeExpectedValue(beginnerAssassinDefenseSimulation),
        defenseIntermediateAssassin: computeExpectedValue(intermediateAssassinDefenseSimulation),
        defenseAdvancedAssassin: computeExpectedValue(advancedAssassinDefenseSimulation),
        defenseBeginnerMage: computeExpectedValue(beginnerMageDefenseSimulation),
        defenseIntermediateMage: computeExpectedValue(intermediateMageDefenseSimulation),
        defenseAdvancedMage: computeExpectedValue(advancedMageDefenseSimulation)
    };

    f.fitness = coefficients.offensiveWarrior * (
        computeFitness(beginnerWarriorOffenseSimulation, false)
        + 2 * computeFitness(intermediateWarriorOffenseSimulation, false)
        + 3 * computeFitness(advancedWarriorOffenseSimulation, false)) / 3;
    f.fitness += coefficients.offensiveAssassin * (
        computeFitness(beginnerAssassinOffenseSimulation, false)
        + 2 * computeFitness(intermediateAssassinOffenseSimulation, false)
        + 3 * computeFitness(advancedAssassinOffenseSimulation, false)) / 3;
    f.fitness += coefficients.offensiveMage * (
        computeFitness(beginnerMageOffenseSimulation, false)
        + 2 * computeFitness(intermediateMageOffenseSimulation, false)
        + 3 * computeFitness(advancedMageOffenseSimulation, false)) / 3;

    f.fitness += coefficients.defensiveWarrior * (
        computeFitness(beginnerWarriorDefenseSimulation, true)
        + 2 * computeFitness(intermediateWarriorDefenseSimulation, true)
        + 3 * computeFitness(advancedWarriorDefenseSimulation, true)) / 3;
    f.fitness += coefficients.defensiveAssassin * (
        computeFitness(beginnerAssassinDefenseSimulation, true)
        + 2 * computeFitness(intermediateAssassinDefenseSimulation, true)
        + 3 * computeFitness(advancedAssassinDefenseSimulation, true)) / 3;
    f.fitness += coefficients.defensiveMage * (
        computeFitness(beginnerMageDefenseSimulation, true)
        + 2 * computeFitness(intermediateMageDefenseSimulation, true)
        + 3 * computeFitness(advancedMageDefenseSimulation, true)) / 3;

    f.fitness /=  (coefficients.offensiveWarrior + coefficients.offensiveAssassin + coefficients.offensiveMage
        + coefficients.defensiveWarrior + coefficients.defensiveAssassin + coefficients.defensiveMage);

    evaluated.fitness = f;
    evaluated.phenotype = modified;

    return evaluated;
}

function computeExpectedValue(simulation: ProbaTree): number {
    const expectedValue = simulation.getTreeExpectedValue();
    return expectedValue;
}

function computeFitness(simulation: ProbaTree, isDefense: boolean): number {
    const depthCoefficient = isDefense ? (Math.pow(2,8) - simulation.getNbBranches()) : simulation.getNbBranches();
    const expectedValue = simulation.getTreeExpectedValue() / depthCoefficient;
    return expectedValue;
}

export function convertFitnessIntoProbabilities(population: Individual[]): Individual[] {
    let sumFit = 0.0;
    let scores = [];
    let populationWithProba = [...population];

    for (let ind of population) {
        const fitness = ind.fitness.fitness * ind.fitness.fitness;
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
        return b.fitness.fitness - a.fitness.fitness;
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
    let pool: Individual[] = [];
    for (let i = 0; i < poolSize; i++) {
        const candidate = pickParentForTournament(population, poolSize);
        pool.push(candidate);
    }

    pool = convertFitnessIntoProbabilities(pool);
    pool = sortDescByProbability(pool);
    return pool;
}

export function pickParentForTournament(population: Individual[], tournamentSize: number): Individual {
    let best: Individual = createEmptyIndividual();
    for (let i = 0; i < tournamentSize; i++) {
        const index = Math.floor(Math.random() * population.length);
        const candidate = population[index];
        if (best.fitness.fitness === 0 || candidate.fitness.fitness > best.fitness.fitness) {
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
        fitness: {
            fitness: 0,
            offenseBeginnerWarrior: 0,
            offenseIntermediateWarrior: 0,
            offenseAdvancedWarrior: 0,
            offenseBeginnerAssassin: 0,
            offenseIntermediateAssassin: 0,
            offenseAdvancedAssassin: 0,
            offenseBeginnerMage: 0,
            offenseIntermediateMage: 0,
            offenseAdvancedMage: 0,
            defenseBeginnerWarrior: 0,
            defenseIntermediateWarrior: 0,
            defenseAdvancedWarrior: 0,
            defenseBeginnerAssassin: 0,
            defenseIntermediateAssassin: 0,
            defenseAdvancedAssassin: 0,
            defenseBeginnerMage: 0,
            defenseIntermediateMage: 0,
            defenseAdvancedMage: 0
        },
        probability: 0,
        carriedWeight: ind.carriedWeight,
        hands: ind.hands,
        phenotype: {...defaultAttributes}
    };

    const phenotype: Attributes = getPhenotype(ind, config, masterData);
    let maxAuthorizedWeight = Math.floor((phenotype.con + phenotype.str) / 2);

    // Do not mutate preselected equipment
    const outfitPartsMutable = outfitParts.filter((value: string) => config.currentOutfit[value as keyof Outfit].id === 0);
    const localizationIndexMutable = Math.floor(Math.random() * outfitPartsMutable.length);
    const partOutfitToMutate = outfitPartsMutable[localizationIndexMutable].toLowerCase();

    // Map localization index into the whole outfit to match the genes size
    const localizationIndexToMutate = outfitParts.findIndex((value: string) => value.toLowerCase() === partOutfitToMutate);

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

                // no container
                filtered = filtered.filter(value => {
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                        return value.id === 0;
                    }
                    return true;
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

                // no container
                filtered = filtered.filter(value => {
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                        return value.id === 0;
                    }
                    return true;
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

                // no container
                filtered = filtered.filter(value => {
                    if(partOutfitToMutate.toLowerCase() === Localization[Localization.Container].toLowerCase()) {
                        return value.id === 0;
                    }
                    return true;
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

    if (mutant.genes.findIndex(val => val === null) !== -1) {
        throw new Error("Contains null value when mutating");
    }

    return mutant;
}

export function crossOver(a: Individual, b: Individual, config: Configuration, masterData: MasterDataOutfit): Individual {
    const child: Individual = {
        genes: Array.from({length: outfitParts.length}, (_, i) => 0),
        fitness: {
            fitness: 0,
            offenseBeginnerWarrior: 0,
            offenseIntermediateWarrior: 0,
            offenseAdvancedWarrior: 0,
            offenseBeginnerAssassin: 0,
            offenseIntermediateAssassin: 0,
            offenseAdvancedAssassin: 0,
            offenseBeginnerMage: 0,
            offenseIntermediateMage: 0,
            offenseAdvancedMage: 0,
            defenseBeginnerWarrior: 0,
            defenseIntermediateWarrior: 0,
            defenseAdvancedWarrior: 0,
            defenseBeginnerAssassin: 0,
            defenseIntermediateAssassin: 0,
            defenseAdvancedAssassin: 0,
            defenseBeginnerMage: 0,
            defenseIntermediateMage: 0,
            defenseAdvancedMage: 0
        },
        probability: 0,
        id: Date.now(),
        carriedWeight: 0,
        hands: 0,
        phenotype: {...defaultAttributes}
    };

    const primaryGenes = a.fitness.fitness > b.fitness.fitness ? a.genes : b.genes;
    const secondaryGenes = a.fitness.fitness > b.fitness.fitness ? b.genes : a.genes;

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

    // Force genes of preselected equipment to be taken into account of the weight
    for (let idx of sequence) {
        let part = outfitParts[idx];
        let preSelectedEquipment = config.currentOutfit[part as keyof Outfit];
        if (preSelectedEquipment.id !== 0) {
            const equipmentID = preSelectedEquipment.id;
            child.genes[idx] = equipmentID;
        }
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

    let phenotype = getPhenotype(child, config, masterData);
    let maxAllowedWeight = Math.floor((phenotype.con + phenotype.str) / 2);

    //Get genes from the first parent
    const splitIndex = Math.floor(sequence.length * config.parameters.crossoverParentRatio);
    for (let i = 0; i < splitIndex; i++) {
        const idx = sequence[i];
        let part = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[part as keyof MasterDataOutfit];
        const primaryEquipment: Equipment =  partMasterData.find(value => value.id === primaryGenes[idx]) || defaultEquipment;

        if (child.genes[idx] === 0 && primaryEquipment.weight + carriedWeight <= maxAllowedWeight
            && primaryEquipment.hands + busyHands <= 2) {
            child.genes[idx] = primaryGenes[idx];
            carriedWeight += primaryEquipment.weight;
            busyHands += primaryEquipment.hands;

            phenotype = getPhenotype(child, config, masterData);
            maxAllowedWeight = Math.floor((phenotype.con + phenotype.str) / 2);
        }
    }

    for (let i = splitIndex; i < sequence.length; i++) {
        const idx = sequence[i];
        let part = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[part as keyof MasterDataOutfit];

        const primaryEquipment: Equipment =  partMasterData.find(value => value.id === primaryGenes[idx]) || defaultEquipment;
        const secondaryEquipment: Equipment =  partMasterData.find(value => value.id === secondaryGenes[idx]) || defaultEquipment;

        if (child.genes[idx] === 0 && secondaryEquipment.weight + carriedWeight <= maxAllowedWeight
            && secondaryEquipment.hands + busyHands <= 2) {
            // Get secondary equipment if possible
            child.genes[idx] = secondaryGenes[idx];
            carriedWeight += secondaryEquipment.weight;
            busyHands += secondaryEquipment.hands;
        }
        else if (child.genes[idx] === 0 && primaryEquipment.weight + carriedWeight <= maxAllowedWeight
            && primaryEquipment.hands + busyHands <= 2) {
            // Get primary parent otherwise if possible
            child.genes[idx] = primaryGenes[idx];
            carriedWeight += primaryEquipment.weight;
            busyHands += primaryEquipment.hands;
        }
        else if (child.genes[idx] === 0) {
            // No equipment for this localization
            child.genes[idx] = 0;
        }

        phenotype = getPhenotype(child, config, masterData);
        maxAllowedWeight = Math.floor((phenotype.con + phenotype.str) / 2);
    }
    child.carriedWeight = carriedWeight;
    child.hands = busyHands;

    if (child.genes.findIndex(val => val === null) !== -1) {
        throw new Error("Contains null value when crossing over");
    }

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
                parentA = pickParent(tournamentPool);
                parentB = pickParent(tournamentPool);
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