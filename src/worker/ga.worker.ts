import { MessageIn, MessageOut } from "../common/workerCommunication";
import { convertFitnessIntoProbabilities, evaluatePopulation, generateNewGeneration, generatePopulation, Individual, sortDescByFitness } from "../common/ga";
import { defaultEquipment, MasterDataOutfit, outfitParts } from "../common/kigardModels";

declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

self.addEventListener("message", e => {
    if (!e) return;

    const msg: MessageIn = e.data as MessageIn;
    const prevPopulation = msg.state.population;
    let population: Individual[] = [];

    if (prevPopulation.length === 0) {
        population = generatePopulation(msg.configuration, msg.masterData);
        population = evaluatePopulation(population, msg.configuration, msg.masterData);
        population = convertFitnessIntoProbabilities(population);
    }
    else {
        population = [...prevPopulation];
        // already evaluated in previous generation
    }

    let nextPopulation = generateNewGeneration(population, msg.configuration, msg.masterData);
    nextPopulation = evaluatePopulation(nextPopulation, msg.configuration, msg.masterData);
    nextPopulation = convertFitnessIntoProbabilities(nextPopulation);
    nextPopulation = sortDescByFitness(nextPopulation);

    let bestSolution = msg.state.bestSolution;

    let names = "";
    msg.state.bestSolution.genes.forEach((equipmentID, outfitPartID) => {
        const partIndex = outfitParts[outfitPartID].toLowerCase();
        const partOutfit = msg.masterData[partIndex as keyof MasterDataOutfit];
        const equipment = partOutfit.find(value => value.id === equipmentID) || defaultEquipment;
        names = names + ", " + equipment.name;
    });

    if (msg.state.bestSolution.fitness < nextPopulation[0].fitness) {
        bestSolution = nextPopulation[0];
        console.log("change best solution: ");
        console.log(nextPopulation[0]);

        let names = "";
        msg.state.bestSolution.genes.forEach((equipmentID, outfitPartID) => {
            const partIndex = outfitParts[outfitPartID].toLowerCase();
            const partOutfit = msg.masterData[partIndex as keyof MasterDataOutfit];
            const equipment = partOutfit.find(value => value.id === equipmentID) || defaultEquipment;
            names = names + ", " + equipment.name;
        });
    }

    const response: MessageOut = {
        state: {
            isRunning: msg.state.isRunning,
            bestSolution: bestSolution,
            population: nextPopulation,
            generation: msg.state.generation + 1
        }
    };

    postMessage(response);
});