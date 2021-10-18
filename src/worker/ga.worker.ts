import { MessageIn, MessageOut } from "../common/workerCommunication";
import { Configuration, evaluatePopulation, generatePopulation, Individual, SimuState } from "../common/ga";
import { Equipment } from "../common/kigardModels";

declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

self.addEventListener("message", e => {
    if (!e) return;

    const msg: MessageIn = e.data as MessageIn;
    const prevPopulation = msg.state.population;
    let population: Individual[] = [];

    if (prevPopulation.length === 0) {
        population = generatePopulation(msg.configuration, msg.masterData);
    }
    else {
        population = [...prevPopulation];
    }

    population = evaluatePopulation(population, msg.configuration);

    /*
    configuration: Configuration;
    masterData: Equipment[];
    state: SimuState
    */


    const response: MessageOut = {
        state: {
            isRunning: msg.state.isRunning,
            bestSolution: msg.state.bestSolution,
            population: population
        }
    };

    postMessage(response);
});