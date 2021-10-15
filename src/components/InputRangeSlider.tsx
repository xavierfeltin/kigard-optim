import './InputRangeSlider.css';
import { useState } from "react";
import { Tooltip } from "@chakra-ui/react"

interface InputRangeProps {
    defaultVal: number;
    min: number;
    max: number;
    step: number;
    label: string;
    id: string;
    name: string;
    tooltip: string;
    onChange: (val: number) => void
}

export function InputRangeSlider({defaultVal, min, max, step, label, id, name, tooltip, onChange}: InputRangeProps) {
    const [value, setValue] = useState<number>(defaultVal);

    const handleOnChange = function(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.valueAsNumber; 
        setValue(newValue);
        onChange(newValue);
    }

    return (
        <Tooltip label={tooltip} placement="top" closeOnClick={false} bg="blue.50" color="black" offset={[0, -20]}>
        <div className="inputrange-wrapper">           
            <label className="inputrange-one">{label}</label>    
            <input className="inputrange-two" type="range" id={id} name={name} min={min} max={max} step={step} value={value} onChange={handleOnChange}/>
            <span className="inputrange-three">{value}</span>
        </div>    
        </Tooltip>    
    )
}