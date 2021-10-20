import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import { Individual } from "../common/ga";
import { Attributes } from "../common/kigardModels";

export interface SolutionProps {
    data: Individual;
};

export function Solution({data}: SolutionProps) {

    const generateHeader = function(): JSX.Element[] {
        const row: JSX.Element[] = [];

        const th = <Th key="th-solution-name">Nom</Th>
        row.push(th);

        Object.keys(data.phenotype[0].attributes).forEach((name: string) => {
            const id = "th-solution-" + name;
            const th = <Th key={id}>{name}</Th>
            row.push(th);
        });
        return row;
    }

    const generateRow = function(): JSX.Element[] {
        const row: JSX.Element[] = [];

        const td = <Td key="td-solution-name">{data.phenotype[0].name}</Td>
        row.push(td);

        Object.keys(data.phenotype[0].attributes).forEach((name: string) => {
            const id = "td-solution-" + name;
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