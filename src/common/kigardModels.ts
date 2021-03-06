import { count } from "console";
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
    minDamage: number;
    maxDamage: number;
    minRange: number;
    maxRange: number;
    allowedWeight: number;
    pv: number;
    mp: number;
    nbSpellAttach: number;
    nbProjectiles: number;
    isBow: number;
    isRifle: number;
    burning: number;
    regeneration: number;
    poison: number;
    bleeding: number;
    knockedOut: number;
    breach: number;
    terror: number;
    necrosis: number;
}

export interface KigardToken {
    burning: number;
    regeneration: number;
    poison: number;
    bleeding: number;
    knockedOut: number;
    breach: number;
    terror: number;
    necrosis: number;
}

export interface Equipment {
    id: number;
    name: string;
    kind: EquipmentClass;
    localization: Localization;
    weight: number;
    hands: number;
    pa: number;
    attributes: Attributes;
    quality: Quality;
}

export interface MasterDataOutfit {
    head: Equipment[];
    body: Equipment[];
    feet: Equipment[];
    righthand: Equipment[];
    lefthand: Equipment[];
    fetish: Equipment[];
    container: Equipment[];
}

export interface Outfit {
    head: Equipment;
    body: Equipment;
    feet: Equipment;
    righthand: Equipment;
    lefthand: Equipment;
    fetish: Equipment;
    container: Equipment;
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
    isThrowing: boolean;
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
    Fetish,
    Container
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
    Container,
    BowContainer,
    GunContainer,
    LightWeapon,
    IntermediaryWeapon,
    HeavyWeapon,
    MagicalWeapon,
    ExoticWeapon,
    ParadeWeapon,
    RunicWeapon,
    MagicFocus
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
    minDamage: 0,
    maxDamage: 0,
    minRange: 0,
    maxRange: 0,
    allowedWeight: 0,
    nbSpellAttach: 0,
    nbProjectiles: 0,
    isBow: 1,
    isRifle: 1,
    pv: 0,
    mp: 0,
    burning: 0,
    regeneration: 0,
    poison: 0,
    bleeding: 0,
    knockedOut: 0,
    breach: 0,
    terror: 0,
    necrosis: 0
};

export const defaultEquipment: Equipment = {
    id: 0,
    name: "",
    kind: EquipmentClass.LightArmor,
    localization: Localization.Head,
    weight: 0,
    hands: 0,
    pa: 0,
    attributes: {...defaultAttributes},
    quality: Quality.Standard
}

export const outfitParts: string[] = ["head", "body", "lefthand", "righthand", "feet", "container"];

export const emptyHead = {...defaultEquipment};
emptyHead.name = "Casque non port??";

export const emptyFeet = {...defaultEquipment};
emptyFeet.name = "Chaussures non port??es";
emptyFeet.localization = Localization.Feet;

export const emptyBody = {...defaultEquipment};
emptyBody.name = "Armure non port??e";
emptyBody.localization = Localization.Body;

export const emptyLeftHand = {...defaultEquipment};
emptyLeftHand.name = "Main gauche vide";
emptyLeftHand.localization = Localization.Lefthand;

export const emptyRightHand = {...defaultEquipment};
emptyRightHand.name = "Sans arme";
emptyRightHand.localization = Localization.RightHand;
emptyRightHand.pa = 6;

export const emptyContainer = {...defaultEquipment};
emptyContainer.name = "Pas de conteneur";
emptyContainer.localization = Localization.Container;
emptyContainer.kind = EquipmentClass.Container;
emptyContainer.attributes.nbProjectiles = 1;

export function getEmptyEquipment(localisation: Localization) {
    const empty = {...defaultEquipment};

    switch(localisation) {
        case Localization.Head: {
            empty.name = "Casque non port??";
            empty.localization = Localization.Head;
            break;
        }
        case Localization.Body: {
            empty.name = "Armure non port??e";
            empty.localization = Localization.Body;
            break;
        }
        case Localization.Lefthand: {
            empty.name = "Main gauche vide";
            empty.localization = Localization.Lefthand;
            break;
        }
        case Localization.RightHand: {
            empty.name = "Sans arme";
            empty.localization = Localization.RightHand;
            break;
        }
        case Localization.Feet: {
            empty.name = "Chaussures non port??es";
            empty.localization = Localization.Feet;
            break;
        }
        case Localization.Container : {
            empty.name = "Pas de conteneur";
            empty.localization = Localization.Container;
            empty.kind = EquipmentClass.Container;
            empty.attributes.nbProjectiles = 1;
            break;
        }
        case Localization.Fetish: {
            empty.name = "Pas de f??tiche";
            empty.localization = Localization.Fetish;
            break;
        }
    }

    return empty;
}

