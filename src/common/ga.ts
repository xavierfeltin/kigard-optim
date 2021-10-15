import { Attributes, Equipment } from "./kigardModels";

export interface Configuration {
    data: Attributes;
}

export interface SimuState {
    isRunning: boolean;
    bestSolution: Equipment;
    population: Equipment[];
}