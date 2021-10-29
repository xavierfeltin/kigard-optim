import { cpuUsage } from "process";
import { act } from "react-dom/test-utils";
import { Branch, ProbaTree } from "./math";

export interface Attributes {
    con: number;
    str: number;
    dex: number;
    int: number;
    lck: number;
    acc: number;
    dodge: number;
    mm: number;
    mr: number;
    rpm: number;
    rpv: number;
    armor: number;
    physicalDmg: number;
    magicalDmg: number;
    allowedWeight: number;
    pv: number;
    mp: number;
    nbSpellAttach: number;
    burning: number;
    regeneration: number;
}

export interface KigardToken {
    burning: number;
    regeneration: number;
}

export interface Equipment {
    id: number;
    name: string;
    kind: EquipmentClass;
    localization: Localization;
    weight: number;
    attributes: Attributes;
    quality: Quality;
}

export interface MasterDataOutfit {
    head: Equipment[];
    body: Equipment[];
    feet: Equipment[];
    rightHand: Equipment[];
    leftHand: Equipment[];
    fetish: Equipment[];
}

export interface Outfit {
    head: Equipment;
    body: Equipment;
    feet: Equipment;
    rightHand: Equipment;
    leftHand: Equipment;
    fetish: Equipment;
}

export interface Character {
    attributes: Attributes;
    outfit: Outfit;
    eqdAttributes: Attributes;
}

export interface Action {
    name: string;
    pa: number;
    pm: number;
    magicSuccess: number;
    magicResisted: number;
    physicalDamageSuccess: number;
    criticalBonus: number;
    isMagic: boolean;
    isHealing: boolean;
    burning: number;
    regeneration: number;
}

export enum Profile {
    mage,
    healer,
    warrior,
    tank,
    archer
}

export enum Localization {
    Head,
    Body,
    RightHand,
    Lefthand,
    Feet,
    Fetish
}

export enum EquipmentClass {
    LightArmor,
    HeavyArmor,
    FightingOutfit,
    TravelingOutfit,
    Artifact,
    Fetish,
    Focus,
    Set,
    SecondaryWeapon,
    Container
}

export enum Quality {
    Standard,
    Great,
    Master
}


export const defaultAttributes: Attributes = {
    con: 0,
    str: 0,
    dex: 0,
    int: 0,
    lck: 0,
    acc: 0,
    dodge: 0,
    mm: 0,
    mr: 0,
    rpm: 0,
    rpv: 0,
    armor: 0,
    physicalDmg: 0,
    magicalDmg: 0,
    allowedWeight: 0,
    nbSpellAttach: 0,
    pv: 0,
    mp: 0,
    burning: 0,
    regeneration: 0
};

export const defaultEquipment: Equipment = {
    id: 0,
    name: "",
    kind: EquipmentClass.LightArmor,
    localization: Localization.Head,
    weight: 0,
    attributes: {...defaultAttributes},
    quality: Quality.Standard
}

export const outfitParts: string[] = ["head", "body", "leftHand", "feet"];

export function generateEquipmentFromJSON (data: any): Equipment[] {
    let equipments: Equipment[] = [];
    for (const d of data) {
        const equipment: Equipment = {
            id: d.id,
            name: d.nom,
            kind: getEquipmentClassFromString(d.type),
            localization: getLocalizationFromString("tete"), //TODO : change with more equipment
            weight: d.poids,
            attributes: {
                con: 0,
                str: d.for || 0,
                dex: d.dex || 0,
                int: d.int || 0,
                lck: d.chance || 0,
                acc: d.pre || 0,
                dodge: d.esq || 0,
                mm: d.mm || 0,
                mr: d.rm || 0,
                rpm: d.pm || 0,
                rpv: d.pv || 0,
                armor: d.arm || 0,
                physicalDmg: d.dommage || 0,
                magicalDmg: 0,
                allowedWeight: 0,
                pv: 0,
                mp: 0,
                nbSpellAttach: d.emplacement,
                burning: 0,
                regeneration: 0
            },
            quality: getQualiyFromString("base") //TODO : change with more equipment
        };
        equipments.push(equipment);
    }

    return equipments;
}

function getEquipmentClassFromString(name: string): EquipmentClass {
    switch (name) {
        case "legere": return EquipmentClass.LightArmor;
        case "lourde": return EquipmentClass.HeavyArmor;
        case "combat": return EquipmentClass.FightingOutfit;
        case "voyage": return EquipmentClass.TravelingOutfit;
        case "artefact": return EquipmentClass.Artifact;
        case "fetiche": return EquipmentClass.Fetish;
        case "focus": return EquipmentClass.Focus;
        case "parure": return EquipmentClass.Set;
        case "secondaire": return EquipmentClass.SecondaryWeapon;
        case "contenant": return EquipmentClass.Container;
        default: throw Error("equiment class " + name + " not defined");
    }
}

function getLocalizationFromString(name: string): Localization {
    switch (name) {
        case "tete": return Localization.Head;
        case "buste": return Localization.Body;
        case "pieds": return Localization.Feet;
        case "droite": return Localization.RightHand;
        case "gauche": return Localization.Lefthand;
        case "fetiche": return Localization.Fetish;
        default: throw Error("localization " + name + " not defined");
    }
}