export function getDefaultOutfit(): Outfit {
    return {
        head: getEmptyEquipment(Localization.Head),
        body: getEmptyEquipment(Localization.Body),
        feet: getEmptyEquipment(Localization.Feet),
        righthand: getEmptyEquipment(Localization.RightHand),
        lefthand: getEmptyEquipment(Localization.Lefthand),
        fetish: getEmptyEquipment(Localization.Fetish),
        container: getEmptyEquipment(Localization.Container),
    };
}

export function generateEquipmentFromJSON (data: any, localization: Localization): Equipment[] {
    let equipments: Equipment[] = [];
    for (const d of data) {
        const equipment: Equipment = {
            id: d.id,
            name: d.nom,
            kind: getEquipmentClassFromString(d.type),
            localization: localization, //getLocalizationFromString("tete"), //TODO : change with more equipment
            weight: d.poids || 0,
            hands: d.mains || 0,
            pa: d.pa || 0,
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
                minDamage: d.dgt_min || 0,
                maxDamage: d.dgt_max || 0,
                minRange: d.portee_min || 0,
                maxRange: d.portee_max || 0,
                allowedWeight: 0,
                pv: 0,
                mp: 0,
                nbSpellAttach: d.emplacement || 0,
                nbProjectiles: d.capacite || 0,
                isBow: d.arc || 0,
                isRifle: d.fusile || 0,
                burning: d.brulure || 0,
                regeneration: d.pv, // pv/tr is equivalent to regeneration
                poison: d.poison || 0,
                bleeding: d.saignement || 0,
                knockedOut: d.assome || 0,
                breach: d.faille || 0,
                terror: d.terreur || 0,
                necrosis: d.necrose || 0
            },
            quality: getQualiyFromString("base") //TODO : change with more equipment
        };
        equipments.push(equipment);
    }

    return equipments;
}

export function generateQualityEquipments(equipments: Equipment[], requiredQuality: Quality, offsetId: number): Equipment[] {
    let qualityEquipments: Equipment[] = [];

    let coefficient: number;
    switch(requiredQuality) {
        case Quality.Standard: {
            coefficient = 0;
            break;
        }
        case Quality.Great: {
            coefficient = 1;
            break;
        }
        case Quality.Master: {
            coefficient = 2;
            break;
        }
        default:
            coefficient = 0;
    }

    let id = 1;
    for (let equipment of equipments) {
        const qualityEquipment = {...equipment};
        qualityEquipment.id = id + offsetId;

        switch(requiredQuality) {
            case Quality.Great:
                qualityEquipment.name = qualityEquipment.name + " de qualit??";
                break;
            case Quality.Master:
                qualityEquipment.name = qualityEquipment.name + " de ma??tre";
        }

        qualityEquipment.attributes = {...equipment.attributes};
        qualityEquipment.quality = requiredQuality;

        if (qualityEquipment.localization === Localization.RightHand){
            upgradeWeapon(qualityEquipment, coefficient);
        }
        else {
            upgradeArmor(qualityEquipment, coefficient);
        }
        qualityEquipments.push(qualityEquipment);
        id++;
    }
    return qualityEquipments;
}

