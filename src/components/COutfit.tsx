import './Character.css';
import { ReactElement, useEffect, useState } from "react";
import { Equipment, getDefaultOutfit, getEmptyEquipment, Localization, MasterDataOutfit, Outfit, outfitParts, Attributes } from '../common/kigardModels';
import { Select } from '@chakra-ui/select';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';

export interface OutfitProps {
    masterData: MasterDataOutfit;
    onValueChange: (attributes: Outfit) => void;
    className: string;
}

export function COutfit({masterData, onValueChange, className}: OutfitProps) {
    const [outfit, setOutfit] = useState<Outfit>(getDefaultOutfit());

    useEffect(() => {
        onValueChange && onValueChange(outfit);
    }, [outfit, onValueChange]);

    const onChangeEquipment = function(equipmentID: string,  localization: Localization, masterData: MasterDataOutfit): void {
        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        const partName = outfitParts[idx].toLowerCase();
        const partMasterData = masterData[partName as keyof MasterDataOutfit];
        const equipment = partMasterData.find(equipment => equipment.id === parseInt(equipmentID));

        switch(localization) {
            case Localization.Head: {
                setOutfit({...outfit, head: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.Body: {
                setOutfit({...outfit, body: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.Lefthand: {
                setOutfit({...outfit, leftHand: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.RightHand: {
                setOutfit({...outfit, rightHand: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.Feet: {
                setOutfit({...outfit, feet: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.Container : {
                setOutfit({...outfit, container: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.Fetish: {
                setOutfit({...outfit, fetish: equipment || getEmptyEquipment(localization)});
                break;
            }
        }
    }

    const generateEquipment = function(localization: Localization, masterData: MasterDataOutfit, onChangeEquipment: (equipmentID: string, localization: Localization, masterData: MasterDataOutfit) => void): ReactElement {
        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        const partName = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[partName as keyof MasterDataOutfit];
        const selectKey = "select-" + partName;

        return (
            <Select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChangeEquipment(event.target.value,  localization, masterData)}
                    value={outfit[outfitParts[idx] as keyof Outfit].id}>
                {partMasterData.map((equipment: Equipment) => (
                    <option key={selectKey + "-" + equipment.id} value={equipment.id}> {equipment.name} </option>
                ))}
            </Select>
        )
    }

    const kigardHeader: string[] = ["armor", "acc", "dodge", "mm", "mr", "dex", "int", "str", "rpm", "rpv"];
    const kigardHeaderFR: string[] = ["Arm", "Pre", "Esq", "MM", "RM", "Dex", "Int", "For", "PM/Tr", "PV/Tr"];

    const generateHeader = function(): JSX.Element[] {
        const row: JSX.Element[] = [];

        const thName = <Th key="th-initial-name">Nom</Th>
        row.push(thName);

        kigardHeaderFR.forEach((name: string) => {
            const id = "th-initial-" + name;
            const th = <Th key={id}>{name}</Th>
            row.push(th);
        });

        const thWeight = <Th key="th-initial-weight">Poids</Th>
        const thHands = <Th key="th-initial-hands">Mains</Th>
        const thInfo = <Th key="th-initial-info">Information</Th>

        row.push(thWeight);
        row.push(thHands);
        row.push(thInfo);

        return row;
    }

    const generateRow = function(equipment: Equipment, onChangeEquipment: (equipmentID: string, localization: Localization, masterData: MasterDataOutfit) => void): ReactElement {
        return (
            <Tr key={"tr-initial-" + equipment.localization + "-" + equipment.id}>
                <Td className="td-title" key={"td-initial-" + equipment.localization + "-name"}>
                    {generateEquipment(equipment.localization, masterData, onChangeEquipment)}
                </Td>
                {kigardHeader.map((name: string) => (
                    <Td key={"td-initial-" + equipment.localization + "-" + name}>{equipment.attributes[name as keyof Attributes]}</Td>
                ))}
                <Td key={"td-initial-" + equipment.localization + "-weight"}>{equipment.weight}</Td>
                <Td key={"td-initial-" + equipment.localization + "-hands"}>{equipment.hands}</Td>
                <Td key={"td-initial-" + equipment.localization + "-info"}>{generateInformation(equipment)}</Td>
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
        <div className={className}>
        <Table id="table-initial" className="table-outfit">
            <Thead>
                <Tr>{generateHeader()}</Tr>
            </Thead>
            <Tbody>
                {outfitParts.map((part) => {
                    return generateRow(outfit[part as keyof Outfit], onChangeEquipment);
                })}
            </Tbody>
        </Table>
        </div>
    )
}