function getQualiyFromString(name: string): Quality {
    switch (name) {
        case "base": return Quality.Standard;
        case "qualite": return Quality.Great;
        case "maitre": return Quality.Master;
        default: throw Error("quality level " + name + " not defined");
    }
}

export function getHostileMagicThreshold(mm: number, mr: number): number {
    return 50 + mr - mm;
}

export function getHealingMagicThreshold(mm: number, mr: number): number {
    return 100 - mr - mm;
}

export function getOnselfHealingMagicThreshold(mm: number, mr: number): number {
    return 100 - mr - (mm + 20);
}

export function getFightingthreshold(acc: number, dodge: number): {dodge: number, critical: number} {
    let thresholds = {
        dodge: 10 + dodge - acc,
        critical: 90 + dodge - acc
    };

    return thresholds;
}

// Healing magic is computed by removing health point as the agressive magic, but the threshold are computed differently
export function buildMagicTurns(nbTurns: number = 5, paByTurns: number[] = [10, 10, 10, 10, 10], attributes: Attributes, opponent: Attributes, action: Action): ProbaTree {
    debugger;
    const probaTree = new ProbaTree(opponent.pv);
    let turnPossibilities: Branch[] = [probaTree.root];
    let pmForTurn = 25;
    let attr = {...attributes};

    for (let turn = 0; turn < nbTurns; turn++) {
        let paForTurn = paByTurns[turn];
        pmForTurn = Math.min(25, pmForTurn + attributes.rpm);

        while (paForTurn - action.pa >= 0) {

            const nbPossibilitiesToProcess = turnPossibilities.length;
            for (let i = 0; i < nbPossibilitiesToProcess; i++) {
                let currentBranch: Branch | undefined = turnPossibilities.shift();
                if (currentBranch && currentBranch.value > 0) {

                    let probabilities: number[] = [];
                    let remainingLife: number[] = [];
                    if (action.isMagic) {
                        // MM: 15, RM: 30 => threshold = 50 + 30 - 15 = 75 => hitting Proba = 25% / missing Proba = 75%
                        const threshold: number = action.isHealing ? getHealingMagicThreshold(attr.mm, opponent.mr) : getHostileMagicThreshold(attr.mm, opponent.mr);
                        const hittingProba = (100 - threshold) / 100;
                        const missingProba = 1 - hittingProba;
                        probabilities = [hittingProba, missingProba];
                        remainingLife = [currentBranch.value, currentBranch.value];
                    }
                    else  {
                        // Acc: 35, dodge: 40 => critical threshold = 90 + 40 - 35 = 95, dodge threshold = 10 + 40 - 35 = 15 => critical Proba = 5% / hitting Proba = 80% / missing Proba: 15%
                        const threshold: {dodge: number, critical: number} = getFightingthreshold(attr.acc, opponent.dodge);
                        const criticalProba = 1 - (Math.min(100, threshold.critical) / 100);
                        const missingProba = Math.max(0, threshold.dodge / 100);
                        const hittingProba = 1 - (criticalProba + missingProba);
                        probabilities = [criticalProba, hittingProba, missingProba];
                        remainingLife = [currentBranch.value, currentBranch.value, currentBranch.value];
                    }

                    if (action.isHealing) {
                        //Regeneration won't heal after max health
                        const regenToken = currentBranch.token.regeneration;
                        remainingLife.map(val => Math.max(0, val - regenToken));
                    }
                    else {
                        //Burning can not kill in game
                        const burningToken = currentBranch.token.burning;
                        remainingLife.map(val => Math.max(0, val - burningToken));
                    }

                    // Tokens are decrementing of 1 each turn after being applied
                    let updatedToken = {
                        burning: Math.max(0, currentBranch.token.burning -1),
                        regeneration: Math.max(0, currentBranch.token.regeneration -1)
                    };

                    let tokens: KigardToken[] = [];
                    probabilities.forEach(val => {
                        tokens.push(updatedToken);
                    });

                    if (action.isMagic) {
                        if (pmForTurn >= action.pm) {
                            // It is ok to be in negative, it will just mean that we overkill or overheal, so the build is more efficient
                            remainingLife = [remainingLife[0] - action.magicSuccess, remainingLife[1] - action.magicResisted];

                            // Tokens are increased only if the spell is a success
                            if (action.isHealing) {
                                tokens[0].regeneration += action.regeneration;
                            }
                            else {
                                tokens[0].burning += action.burning;
                            }
                        }
                    }
                    else {
                        remainingLife = [remainingLife[0] - (action.physicalDamageSuccess + action.criticalBonus),
                                        remainingLife[1] - action.physicalDamageSuccess,
                                        remainingLife[2]]; // no damage when dodging
                    }

                    // TODO: Add specific branch transformation from parent context here (bleeding, burning, reducing armor, ...)
                    // May change pobabilities (if mm, pre, dodge, .... are concerned) or may change values (if token are concerned)

                    const newPossibilities = probaTree.addLevel(currentBranch, probabilities, remainingLife, tokens);
                    turnPossibilities = turnPossibilities.concat(newPossibilities);
                }
            }

            paForTurn -= action.pa;
            pmForTurn = pmForTurn - action.pm >= 0 ? Math.max(0, pmForTurn - action.pm) : pmForTurn;
        }
    }

    return probaTree;
}