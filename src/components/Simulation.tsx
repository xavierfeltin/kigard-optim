import { useCallback, useEffect, useState } from "react";
import { createEmptyIndividual, GAParameters, Individual, SimuState } from "../common/ga";
import { Attributes, MasterDataOutfit } from "../common/kigardModels";
import { MessageIn, MessageOut } from "../common/workerCommunication";
import MyWorker from '../worker/ga.worker';

export interface SimulationProps {
  character: Attributes,
  parameters: GAParameters,
  masterData: MasterDataOutfit;
  onHasStarted: () => void,
  onHasStopped: () => void
  onHasNewIteration: (ind: Individual) => void;
}

export function Simulation({character, parameters, masterData, onHasStarted, onHasStopped, onHasNewIteration}: SimulationProps) {
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
          maxData: {
            acc: character.acc + 30,
            allowedWeight: character.allowedWeight + 5,
            armor: character.armor + 26,
            con: character.con + 0,
            dex: character.dex + 8,
            dodge: character.dodge + 41,
            int: character.int + 12,
            lck: character.lck + 150,
            magicalDmg: character.magicalDmg,
            mm: character.mm + 41,
            mr: character.mr + 45,
            physicalDmg: character.physicalDmg + 8,
            rpm: character.rpm + 5,
            rpv: character.rpv + 4,
            str: character.str + 11,
            nbSpellAttach: character.nbSpellAttach + 3
          },
          minData: {
            acc: character.acc - 8,
            allowedWeight: character.allowedWeight,
            armor: 0,
            con: character.con,
            dex: character.dex,
            dodge: character.dodge - 18,
            int: character.int,
            lck: character.lck,
            magicalDmg: character.magicalDmg,
            mm: character.mm,
            mr: character.mr - 10,
            physicalDmg: character.physicalDmg,
            rpm: character.rpm - 1,
            rpv: character.rpv,
            str: character.str,
            nbSpellAttach: 0
          },
          parameters: parameters
        },
        masterData: masterData,
        state: {...state}
    };

    worker.postMessage(message);
  }, [worker, state, character, parameters, masterData])

  return (
    <div>
      <button onClick={handleStart} disabled={state.isRunning}>Démarrer</button>
      <button onClick={handleStop} disabled={!state.isRunning}>Stopper </button>
    </div>
  )
}