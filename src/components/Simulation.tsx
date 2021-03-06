import { useCallback, useEffect, useState } from "react";
import { createEmptyIndividual, GAParameters, Individual, SimuState } from "../common/ga";
import { Attributes, MasterDataOutfit, Outfit } from "../common/kigardModels";
import { MessageIn, MessageOut } from "../common/workerCommunication";
import MyWorker from '../worker/ga.worker';

export interface SimulationProps {
  character: Attributes,
  outfit: Outfit,
  parameters: GAParameters,
  masterData: MasterDataOutfit;
  onHasStarted: () => void,
  onHasStopped: () => void
  onHasNewIteration: (ind: Individual) => void;
}

export function Simulation({character, outfit, parameters, masterData, onHasStarted, onHasStopped, onHasNewIteration}: SimulationProps) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [state, setState] = useState<SimuState>({
    isRunning: false,
    bestSolution: createEmptyIndividual(),
    population: [],
    generation: 0
  });

  const handleResponse = useCallback((e: MessageEvent<any>) => {
    const response: MessageOut = e.data as MessageOut;
    setState(response.state)
    console.log("coming out");
    onHasNewIteration && onHasNewIteration(response.state.bestSolution);
  }, [onHasNewIteration]);

  const handleStart = function(): void {
    onHasStarted && onHasStarted();
    const newWorker = new MyWorker();
    setWorker(newWorker);
    setState({...state, isRunning: true});
    console.log("Start !");
  };

  const handleStop = function(): void {
    // Reset simulation
    console.log("Stop !");
    if (worker) {
      console.log("Reset worker !");
      worker.terminate();
      setState({
        isRunning: false,
        bestSolution: createEmptyIndividual(),
        population: [],
        generation: 0
      });

      onHasStopped && onHasStopped();
    }
  };

  useEffect(() => {
    if (worker) {
      console.log("Add listener to worker");
      worker.addEventListener('message', handleResponse);
    }
  }, [worker, handleResponse]);

  useEffect(() => {
    if (!worker || !state.isRunning) {
      console.log("return since not configured");
      return;
    }

    //Send next message
    const message: MessageIn = {
        configuration: {
          data: character,
          currentOutfit: outfit,
          parameters: parameters
        },
        masterData: masterData,
        state: {...state}
    };

    worker.postMessage(message);
  }, [worker, state, character, outfit, parameters, masterData])

  return (
    <div>
      <button onClick={handleStart} disabled={state.isRunning}>D??marrer</button>
      <button onClick={handleStop} disabled={!state.isRunning}>Stopper </button>
    </div>
  )
}