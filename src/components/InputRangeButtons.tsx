import './InputRangeButtons.css';
import { useState } from "react";

interface InputRangeProps {
    defaultVal: number;
    min: number;
    max: number;
    step: number;
    label: string;
    id: string;
    onChange: (val: number) => void
}

export function InputRangeButtons({defaultVal, min, max, step, label, id}: InputRangeProps) {
    const [value, setValue] = useState<number>(defaultVal);

    return (
         <div className="inputrange-wrapper" id={id}>           
            <label className="inputrange-one">{label}</label>    
            <input className="inputrange-two" type="number" min={min} max={max} step={step} value={value} onChange={(event) => { setValue(Number(event.target.value)); }}/>           
        </div>    
    )
}