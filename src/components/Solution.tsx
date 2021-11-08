import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { ReactElement } from "react";
import { Individual } from "../common/ga";
import { Attributes, defaultEquipment, Equipment, MasterDataOutfit, outfitParts } from "../common/kigardModels";

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
        <div>
            <span> Suggestions found (weight: {ind.carriedWeight} / {character.allowedWeight}): </span>
            <span> Fitness: {ind.fitness.fitness.toFixed(4)}</span>
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
    )
}