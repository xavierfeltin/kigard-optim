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
}

export interface Equipment {
    name: string;
    kind: EquipmentClass;
    localization: Localization;
    weight: number; 
    attributes: Attributes;
    quality: Quality;
}

export interface Outfit {
    head: Equipment;
    body: Equipment;
    shoes: Equipment;
    rightHand: Equipment;
    leftHand: Equipment;
    fetish: Equipment;
}

export interface Character {
    attributes: Attributes;    
    outfit: Outfit;
    eqdAttributes: Attributes;
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

export function generateEquipmentFromJSON (data: any): Equipment[] {
    let equipments: Equipment[] = [];
    for (const d of data) {
        const equipment: Equipment = {
            name: d.nom,
            kind: getEquipmentClassFromString(d.type),
            localization: getLocalizationFromString("tete"), //TODO : change with more equipment
            weight: d.poids, 
            attributes: {
                con: 0,
                str: d.for,
                dex: d.dex,
                int: d.int,
                lck: d.chance,                
                acc: d.pre,
                dodge: d.esq,
                mm: d.mm,
                mr: d.rm,
                rpm: d.pm,
                rpv: d.pv,
                armor: d.armure,
                physicalDmg: d.dommage,
                magicalDmg: 0
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
    magicalDmg: 0
};

export const defaultEquipment: Equipment = {
    name: "",
    kind: EquipmentClass.LightArmor,
    localization: Localization.Head,
    weight: 0, 
    attributes: {...defaultAttributes},
    quality: Quality.Standard
}