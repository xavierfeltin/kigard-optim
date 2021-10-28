import './Character.css';
import { useEffect, useState } from "react";
import { Attributes } from '../common/kigardModels';
import { InputRangeButtons } from "./InputRangeButtons";
import { Select } from '@chakra-ui/select';

export interface CharacterProps {
    onValueChange: (attributes: Attributes) => void
}

export function Character({onValueChange}: CharacterProps) {

    const [character, setCharacter] = useState<Attributes>({
        con: 5,
        str: 5,
        dex: 5,
        int: 5,
        lck: 0,
        acc: 15,
        dodge: 15,
        mm: 15,
        mr: 15,
        rpm: 1,
        rpv: 0,
        armor: 0,
        physicalDmg: 0,
        magicalDmg: 0,
        allowedWeight: 5,
        nbSpellAttach: 0
    });

    useEffect(() => {
        onValueChange && onValueChange(character);
    }, [character, onValueChange]);

    return (
        <div className="sheet">
            <p> Personnage </p>
            <InputRangeButtons id="ch-con" label="Con" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v, allowedWeight: Math.floor((v + character.con) / 2)})}/>
            <InputRangeButtons id="ch-str" label="For" min={5} max={30} defaultVal={character.str} step={1} onChange={v => setCharacter({...character, str: v, allowedWeight: Math.floor((v + character.con) / 2)})}/>
            <InputRangeButtons id="ch-dex" label="Dex" min={5} max={30} defaultVal={character.dex} step={1} onChange={v => setCharacter({...character, dex: v})}/>
            <InputRangeButtons id="ch-int" label="Int" min={5} max={30} defaultVal={character.int} step={1} onChange={v => setCharacter({...character, int: v})}/>
            <InputRangeButtons id="ch-lck" label="Chance" min={5} max={30} defaultVal={character.lck} step={1} onChange={v => setCharacter({...character, lck: v})}/>
            <InputRangeButtons id="ch-acc" label="Pre" min={5} max={100} defaultVal={character.acc} step={5} onChange={v => setCharacter({...character, acc: v})}/>
            <InputRangeButtons id="ch-dodge" label="Esq" min={5} max={100} defaultVal={character.dodge} step={5} onChange={v => setCharacter({...character, dodge: v})}/>
            <InputRangeButtons id="ch-mm" label="MM" min={5} max={100} defaultVal={character.mm} step={5} onChange={v => setCharacter({...character, mm: v})}/>
            <InputRangeButtons id="ch-mr" label="RM" min={5} max={100} defaultVal={character.mr} step={5} onChange={v => setCharacter({...character, mr: v})}/>
            <InputRangeButtons id="ch-rpm" label="PM/tr" min={1} max={30} defaultVal={character.rpm} step={1} onChange={v => setCharacter({...character, rpm: v})}/>
            <InputRangeButtons id="ch-rpv" label="PV/tr" min={0} max={30} defaultVal={character.rpv} step={1} onChange={v => setCharacter({...character, rpv: v})}/>
            <InputRangeButtons id="ch-armor" label="Armure" min={0} max={30} defaultVal={character.armor} step={1} onChange={v => setCharacter({...character, armor: v})}/>
            <InputRangeButtons id="ch-physicalDamage" label="Dmg P." min={0} max={50} defaultVal={character.physicalDmg} step={1} onChange={v => setCharacter({...character, physicalDmg: v})}/>
            <InputRangeButtons id="ch-magicalDamage" label="Dmg M." min={0} max={50} defaultVal={character.magicalDmg} step={1} onChange={v => setCharacter({...character, magicalDmg: v})}/>
        </div>
    )
}