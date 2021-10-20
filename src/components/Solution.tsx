import { Table, Tbody, Td, Th, Thead } from "@chakra-ui/table";
import { Individual } from "../common/ga";

export interface SolutionProps {
    data: Individual;
};

export function Solution({data}: SolutionProps) {

    return (
        <div>
            <span> Suggestions found: </span>
            <Table id="table-solution">
                <Thead>
                    {Object.keys(data.phenotype[0].attributes).map(name => (
                        <Th>name</Th>
                    ))}
                </Thead>
                <Tbody>
                    {Object.keys(data.phenotype[0].attributes).map(name => (
                        <Td>data.phenotype[0].attributes[name]</Td>
                    ))}
                </Tbody>
            </Table>
        </div>
    )
}