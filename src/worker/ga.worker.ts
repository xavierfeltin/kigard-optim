import { MessageIn, MessageOut } from "../common/workerCommunication";

declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

self.addEventListener("message", e => {
    if (!e) return;
    
    const msg: MessageIn = e.data as MessageIn;

    const response: MessageOut = {
        state: {
            isRunning: msg.state.isRunning,
            bestSolution: msg.state.bestSolution,
            population: msg.state.population
        }    
    };

    postMessage(response);
});