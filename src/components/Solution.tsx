import "./Solution.css";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { ReactElement } from "react";
import { Individual } from "../common/ga";
import { Attributes, defaultEquipment, Equipment, MasterDataOutfit, outfitParts } from "../common/kigardModels";
import { profileAdvancedAssassin, profileAdvancedMage, profileAdvancedWarrior, profileBeginnerAssassin, profileBeginnerMage, profileBeginnerWarrior, profileIntermediateAssassin, profileIntermediateMage, profileIntermediateWarrior } from "../common/kigardProfiles";

export interface SolutionProps {
    ind: Individual;
    masterData: MasterDataOutfit;
    character: Attributes;
};

export function Solution({ind, masterData, character}: SolutionProps) {

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
                <Td key="td-solution-name">{equipment.name}</Td>
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

    return (
        <div className="solution-wrapper">
            <div className="solution-character">
                <div> Personnage final </div>
                <div> Con: {ind.phenotype.con} </div>
                <div> For: {ind.phenotype.str} </div>
                <div> Int: {ind.phenotype.int} </div>
                <div> Dex: {ind.phenotype.dex} </div>
                <div> Chance: {ind.phenotype.lck} </div>
                <div> Précision: {ind.phenotype.acc} </div>
                <div> Esquive: {ind.phenotype.dodge} </div>
                <div> MM: {ind.phenotype.mm} </div>
                <div> RM: {ind.phenotype.mr} </div>
            </div>

            <div className="solution-equipment">
                <span> Equipement (poids: {ind.carriedWeight} / {character.allowedWeight}): </span>
                <span> Score: {ind.fitness.fitness.toFixed(4)}</span>
                <Table id="table-solution">
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
                    <Table id="table-fitness-offense">
                        <Thead>
                            <Tr><Td>Profils</Td> <Td>Débutant</Td> <Td>Intermédiaire</Td> <Td>Avancé</Td> </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>Guerrier</Td>
                                <Td>{ind.fitness.offenseBeginnerWarrior.toFixed(0)} / {profileBeginnerWarrior.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateWarrior.toFixed(0)} / {profileIntermediateWarrior.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedWarrior.toFixed(0)} / {profileAdvancedWarrior.pv}</Td>
                            </Tr>
                            <Tr>
                                <Td>Assassin</Td>
                                <Td>{ind.fitness.offenseBeginnerAssassin.toFixed(0)} / {profileBeginnerAssassin.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateAssassin.toFixed(0)} / {profileIntermediateAssassin.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedAssassin.toFixed(0)} / {profileAdvancedAssassin.pv}</Td>
                            </Tr>
                            <Tr>
                                <Td>Mage</Td>
                                <Td>{ind.fitness.offenseBeginnerMage.toFixed(0)} / {profileBeginnerMage.pv}</Td>
                                <Td>{ind.fitness.offenseIntermediateMage.toFixed(0)} / {profileIntermediateMage.pv}</Td>
                                <Td>{ind.fitness.offenseAdvancedMage.toFixed(0)} / {profileAdvancedMage.pv}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </div>

                <div>
                    <span>PV perdus après attaques par profil de l'opposant:</span>
                    <Table id="table-fitness-defense">
                        <Thead>
                            <Tr><Td>Profils</Td> <Td>Débutant</Td> <Td>Intermédiaire</Td> <Td>Avancé</Td> </Tr>
                        </Thead>
                        <Tbody>
                            <Tr>
                                <Td>Guerrier</Td>
                                <Td>{ind.fitness.defenseBeginnerWarrior.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateWarrior.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedWarrior.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                            <Tr>
                                <Td>Assassin</Td>
                                <Td>{ind.fitness.defenseBeginnerAssassin.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateAssassin.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedAssassin.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                            <Tr>
                                <Td>Mage</Td>
                                <Td>{ind.fitness.defenseBeginnerMage.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseIntermediateMage.toFixed(0)} / {character.pv}</Td>
                                <Td>{ind.fitness.defenseAdvancedMage.toFixed(0)} / {character.pv}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}