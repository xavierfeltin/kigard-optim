import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Configuration, Individual } from './common/ga';
import { Attributes, defaultAttributes, Equipment, generateEquipmentFromJSON } from './common/kigardModels';
import { Character } from './components/Character';
import { Simulation } from './components/Simulation';
import { Solution } from './components/Solution';
import equipentJSON from './data/head_equipment.json';

function App() {

  const [masterData, setMasterdata] = useState<Equipment[]>([]);
  const [simuConfiguration, setConfiguration] = useState<Configuration>({
    data: {...defaultAttributes},
    populationSize: 20,
    selectCutoff: 0.1,
    keepPreviousRatio: 0.1,
    newIndividualRatio: 0.1,
    parentSelectionStrategy: "tournament",
    crossoverStrategy: "",
    crossoverParentRatio: 0.5,
    tournamentSize: 5
  });
  const [suggestion, setSuggestion] = useState<Individual | undefined>(undefined);

  useEffect(() => {
    if (masterData.length === 0) {
      const equipments = generateEquipmentFromJSON(equipentJSON);
      setMasterdata(equipments);
    }
  }, [masterData]);

  const handleCharacterChange = useCallback((character: Attributes) => {
    setConfiguration({...simuConfiguration, data: character})
  }, [simuConfiguration]);

  const handleSimulationStart = useCallback(() => {

  }, []);

  const handleSimulationStop = useCallback(() => {

  }, []);

  const handleSimulationNewIteration = useCallback((ind: Individual) => {
    setSuggestion({...ind});
  }, []);

  return (
    <div>
      <Character onChange={handleCharacterChange}/>
      <Simulation configuration={simuConfiguration} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      {suggestion &&
        <Solution data={suggestion}/>
      }
    </div>
  );
}

export default App;
