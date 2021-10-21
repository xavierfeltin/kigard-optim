import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { GAParameters, Individual } from './common/ga';
import { Attributes, defaultAttributes, Equipment, generateEquipmentFromJSON, MasterDataOutfit } from './common/kigardModels';
import { Character } from './components/Character';
import { Simulation } from './components/Simulation';
import { Solution } from './components/Solution';
import headEquipmentJSON from './data/head_equipment.json';
import feetEquipmentJSON from './data/feet_equipment.json';

function App() {

  const [masterData, setMasterData] = useState<MasterDataOutfit>([]);
  const [character, setCharacter] = useState<Attributes>({...defaultAttributes});
  const [simuParameters, setSimuParameters] = useState<GAParameters>({
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
    const headEquipments = generateEquipmentFromJSON(headEquipmentJSON);
    const feetEquipments = generateEquipmentFromJSON(feetEquipmentJSON);
    
    const masterData: MasterDataOutfit = {
      head: headEquipments,
      body: [],
      leftHand: [],
      rightHand: [],
      feet: feetEquipments,
      fetish: []
    }
    setMasterData(masterData); 
  }, []);

  const handleCharacterChange = useCallback((updatedCharacter: Attributes) => {
    console.log("handleCharacterChange");
    setCharacter({...updatedCharacter});
  }, []);

  const handleSimulationStart = useCallback(() => {

  }, []);

  const handleSimulationStop = useCallback(() => {

  }, []);

  const handleSimulationNewIteration = useCallback((ind: Individual) => {
    setSuggestion({...ind});
  }, []);

  return (
    <div>
      <Character onValueChange={handleCharacterChange}/>
      <Simulation character={character} parameters={simuParameters} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      {suggestion &&
        <Solution data={suggestion}/>
      }
    </div>
  );
}

export default App;
