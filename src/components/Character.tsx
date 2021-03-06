import './Character.css';
import { useEffect, useState } from "react";
import { Attributes } from '../common/kigardModels';
import { InputRangeButtons } from "./InputRangeButtons";

export interface CharacterProps {
    onValueChange: (attributes: Attributes) => void;
    className: string;
}

export function Character({onValueChange, className}: CharacterProps) {

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
        minDamage: 0,
        maxDamage: 0,
        minRange: 0,
        maxRange: 0,
        allowedWeight: 5,
        pv: 50,
        mp: 25,
        nbSpellAttach: 0,
        nbProjectiles: 0,
        isBow: 0,
        isRifle: 0,
        burning: 0,
        regeneration: 0,
        poison: 0,
        bleeding: 0,
        knockedOut: 0,
        breach: 0,
        terror: 0,
        necrosis: 0
    });

    useEffect(() => {
        onValueChange && onValueChange(character);
    }, [character, onValueChange]);

    return (
        <div className={className}>
            <p> Personnage actuel </p>
            <InputRangeButtons id="ch-con" label="Con" min={5} max={30} defaultVal={character.con} step={1} onChange={v => setCharacter({...character, con: v, allowedWeight: Math.floor((v + character.str) / 2), pv: v * 10})}/>
            <InputRangeButtons id="ch-str" label="For" min={5} max={30} defaultVal={character.str} step={1} onChange={v => setCharacter({...character, str: v, allowedWeight: Math.floor((v + character.con) / 2)})}/>
            <InputRangeButtons id="ch-dex" label="Dex" min={5} max={30} defaultVal={character.dex} step={1} onChange={v => setCharacter({...character, dex: v})}/>
            <InputRangeButtons id="ch-int" label="Int" min={5} max={30} defaultVal={character.int} step={1} onChange={v => setCharacter({...character, int: v})}/>
            <InputRangeButtons id="ch-lck" label="Chance" min={5} max={30} defaultVal={character.lck} step={1} onChange={v => setCharacter({...character, lck: v})}/>
            <InputRangeButtons id="ch-acc" label="Pre" min={5} max={100} defaultVal={character.acc} step={5} onChange={v => setCharacter({...character, acc: v})}/>
            <InputRangeButtons id="ch-dodge" label="Esq" min={5} max={100} defaultVal={character.dodge} step={5} onChange={v => setCharacter({...character, dodge: v})}/>
            <InputRangeButtons id="ch-mm" label="MM" min={5} max={100} defaultVal={character.mm} step={5} onChange={v => setCharacter({...character, mm: v})}/>
            <InputRangeButtons id="ch-mr" label="RM" min={5} max={100} defaultVal={character.mr} step={5} onChange={v => setCharacter({...character, mr: v})}/>
        </div>
    )
}