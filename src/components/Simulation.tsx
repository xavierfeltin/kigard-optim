import { useCallback, useEffect, useState } from "react";
import { Configuration, SimuState } from "../common/ga";
import { defaultEquipment, Equipment } from "../common/kigardModels";
import { MessageIn, MessageOut } from "../common/workerCommunication";
import MyWorker from '../worker/ga.worker';

export interface SimulationProps {
  configuration: Configuration,
  masterData: Equipment[];
  onHasStarted: () => void,
  onHasStopped: () => void
  onHasNewIteration: (equipment: Equipment) => void;
}

export function Simulation({configuration, masterData, onHasStarted, onHasStopped, onHasNewIteration}: SimulationProps) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [state, setState] = useState<SimuState>({
    isRunning: false,
    bestSolution: {...defaultEquipment},
    population: []
  });

  const handleResponse = useCallback((e: MessageEvent<any>) => {
    const response: MessageOut = e.data as MessageOut;
    setState(response.state)
    console.log("coming out");
    onHasNewIteration(response.state.bestSolution);
  }, []);

  const handleStart = function(): void {
    onHasStarted();
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
        bestSolution: {...defaultEquipment},
        population: []
      });
      setState({...state, isRunning: false});

      onHasStopped();
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
        configuration: configuration,
        masterData: masterData,
        state: {...state}
    };

    worker.postMessage(message);
  }, [worker, state, configuration, masterData])

  return (
    <div>
      <button onClick={handleStart} disabled={state.isRunning}>Démarrer</button>
      <button onClick={handleStop} disabled={!state.isRunning}>Stopper </button>
    </div>
  )
}