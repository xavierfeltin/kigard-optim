import { Configuration, SimuState } from "./ga";
import { Equipment } from "./kigardModels";

export interface MessageIn {
    configuration: Configuration;
    masterData: Equipment[];
    state: SimuState
}

export interface MessageOut {
    state: SimuState
}