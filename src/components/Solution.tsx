import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { ReactElement } from "react";
import { Configuration, Individual } from "../common/ga";
import { Attributes, Character, defaultEquipment, MasterDataOutfit, outfitParts } from "../common/kigardModels";

export interface SolutionProps {
    ind: Individual;
    masterData: MasterDataOutfit;
    character: Attributes;
};

export function Solution({ind, masterData, character}: SolutionProps) {

    const generateHeader = function(): JSX.Element[] {
        const row: JSX.Element[] = [];

        const th = <Th key="th-solution-name">Nom</Th>
        row.push(th);

        Object.keys(masterData.head[0].attributes).forEach((name: string) => {
            const id = "th-solution-" + name;
            const th = <Th key={id}>{name}</Th>
            row.push(th);
        });
        return row;
    }

    const generateRow = function(equipmentID: number, outfitPartID: number): ReactElement {
        const partIndex = outfitParts[outfitPartID];
        const partOutfit = masterData[partIndex as keyof MasterDataOutfit];
        const equipment = partOutfit.find(value => value.id === equipmentID) || defaultEquipment;

        console.log("part index: " + partIndex + ", equipmentID: " + equipmentID);
        console.log(partOutfit);

        return (
            <Tr key={"tr-solution-" + outfitPartID}>
                <Td key="td-solution-name">{equipment.name}</Td>
                {Object.keys(equipment.attributes).map((name: string) => (
                    <Td key={"td-solution-" + name}>{equipment.attributes[name as keyof Attributes]}</Td>
                ))}
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