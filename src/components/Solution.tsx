import "./Solution.css";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { ReactElement } from "react";
import { GAParameters, Individual } from "../common/ga";
import { Attributes, defaultEquipment, Equipment, getFightingthreshold, getHostileMagicThreshold, MasterDataOutfit, outfitParts, Profile } from "../common/kigardModels";
import { profileAdvancedAssassin, profileAdvancedMage, profileAdvancedWarrior, profileBeginnerAssassin, profileBeginnerMage, profileBeginnerWarrior, profileIntermediateAssassin, profileIntermediateMage, profileIntermediateWarrior } from "../common/kigardProfiles";
import { cpuUsage } from "process";

export interface SolutionProps {
    ind: Individual;
    masterData: MasterDataOutfit;
    character: Attributes;
    parameters: GAParameters;
};

export function Solution({ind, masterData, character, parameters}: SolutionProps) {

    const kigardHeader: string[] = ["armor", "acc", "dodge", "mm", "mr", "dex", "int", "str", "rpm", "rpv"];
    const kigardHeaderFR: string[] = ["Arm", "Pre", "Esq", "MM", "RM", "Dex", "Int", "For", "PM/Tr", "PV/Tr"];

    const generateHeader = function(): JSX.Element[] {
        const row: JSX.Element[] = [];

        const thName = <Th key="th-solution-name">Nom</Th>
        row.push(thName);

        kigardHeaderFR.forEach((name: string) => {
            const id = "th-solution-" + name;
            const th = <Th key={id}>{name}</Th>
            row.push(th);
        });

        const thWeight = <Th key="th-solution-weight">Poids</Th>
        const thHands = <Th key="th-solution-hands">Mains</Th>
        const thInfo = <Th key="th-solution-info">Information</Th>

        row.push(thWeight);
        row.push(thHands);
        row.push(thInfo);

        return row;
    }

    const generateRow = function(equipmentID: number, outfitPartID: number): ReactElement {
        const partIndex = outfitParts[outfitPartID].toLowerCase();
        const partOutfit = masterData[partIndex as keyof MasterDataOutfit];
        const equipment = partOutfit.find(value => value.id === equipmentID) || defaultEquipment;

        return (
            <Tr key={"tr-solution-" + outfitPartID}>
                <Td className="td-title" key="td-solution-name">{equipment.name}</Td>
                {kigardHeader.map((name: string) => (
                    <Td key={"td-solution-" + name}>{equipment.attributes[name as keyof Attributes]}</Td>
                ))}
                <Td key="td-solution-weight">{equipment.weight}</Td>
                <Td key="td-solution-hands">{equipment.hands}</Td>
                <Td key="td-solution-info">{generateInformation(equipment)}</Td>
            </Tr>
        )
    };

    const generateInformation = function(equipment: Equipment): string {
        const kigardAdditional: string[] = ["minDamage", "maxDamage", "minRange", "maxRange", "burning", "bleeding", "poison", "knockedout", "necrosis", "breach"];
        const kigardAdditionalFR: string[] = ["Degâts", "-", "Portée", "-", "Brulûre", "Saignement", "Poison", "Assomé", "Nécrose", "Faille"];

        let infoList: string[] = [];
        let info: string = "";
        if (equipment.pa > 0) {
            info = "PA: " + equipment.pa;
            infoList.push(info);
        }

        kigardAdditional.forEach((name: string, index: number) => {
            const value: number = equipment.attributes[name as keyof Attributes];
            if (value > 0 || (name === "minDamage" && equipment.attributes.maxDamage > 0)) {
                info = kigardAdditionalFR[index] + ": " + value;
                infoList.push(info);
            }
        });

        let infoStr = infoList.join(', ');
        infoStr = infoStr.replaceAll(", -:", " -");
        return infoStr;
    }

    const generateHitRateInformation = function(ind: Individual, opponent: Attributes, isOffense: boolean = true, isPhysical: boolean  = true) {
        if (isPhysical) {
            const threshold = isOffense ? getFightingthreshold(ind.phenotype.acc, opponent.dodge) : getFightingthreshold(opponent.acc, ind.phenotype.dodge);
            const criticalProba = Math.max(0,
                (100 - (Math.max(0, threshold.critical)))
                );
            const missingProba = Math.max(0, threshold.dodge);
            const hittingProba = 100 - (criticalProba + missingProba);

            return missingProba + " / " + hittingProba + " / " + criticalProba;
        }
        else {
            const fullEffect = isOffense ? getHostileMagicThreshold(ind.phenotype.mm, opponent.mr) : getHostileMagicThreshold(opponent.mm, ind.phenotype.mr)
            const fullEffectProba = Math.max(0,
                (100 - (Math.max(0, fullEffect)))
                );
            return fullEffectProba;
        }
    }

    const generateDamageInformation  = function(ind: Individual, opponent: Attributes, isOffense: boolean = true, isPhysical: boolean  = true) {
        if (isPhysical) {
            const minDamage = isOffense ? (ind.phenotype.minDamage + ind.phenotype.str - opponent.armor) : (opponent.minDamage + opponent.str - ind.phenotype.armor);
            const maxDamage = isOffense ? (ind.phenotype.maxDamage + ind.phenotype.str - opponent.armor) : (opponent.maxDamage + opponent.str - ind.phenotype.armor);
            let bonusCritical = isOffense ? ind.phenotype.dex : opponent.dex;
            if (parameters.optimProfile === Profile.archer && isOffense) {
                // Archer critical is half dexterity
                bonusCritical = Math.floor(bonusCritical / 2);
            }
            return Math.max(0, minDamage) + " - " + Math.max(0, maxDamage) + " (+" + bonusCritical + ")";
        }
        else {
            const magicalDamage = Math.floor(ind.phenotype.int / 2) + " / " + ind.phenotype.int + "(+2b)" ;
            const oppMagicalDamage = Math.floor(opponent.int / 2) + " / " + opponent.int + "(+2b)" ;
            return isOffense ? magicalDamage : oppMagicalDamage;
        }
    }

    return (
        <div className="solution-wrapper">
            <div className="solution-character">
                <div> Personnage final </div>
                <div> Con: {ind.phenotype.con}  </div>
                <div> For: {ind.phenotype.str} ({ind.phenotype.str - character.str > 0 ? "+" : ""}{ind.phenotype.str - character.str}) </div>
                <div> Int: {ind.phenotype.int} ({ind.phenotype.int - character.int > 0 ? "+" : ""}{ind.phenotype.int - character.int})</div>
                <div> Dex: {ind.phenotype.dex} ({ind.phenotype.dex - character.dex > 0 ? "+" : ""}{ind.phenotype.dex - character.dex})</div>
                <div> Chance: {ind.phenotype.lck} ({ind.phenotype.lck - character.lck > 0 ? "+" : ""}{ind.phenotype.lck - character.lck})</div>
                <div> Précision: {ind.phenotype.acc} ({ind.phenotype.acc - character.acc > 0 ? "+" : ""}{ind.phenotype.acc - character.acc})</div>
                <div> Esquive: {ind.phenotype.dodge} ({ind.phenotype.dodge - character.dodge > 0 ? "+" : ""}{ind.phenotype.dodge - character.dodge})</div>
                <div> MM: {ind.phenotype.mm} ({ind.phenotype.mm - character.mm > 0 ? "+" : ""}{ind.phenotype.mm - character.mm})</div>
                <div> RM: {ind.phenotype.mr} ({ind.phenotype.mr - character.mr > 0 ? "+" : ""}{ind.phenotype.mr - character.mr})</div>
                <div> Armure: {ind.phenotype.armor}</div>
            </div>

            <div className="solution-equipment">
                <span> Equipement (poids: {ind.carriedWeight} / {character.allowedWeight}): </span>
                <span> Score: {ind.fitness.fitness.toFixed(4)}</span>
                <Table id="table-solution" className="table-solution">
                    <Thead>
                        <Tr>{generateHeader()}</Tr>
                    </Thead>
                    <Tbody>
                        {ind.genes.map((equipmentID, index) => {
                            return generateRow(equipmentID, index);
                        })}
                    </Tbody>
                </Table>
            </div>

            <div className="solution-simulation">
                <div>
                    <span>Dégâts espérés infligés par profil de l'opposant:</span>
                    <Table id="table-fitness-offense" className="table-simulation">
                        <Thead className="table-simulation-header">
                            <Tr><Td>Profils</Td><Td>Débutant</Td><Td>Intermédiaire</Td><Td>Avancé</Td></Tr>
                        </Thead>
                        <Tbody>
                            <Tr className="table-simulation-profile">
                                <Td className="td-title">Guerrier</Td>
                                <Td>{ind.fitness.offenseBeginnerWarrior.toFixed(0)} / {profileBeginnerWarrior.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateWarrior.toFixed(0)} / {profileIntermediateWarrior.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedWarrior.toFixed(0)} / {profileAdvancedWarrior.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Esq./Touché/Crit.</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerWarrior)} </Td>
                                <Td>{generateHitRateInformation(ind, profileIntermediateWarrior)} </Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedWarrior)} </Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Crit.)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerWarrior)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateWarrior)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedWarrior)} </Td>
                            </Tr>
                            <Tr className="table-simulation-profile">
                                <Td className="td-title">Assassin</Td>
                                <Td>{ind.fitness.offenseBeginnerAssassin.toFixed(0)} / {profileBeginnerAssassin.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateAssassin.toFixed(0)} / {profileIntermediateAssassin.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedAssassin.toFixed(0)} / {profileAdvancedAssassin.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Esq./Touché/Crit.</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerAssassin)} </Td>
                                <Td>{generateHitRateInformation(ind, profileIntermediateAssassin)} </Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedAssassin)} </Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Crit.)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerAssassin)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateAssassin)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedAssassin)} </Td>
                            </Tr>
                            <Tr className="table-simulation-profile">
                                <Td className="td-title">Mage</Td>
                                <Td>{ind.fitness.offenseBeginnerMage.toFixed(0)} / {profileBeginnerMage.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateMage.toFixed(0)} / {profileIntermediateMage.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedMage.toFixed(0)} / {profileAdvancedMage.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Esq./Touché/Crit.</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerMage)} </Td>
                                <Td>{generateHitRateInformation(ind, profileIntermediateMage)} </Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedMage)} </Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Crit.)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerMage)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateMage)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedMage)} </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </div>

                <div>
                    <span>PV perdus après attaques par profil de l'opposant:</span>
                    <Table id="table-fitness-defense" className="table-simulation">
                        <Thead className="table-simulation-header">
                            <Tr><Td>Profils</Td><Td>Débutant</Td><Td>Intermédiaire</Td><Td>Avancé</Td></Tr>
                        </Thead>
                        <Tbody>
                            <Tr  className="table-simulation-profile">
                                <Td className="td-title">Guerrier</Td>
                                <Td>{ind.fitness.defenseBeginnerWarrior.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateWarrior.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedWarrior.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Esq./Touché/Crit.</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerWarrior, false)} </Td>
                                <Td>{generateHitRateInformation(ind, profileIntermediateWarrior, false)} </Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedWarrior, false)} </Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Crit.)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerWarrior, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateWarrior, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedWarrior, false)} </Td>
                            </Tr>
                            <Tr className="table-simulation-profile">
                                <Td className="td-title">Assassin</Td>
                                <Td>{ind.fitness.defenseBeginnerAssassin.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateAssassin.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedAssassin.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Crit.)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerAssassin, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateAssassin, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedAssassin, false)} </Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Esq./Touché/Crit.</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerAssassin, false)}</Td>
                                <Td>{generateHitRateInformation(ind, profileIntermediateMage, false)}</Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedAssassin, false)}</Td>
                            </Tr>
                            <Tr className="table-simulation-profile">
                                <Td className="td-title">Mage</Td>
                                <Td>{ind.fitness.defenseBeginnerMage.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateMage.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedMage.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Seuil plein effet</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerMage, false, false)}</Td>
                                <Td>{generateHitRateInformation(ind, profileBeginnerWarrior, false, false)}</Td>
                                <Td>{generateHitRateInformation(ind, profileAdvancedMage, false, false)}</Td>
                            </Tr>
                            <Tr className="table-simulation-section">
                                <Td className="td-title">Dégâts/tr (Effet)</Td>
                                <Td>{generateDamageInformation(ind, profileBeginnerMage, false, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileIntermediateMage, false, false)} </Td>
                                <Td>{generateDamageInformation(ind, profileAdvancedMage, false, false)} </Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}