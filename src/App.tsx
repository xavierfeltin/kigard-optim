import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Configuration } from './common/ga';
import { Attributes, defaultAttributes, Equipment, generateEquipmentFromJSON } from './common/kigardModels';
import { Character } from './components/Character';
import { Simulation } from './components/Simulation';
import equipentJSON from './data/head_equipment.json';

function App() {
  
  const [masterData, setMasterdata] = useState<Equipment[]>([]);
  const [simuConfiguration, setConfiguration] = useState<Configuration>({
    data: {...defaultAttributes}
  });
  const [character, setCharacter] = useState<Attributes>({...defaultAttributes});
  const [suggestion, setSuggestion] = useState<Equipment | undefined>(undefined);

  useEffect(() => {
    if (masterData.length === 0) {
      const equipments = generateEquipmentFromJSON(equipentJSON);
      setMasterdata(equipments);
    }    
  }, [masterData]);

  useEffect(() => {
    setConfiguration({...simuConfiguration, data: character})
  }, [character]);

  const handleCharacterChange = useCallback((character: Attributes) => {   
    setCharacter(character);
  }, []);
  
  const handleSimulationStart = useCallback(() => {

  }, []);

  const handleSimulationStop = useCallback(() => {

  }, []);

  const handleSimulationNewIteration = useCallback((equipment: Equipment) => {
    setSuggestion({...equipment});
  }, []);

  return (
    <div>
      <Character onChange={handleCharacterChange}/>
      <Simulation configuration={simuConfiguration} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      if (suggestion) {
        <Solution data={suggestion}/>
      }
    </div>
  );
}


export default App;
