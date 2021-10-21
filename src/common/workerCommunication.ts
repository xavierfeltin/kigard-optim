import { Configuration, SimuState } from "./ga";
import { Equipment, MasterDataOutfit } from "./kigardModels";

export interface MessageIn {
    configuration: Configuration;
    masterData: MasterDataOutfit;
    state: SimuState
}

export interface MessageOut {
    state: SimuState
}