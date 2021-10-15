import { Configuration, SimuState } from "./ga";
import { Attributes, Equipment } from "./kigardModels";

export interface MessageIn {
    configuration: Configuration;
    masterData: Equipment[];
    state: SimuState
}

export interface MessageOut {
    state: SimuState    
}