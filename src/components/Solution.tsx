import { Table, Tbody, Td, Th, Thead } from "@chakra-ui/table";
import { Individual } from "../common/ga";
import { Equipment } from "../common/kigardModels";

export interface SolutionProps {
    data: Individual;
};

export function Solution({data}: SolutionProps) {

    return (
        <div>
            <span> Suggestions found: </span>
            <Table id="table-solution">
                <Thead>
                    {Object.keys(data).map((name) => (
                        <Th>name</Th>
                    ))}
                </Thead>
                <Tbody>
                    {Object.keys(data).map((name) => (
                        <Td>data[name]</Td>
                    ))}
                </Tbody>
            </Table>
        </div>
    )
}