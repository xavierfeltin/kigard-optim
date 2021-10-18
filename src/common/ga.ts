import { Attributes, Equipment } from "./kigardModels";

export interface Configuration {
    data: Attributes;
    populationSize: number;
}

export interface SimuState {
    isRunning: boolean;
    bestSolution: Equipment;
    population: Individual[];
}
export interface Individual {
    id: number;
    genes: number[];
    fitness: number;
    probability: number;
    phenotype: Equipment[];
}

export function generatePopulation(config: Configuration, masterData: Equipment[]): Individual[] {
    let population: Individual[] = [];

    for(let i = 0; i < config.populationSize; i++) {
        const equipmentIdx = Math.floor(Math.random() * masterData.length);
        const indiv: Individual = {
            id: population.length,
            genes: [equipmentIdx],
            fitness: NaN,
            probability: NaN,
            phenotype: [masterData[equipmentIdx]]
        };
        population.push(indiv);
    }

    return population;
}

export function evaluatePopulation(population: Individual[], config: Configuration) {
    let evaluated = [...population];
    for(let indiv of population) {

        // Update configuration with individual
        for (let idx of indiv.genes) {
            let modifiedAttributes: Attributes = {...config.data};
            const equipment: Equipment = indiv.phenotype[idx];
            Object.keys(equipment.attributes).forEach((attr) => {
                modifiedAttributes[attr as keyof Attributes] = config.data[attr as keyof Attributes] + equipment.attributes[attr as keyof Attributes]
            })
        }

        // Evaluate the individual
    }
    return evaluated;
}