function upgradeArmor(equiment: Equipment, coefficient: number): void {

    switch(equiment.kind) {
        case EquipmentClass.LightArmor: {
            equiment.attributes.dodge += 4 * coefficient;
            break;
        }
        case EquipmentClass.HeavyArmor: {
            equiment.attributes.armor += 1 * coefficient;
            break;
        }
        case EquipmentClass.FightingOutfit: {
            equiment.attributes.acc += 2 * coefficient;
            equiment.attributes.dodge += 2 * coefficient;
            break;
        }
        case EquipmentClass.TravelingOutfit: {
            equiment.attributes.lck += 25 * coefficient;
            break;
        }
        case EquipmentClass.Artifact: {
            equiment.attributes.dodge += 2 * coefficient;
            equiment.attributes.mr += 2 * coefficient;
            break;
        }
        case EquipmentClass.Fetish: {
            equiment.attributes.dodge += 1 * coefficient;
            equiment.attributes.mr += 1 * coefficient;
            equiment.attributes.acc += 1 * coefficient;
            equiment.attributes.mm += 1 * coefficient;
            break;
        }
        case EquipmentClass.MagicFocus: {
            equiment.attributes.mm += 2 * coefficient;
            equiment.attributes.mr += 2 * coefficient;
            break;
        }
        case EquipmentClass.Set: {
            equiment.attributes.mr += 4 * coefficient;
            break;
        }
        case EquipmentClass.SecondaryWeapon: {
            equiment.attributes.minDamage += 1 * coefficient;
            equiment.attributes.maxDamage += 1 * coefficient;
            break;
        }
        case EquipmentClass.Container: {
            equiment.attributes.nbProjectiles += 2 * coefficient;
            break;
        }
    }
}

function upgradeWeapon(equiment: Equipment, coefficient: number): void {
    switch(equiment.kind) {
        case EquipmentClass.LightWeapon: {
            equiment.attributes.acc += 8 * coefficient;
            break;
        }
        case EquipmentClass.IntermediaryWeapon: {
            equiment.attributes.acc += 4 * coefficient;
            equiment.attributes.minDamage += 1 * coefficient;
            equiment.attributes.maxDamage += 1 * coefficient;
            break;
        }
        case EquipmentClass.HeavyWeapon: {
            equiment.attributes.minDamage += 2 * coefficient;
            equiment.attributes.maxDamage += 2 * coefficient;
            break;
        }
        case EquipmentClass.MagicalWeapon: {
            equiment.attributes.mm += 8 * coefficient;
            break;
        }
        case EquipmentClass.ExoticWeapon: {
            equiment.attributes.acc += 4 * coefficient;
            equiment.attributes.dodge += 4 * coefficient;
            break;
        }
        case EquipmentClass.ParadeWeapon: {
            equiment.attributes.dodge += 8 * coefficient;
            equiment.attributes.minDamage += 1 * coefficient;
            equiment.attributes.maxDamage += 1 * coefficient;
            break;
        }
        case EquipmentClass.RunicWeapon: {
            equiment.attributes.mm += 4 * coefficient;
            equiment.attributes.minDamage += 1 * coefficient;
            equiment.attributes.maxDamage += 1 * coefficient;
            break;
        }
        case EquipmentClass.SecondaryWeapon: {
            equiment.attributes.minDamage += 1 * coefficient;
            equiment.attributes.maxDamage += 1 * coefficient;
            break;
        }
    }
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
        case "arc": return EquipmentClass.BowContainer;
        case "fusil": return EquipmentClass.GunContainer;
        case "armeLegere": return EquipmentClass.LightWeapon;
        case "armeIntermediaire": return EquipmentClass.IntermediaryWeapon;
        case "armeLourde" : return EquipmentClass.HeavyWeapon;
        case "armeMagique": return EquipmentClass.MagicalWeapon;
        case "armeExotique": return EquipmentClass.ExoticWeapon;
        case "armeParade": return EquipmentClass.ParadeWeapon;
        case "armeRunique": return EquipmentClass.RunicWeapon;
        default: throw Error("equiment class " + name + " not defined");
    }
}

