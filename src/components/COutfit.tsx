import './Character.css';
import { ChangeEventHandler, ReactElement, useEffect, useState } from "react";
import { Equipment, getDefaultOutfit, Localization, MasterDataOutfit, Outfit, outfitParts } from '../common/kigardModels';
import { Select } from '@chakra-ui/select';

export interface OutfitProps {
    masterData: MasterDataOutfit;
    onValueChange: (attributes: Outfit) => void;
}

export function COutfit({masterData, onValueChange}: OutfitProps) {
    const [outfit, setOutfit] = useState<Outfit>(getDefaultOutfit());

    useEffect(() => {
        onValueChange && onValueChange(outfit);
    }, [outfit, onValueChange]);

    const onChangeEquipment = function(e: React.ChangeEventHandler<HTMLSelectElement>): void {
        //setOutfit({...outfit, mm: v}
    }

    const generateEquipment = function(localization: Localization, masterData: MasterDataOutfit, onChangeEquipment: (e: React.ChangeEventHandler<HTMLSelectElement>) => void): ReactElement {
        const partName = outfitParts[localization].toLowerCase();
        let partMasterData = masterData[partName as keyof MasterDataOutfit];

        return (
            <Select onChange={onChangeEquipment}>
                {partMasterData.map((equipment: Equipment) => (
                    <option value={equipment.id}> {equipment.name} </option>
                ))}
            </Select>
        )
    }

    return (
        <div>
            <div>
                <label className="select-one"> Tête </label>
                {generateEquipment(Localization.Head, masterData, onChangeEquipment)}
                <label className="select-one"> Buste </label>
                {generateEquipment(Localization.Body, masterData, onChangeEquipment)}
                <label className="select-one"> Main gauche </label>
                {generateEquipment(Localization.Lefthand, masterData, onChangeEquipment)}
                <label className="select-one"> Arme </label>
                {generateEquipment(Localization.RightHand, masterData, onChangeEquipment)}
                <label className="select-one"> Pieds </label>
                {generateEquipment(Localization.Feet, masterData, onChangeEquipment)}
            </div>
        </div>
    )
}