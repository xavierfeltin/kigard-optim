import { Table, Tbody, Td, Th, Thead } from "@chakra-ui/table";
import { Equipment } from "../common/kigardModels";

export interface SolutionProps {
    data: Equipment;
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