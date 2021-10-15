import { Equipment } from "../common/kigardModels";

export interface SolutionProps {
    data: Equipment;
};

export function Solution({data}: SolutionProps) {

    return (
        <div> 
            <span> Suggestion found: </span>
            <table>
                <th>
                    <td> </td>
                </th>
                <tbody>

                </tbody>
            </table>
        </div>
    )
}