import './Character.css';
import { ReactElement, useEffect, useState } from "react";
import { Equipment, getDefaultOutfit, getEmptyEquipment, Localization, MasterDataOutfit, Outfit, outfitParts, Attributes, Quality } from '../common/kigardModels';
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

        const selectedEquipment = outfit[Localization[localization].toLowerCase() as keyof Outfit];

        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        const partName = outfitParts[idx].toLowerCase();
        const partMasterData = masterData[partName as keyof MasterDataOutfit];
        const standardPartMasterData = partMasterData.filter((equipment: Equipment) => {
            return equipment.quality === Quality.Standard;
        });

        let newEquipmentID = getQualityIdOfEquipment(parseInt(equipmentID), selectedEquipment.quality, standardPartMasterData.length);
        setEquipmentFromId(newEquipmentID, localization, standardPartMasterData);
    }

    const onChangeQuality = function(qualityID: string,  localization: Localization, masterData: MasterDataOutfit): void {

        const selectedEquipment = outfit[Localization[localization].toLowerCase() as keyof Outfit];

        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        const localizationName = outfitParts[idx].toLowerCase();
        const localizationMasterData = masterData[localizationName as keyof MasterDataOutfit]

        const standardLocalizationMasterData = localizationMasterData.filter((equipment: Equipment) => {
            return equipment.quality === Quality.Standard;
        });

        debugger;
        let standardMatchingId = getStandardIdOfEquipment(selectedEquipment.id, selectedEquipment.quality, standardLocalizationMasterData.length);
        let newEquipmentID = getQualityIdOfEquipment(standardMatchingId, parseInt(qualityID), standardLocalizationMasterData.length);
        setEquipmentFromId(newEquipmentID, localization, localizationMasterData);
    }

    const generateEquipment = function(localization: Localization, masterData: MasterDataOutfit,
        onChangeEquipment: (equipmentID: string, localization: Localization, masterData: MasterDataOutfit) => void): ReactElement {
        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        const partName = outfitParts[idx].toLowerCase();
        let partMasterData = masterData[partName as keyof MasterDataOutfit];
        let standardMasterData = partMasterData.filter((equipment: Equipment) => equipment.quality === Quality.Standard);

        let selectedEquipment = outfit[outfitParts[idx] as keyof Outfit];
        let standardMatchingId = getStandardIdOfEquipment(selectedEquipment.id, selectedEquipment.quality, standardMasterData.length);

        const selectKey = "select-" + partName;
        return (
            <Select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChangeEquipment(event.target.value, localization, masterData)}
                    value={standardMatchingId}>
                {partMasterData.filter((equipment: Equipment) => { return equipment.quality === Quality.Standard;})
                               .sort((a: Equipment, b: Equipment) => {
                                    if(a.name < b.name) { return -1; }
                                    if(a.name > b.name) { return 1; }
                                    return 0;
                                })
                                .map((equipment: Equipment) => (
                    <option key={selectKey + "-" + equipment.id} value={equipment.id}> {equipment.name} </option>
                ))}
            </Select>
        )
    }

    const getStandardIdOfEquipment = function(equipmentId: number, equipmentQuality: number, nbEquipmentsForLocalization: number): number {
        let standardMatchingId = equipmentId;
        if (equipmentQuality !== Quality.Standard) {
            const equipmentQualityID = equipmentId - nbEquipmentsForLocalization + 1;
            const equipmentMasterID = equipmentId - 2 * nbEquipmentsForLocalization + 2;
            standardMatchingId = equipmentQuality === Quality.Great ? equipmentQualityID : equipmentMasterID;
        }

        return standardMatchingId
    }

    const getQualityIdOfEquipment = function(standardEquipmentId: number, equipmentQuality: number, nbEquipmentsForLocalization: number): number {
        let newEquipmentID = standardEquipmentId;
        if (newEquipmentID !== 0) {
            if (equipmentQuality !== Quality.Standard) {
                const equipmentQualityID = standardEquipmentId + nbEquipmentsForLocalization - 1;
                const equipmentMasterID = standardEquipmentId + (2 * nbEquipmentsForLocalization) - 2;
                newEquipmentID = equipmentQuality === Quality.Great ? equipmentQualityID : equipmentMasterID;
            }
        }

        return newEquipmentID;
    }

    const setEquipmentFromId = function(equipmentID: number, localization: Localization, masterDataForLocalization: Equipment[]): void {
        const equipment = masterDataForLocalization.find(equipment => equipment.id === equipmentID);

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
                setOutfit({...outfit, lefthand: equipment || getEmptyEquipment(localization)});
                break;
            }
            case Localization.RightHand: {
                setOutfit({...outfit, righthand: equipment || getEmptyEquipment(localization)});
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

    const generateQuality = function(localization: Localization, masterData: MasterDataOutfit,
        onChangeQuality: (qualityID: string, localization: Localization, masterData: MasterDataOutfit) => void): ReactElement {
        const idx = outfitParts.findIndex((value) => value.toLowerCase() === Localization[localization].toLowerCase());
        let selectedEquipment = outfit[outfitParts[idx] as keyof Outfit];

        return (
            <Select onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChangeQuality(event.target.value, localization, masterData)}
                    value={selectedEquipment.quality}>
                <option key="select-standard" value={Quality.Standard}> </option>
                <option key="select-quality" value={Quality.Great}> de Qualité </option>
                <option key="select-master" value={Quality.Master}> de Maître </option>
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

    const generateRow = function(equipment: Equipment,
        onChangeEquipment: (equipmentID: string, localization: Localization, masterData: MasterDataOutfit) => void,
        onChangeQuality: (qualityID: string, localization: Localization, masterData: MasterDataOutfit) => void): ReactElement {
        return (
            <Tr key={"tr-initial-" + equipment.localization + "-" + equipment.id}>
                <Td className="td-title" key={"td-initial-" + equipment.localization + "-name"}>
                    {generateEquipment(equipment.localization, masterData, onChangeEquipment)}
                    {generateQuality(equipment.localization, masterData, onChangeQuality)}
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
                    return generateRow(outfit[part as keyof Outfit], onChangeEquipment, onChangeQuality);
                })}
            </Tbody>
        </Table>
        </div>
    )
}