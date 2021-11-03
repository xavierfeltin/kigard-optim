import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { ReactElement } from "react";
import { Individual } from "../common/ga";
import { Attributes, defaultEquipment, MasterDataOutfit, outfitParts } from "../common/kigardModels";

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
        row.push(thWeight);

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
            </Tr>
        )
    };

    return (
        <div>
            <span> Suggestions found (weight: {ind.carriedWeight} / {character.allowedWeight}): </span>
            <span> Fitness: {ind.fitness.toFixed(4)}</span>
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