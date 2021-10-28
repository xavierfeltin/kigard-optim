import './GAConfiguration.css';
import { useEffect, useState } from "react";
import { Profile } from '../common/kigardModels';
import { Select } from '@chakra-ui/select';
import { GAParameters } from '../common/ga';

export interface GAConfigurationProps {
    onValueChange: (parameters: GAParameters) => void
}

export function GAConfiguration({onValueChange}: GAConfigurationProps) {

    const [configuration, setConfiguration] = useState<GAParameters>({
        populationSize: 20,
        selectCutoff: 0.1,
        keepPreviousRatio: 0.1,
        newIndividualRatio: 0.1,
        parentSelectionStrategy: "tournament",
        crossoverStrategy: "",
        crossoverParentRatio: 0.5,
        tournamentSize: 5,
        optimProfile: Profile.mage        
    });

    useEffect(() => {
        onValueChange && onValueChange(configuration);
    }, [configuration, onValueChange]);

    return (
        <div className="select-wrapper">
            <label className="select-one"> Profil </label>
            <Select className="select-two" onChange={v => setConfiguration({...configuration, optimProfile: Profile[v.target.value as keyof typeof Profile]})}>
                <option value="mage">Mage</option>
                <option value="healer">Soigneur</option>
                <option value="tank">Tank</option>
                <option value="warrior">Guerrier</option>
                <option value="archer">Archer</option>
            </Select>        
        </div>
    )
}