import { MessageIn, MessageOut } from "../common/workerCommunication";
import { convertFitnessIntoProbabilities, evaluatePopulation, generateNewGeneration, generatePopulation, Individual, sortDescByFitness } from "../common/ga";

declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

self.addEventListener("message", e => {
    if (!e) return;

    const msg: MessageIn = e.data as MessageIn;
    const prevPopulation = msg.state.population;
    let population: Individual[] = [];

    if (prevPopulation.length === 0) {
        population = generatePopulation(msg.configuration, msg.masterData);
        population = evaluatePopulation(population, msg.configuration);
        population = convertFitnessIntoProbabilities(population);
    }
    else {
        population = [...prevPopulation];
        // already evaluated in previous generation
    }

    let nextPopulation = generateNewGeneration(population, msg.configuration, msg.masterData);
    nextPopulation = evaluatePopulation(nextPopulation, msg.configuration);
    nextPopulation = convertFitnessIntoProbabilities(nextPopulation);
    nextPopulation = sortDescByFitness(nextPopulation);

    const bestIndividual = nextPopulation[0];
    const response: MessageOut = {
        state: {
            isRunning: msg.state.isRunning,
            bestSolution: bestIndividual,
            population: nextPopulation,
            generation: msg.state.generation + 1
        }
    };

    postMessage(response);
});