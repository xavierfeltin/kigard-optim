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
        population = evaluatePopulation(population, msg.configuration, msg.masterData);
        population = convertFitnessIntoProbabilities(population);
    }
    else {
        population = [...prevPopulation];
        // already evaluated in previous generation
    }

    debugger;

    let nextPopulation = generateNewGeneration(population, msg.configuration, msg.masterData);
    nextPopulation = evaluatePopulation(nextPopulation, msg.configuration, msg.masterData);
    nextPopulation = convertFitnessIntoProbabilities(nextPopulation);
    nextPopulation = sortDescByFitness(nextPopulation);
    console.log(nextPopulation);

    const response: MessageOut = {
        state: {
            isRunning: msg.state.isRunning,
            bestSolution: msg.state.bestSolution.fitness < nextPopulation[0].fitness ? nextPopulation[0] : msg.state.bestSolution,
            population: nextPopulation,
            generation: msg.state.generation + 1
        }
    };

    postMessage(response);
});