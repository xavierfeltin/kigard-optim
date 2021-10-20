import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { Individual } from "../common/ga";
import { Attributes } from "../common/kigardModels";

export interface SolutionProps {
    data: Individual;
};

export function Solution({data}: SolutionProps) {

    const generateHeader = function(): JSX.Element[] {
        const row: JSX.Element[] = [];
        Object.keys(data.phenotype[0].attributes).forEach((name: string, index: number) => {
            const id = "th-solution-" + index;
            const th = <Th key={id}>{name}</Th>
            row.push(th);
        });
        return row;
    }

    const generateRow = function(): JSX.Element[] {
        const row: JSX.Element[] = [];
        Object.keys(data.phenotype[0].attributes).forEach((name: string, index: number) => {
            const id = "td-solution-" + index;
            const td = <Td key={id}>{data.phenotype[0].attributes[name as keyof Attributes]}</Td>
            row.push(td);
        });
        return row;
    };

    return (
        <div>
            <span> Suggestions found: </span>
            <Table id="table-solution">
                <Thead>
                    <Tr>{generateHeader()}</Tr>
                </Thead>
                <Tbody>
                    <Tr>{generateRow()}</Tr>
                </Tbody>
            </Table>
        </div>
    )
}