import './Character.css';
import { useEffect, useState } from "react";
import { Attributes } from '../common/kigardModels';
import { InputRangeButtons } from "./InputRangeButtons";

export interface CharacterProps {
    onChange: (attributes: Attributes) => void
}

export function Character({onChange}: CharacterProps) {

    const [character, setCharacter] = useState<Attributes>({
        con: 5,
        str: 5,
        dex: 5,
        int: 5,
        lck: 0,
        acc: 15,
        dodge: 15,
        mm: 0,
        mr: 0,
        rpm: 0,
        rpv: 0,
        armor: 0,
        physicalDmg: 0,
        magicalDmg: 0
    });

    useEffect(() => {
        onChange(character);
    }, [character, onChange]);

    return (
        <div className="sheet">
            <p> Personnage </p>
            <InputRangeButtons id="ch-con" label="Con" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-str" label="For" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-dex" label="Dex" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-int" label="Int" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-lck" label="Chance" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-acc" label="Pre" min={5} max={100} defaultVal={character.con} step={5} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-dodge" label="Esq" min={5} max={100} defaultVal={character.con} step={5} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-mm" label="MM" min={5} max={100} defaultVal={character.con} step={5} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-mr" label="RM" min={5} max={100} defaultVal={character.con} step={5} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-rpm" label="PM/tr" min={1} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-rpv" label="PV/tr" min={0} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-armor" label="Armure" min={0} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-physicalDamage" label="Dmg P." min={0} max={50} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
            <InputRangeButtons id="ch-magicalDamage" label="Dmg M." min={0} max={50} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v})}/>
        </div>
    )
}