/*
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
*/

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
export function buildTurns(paByTurns: number[], attributes: Attributes, opponent: Attributes, action: Action): ProbaTree {
    const nbTurns = paByTurns.length;
    const probaTree = new ProbaTree(opponent.pv);
    let turnPossibilities: Branch[] = [probaTree.root];
    let pmForTurn = 25;
    let projectileForTurn = attributes.nbProjectiles;
    let attr = {...attributes};

    for (let turn = 0; turn < nbTurns; turn++) {
        let paForTurn = paByTurns[turn];
        pmForTurn = Math.min(25, pmForTurn + attributes.rpm);
        let actionDuringTurn = paForTurn - action.pa < 0 ? 0 : 1;
        let actionPerformedCost = action.pa;
        let tokens: KigardToken[] = [];

        while (paForTurn - action.pa >= 0
            || (action.isThrowing && projectileForTurn === 0 && paForTurn - 1 >= 0)
            || actionDuringTurn === 0) // no action possible this turn but need to apply the tokens once (burning, ...)
        {
            const nbPossibilitiesToProcess = turnPossibilities.length;
            for (let i = 0; i < nbPossibilitiesToProcess; i++) {

                let currentBranch: Branch | undefined = turnPossibilities.shift();
                if (currentBranch && currentBranch.value > 0) {
                    let oppAttr = {...opponent};
                    let probabilities: number[] = [];
                    let remainingLife: number[] = [];

                    if (actionDuringTurn === 0) {
                        probabilities = [1]; // keep the branch open and apply only the tokens
                        remainingLife = [currentBranch.value];
                    }
                    else {
                        if (action.isMagic) {
                            // MM: 15, RM: 30 => threshold = 50 + 30 - 15 = 75 => hitting Proba = 25% / missing Proba = 75%
                            const threshold: number = action.isHealing ? getHealingMagicThreshold(attr.mm, oppAttr.mr) : getHostileMagicThreshold(attr.mm, oppAttr.mr);
                            const hittingProba = (100 - threshold) / 100;
                            const missingProba = 1 - hittingProba;
                            probabilities = [hittingProba, missingProba];
                            remainingLife = [currentBranch.value, currentBranch.value];
                        }
                        else  {
                            // Acc: 35, dodge: 40 => critical threshold = 90 + 40 - 35 = 95, dodge threshold = 10 + 40 - 35 = 15 => critical Proba = 5% / hitting Proba = 80% / missing Proba: 15%
                            const threshold: {dodge: number, critical: number} = getFightingthreshold(attr.acc, oppAttr.dodge);

                            const critical = Math.max(0,
                                (100 - (Math.max(0, threshold.critical)))
                                );
                            const missing = Math.max(0, threshold.dodge);

                            const criticalProba = 1 - (critical / 100);
                            const missingProba = missing / 100;
                            const hittingProba = 1 - (criticalProba + missingProba);

                            probabilities = [criticalProba, hittingProba, missingProba];
                            remainingLife = [currentBranch.value, currentBranch.value, currentBranch.value];
                        }
                    }

                    // Tokens are decrementing of 1 each turn after being applied
                    if (actionDuringTurn === 0 || actionDuringTurn === 1) {
                        if (action.isHealing) {
                            //Regeneration won't heal after max health
                            const regenToken = currentBranch.token.regeneration;
                            remainingLife.map(val => Math.max(0, val - regenToken));
                        }
                        else {
                            // Apply status effect before solving the turn
                            const burning = currentBranch.token.burning;
                            const poison = currentBranch.token.poison;
                            const bleeding = currentBranch.token.bleeding;
                            const knockedOut = currentBranch.token.knockedOut;
                            const breach = currentBranch.token.breach;
                            const terror = currentBranch.token.terror;
                            const necrosis = currentBranch.token.necrosis;

                            //Burning and poison can not kill in game
                            remainingLife.map(val => Math.max(0, val - burning));
                            remainingLife.map(val => Math.max(0, val - poison));
                            remainingLife.map(val => Math.min(opponent.pv, val + Math.max(0, opponent.regeneration - bleeding)));

                            oppAttr.dodge = Math.max(0, opponent.dodge - (knockedOut * 5));
                            oppAttr.armor = Math.max(0, opponent.armor - breach);
                            oppAttr.mr = Math.max(0, opponent.mr - terror * 5);
                            oppAttr.str = Math.max(0, opponent.str - Math.floor(necrosis / 2));
                            oppAttr.dex = Math.max(0, opponent.dex - Math.floor(necrosis / 2));
                            oppAttr.int = Math.max(0, opponent.int - Math.floor(necrosis / 2));
                            oppAttr.acc = Math.max(0, opponent.acc - 2 * necrosis);
                            oppAttr.mm = Math.max(0, opponent.mm - 2 * necrosis);
                        }

                        let updatedToken: KigardToken = {
                            burning: Math.max(0, currentBranch.token.burning -1),
                            regeneration: Math.max(0, currentBranch.token.regeneration -1),
                            poison: Math.max(0, currentBranch.token.poison -1),
                            bleeding: Math.max(0, currentBranch.token.bleeding -1),
                            knockedOut: Math.max(0, currentBranch.token.knockedOut -1),
                            breach: Math.max(0, currentBranch.token.breach -1),
                            terror: Math.max(0, currentBranch.token.terror -1),
                            necrosis: Math.max(0, currentBranch.token.necrosis -1),
                        };

                        probabilities.forEach(val => {
                            tokens.push({...updatedToken});
                        });
                    }

                    if (actionDuringTurn > 0) {
                        if (action.isMagic) {
                            if (pmForTurn >= action.pm) {
                                remainingLife = [remainingLife[0] - action.magicSuccess, remainingLife[1] - action.magicResisted];

                                // Tokens are increased only if the spell is a success
                                if (action.isHealing) {
                                    tokens[0].regeneration += action.regeneration;
                                }
                                else {
                                    // Burning only since we considered the cast spell to be Fireball
                                    tokens[0].burning += action.burning;
                                }
                            }
                        }
                        else {
                            if ((action.isThrowing && projectileForTurn > 0) || !action.isThrowing) {
                                remainingLife = [remainingLife[0] - Math.max(0, (action.physicalDamageSuccess + action.criticalBonus) - oppAttr.armor),
                                remainingLife[1] - Math.max(0, action.physicalDamageSuccess - oppAttr.armor),
                                remainingLife[2]]; // no damage when dodging

                                //Add tokens after attacking if any
                                tokens[0].burning += attributes.burning > 0 ? attributes.burning + 1 : 0;
                                tokens[0].poison += attributes.poison > 0 ? attributes.poison + 1 : 0;
                                tokens[0].bleeding += attributes.bleeding > 0 ? attributes.bleeding + 1 : 0;
                                tokens[0].knockedOut += attributes.knockedOut > 0 ? attributes.knockedOut + 1 : 0;
                                tokens[0].breach += attributes.breach > 0 ? attributes.breach + 1 : 0;
                                tokens[0].terror += attributes.terror > 0 ? attributes.terror + 1 : 0;
                                tokens[0].necrosis += attributes.necrosis > 0 ? attributes.necrosis + 1 : 0;

                                tokens[1].burning += attributes.burning;
                                tokens[1].poison += attributes.poison;
                                tokens[1].bleeding += attributes.bleeding;
                                tokens[1].knockedOut += attributes.knockedOut;
                                tokens[1].breach += attributes.breach;
                                tokens[1].terror += attributes.terror;
                                tokens[1].necrosis += attributes.necrosis;

                                projectileForTurn--;
                            }
                            else if (action.isThrowing && projectileForTurn === 0) {
                                //Reload for shooting next turn
                                projectileForTurn = attributes.nbProjectiles;
                                actionPerformedCost = 1;
                            }
                        }
                    }

                    if (actionDuringTurn === 0 || actionPerformedCost > 1) {
                        const isFinals: boolean[] = []
                        for (let i = 0; i < probabilities.length; i++) {
                            const remainingPA = paForTurn - actionPerformedCost;
                            // final step if :
                            // The opponent is dead this action
                            // or it is the last action of the last turn
                            // or the probability to make the action is 0
                            const isFinal = isFinalMoveOnSimulationBranch(probabilities[i], remainingLife[i], turn, paByTurns, (remainingPA - actionPerformedCost), action.pa);
                            isFinals.push(isFinal);
                        }

                        remainingLife = remainingLife.map((value: number) => Math.max(0, value)); // could not lost more than PV
                        const newPossibilities = probaTree.addLevel(currentBranch, probabilities, remainingLife, tokens, isFinals);
                        turnPossibilities = turnPossibilities.concat(newPossibilities);
                    }
                }
            }

            paForTurn -= actionPerformedCost;
            pmForTurn = pmForTurn - action.pm >= 0 ? Math.max(0, pmForTurn - action.pm) : pmForTurn;
            actionDuringTurn++; // if 0 (not action possible that turn at all, it will become 1 and exit the loop)
        }
    }
    return probaTree;
}

function isFinalMoveOnSimulationBranch(probability: number, remainingLife: number, turn: number, turns: number[], remainingPAForTurn: number, actionPA: number): boolean {
    /*
    let couldActNextTurns = false;
    let i = turn + 1;
    while(!couldActNextTurns && i < turns.length) {
        couldActNextTurns = (actionPA <= turns[i]);
        i++;
    }
    */

    const isFinal = (probability === 0)
        || (remainingLife <= 0)
        || (turn === (turns.length - 1) && remainingPAForTurn < 0);
        //|| (!couldActNextTurns && remainingPAForTurn < 0);

    return isFinal;
}