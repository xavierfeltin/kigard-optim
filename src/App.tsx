import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { GAParameters, Individual } from './common/ga';
import { Attributes, defaultAttributes, defaultEquipment, generateEquipmentFromJSON, Localization, MasterDataOutfit, Profile } from './common/kigardModels';
import { Character } from './components/Character';
import { Simulation } from './components/Simulation';
import { Solution } from './components/Solution';
import headEquipmentJSON from './data/head_equipment.json';
import feetEquipmentJSON from './data/feet_equipment.json';
import bodyEquipmentJSON from './data/body_equipment.json';
import leftHandEquipmentJSON from './data/left_hand_equipment.json';
import { GAConfiguration } from './components/GAConfiguration';

function App() {

  const [masterData, setMasterData] = useState<MasterDataOutfit>({
    head: [],
    body: [],
    leftHand: [],
    rightHand: [],
    fetish: [],
    feet: []
  });
  const [character, setCharacter] = useState<Attributes>({...defaultAttributes});
  const [simuParameters, setSimuParameters] = useState<GAParameters>({
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
  const [suggestion, setSuggestion] = useState<Individual | undefined>(undefined);

  useEffect(() => {
    const headEquipments = generateEquipmentFromJSON(headEquipmentJSON);
    const feetEquipments = generateEquipmentFromJSON(feetEquipmentJSON);
    const bodyEquipments = generateEquipmentFromJSON(bodyEquipmentJSON);
    const leftHandEquipments = generateEquipmentFromJSON(leftHandEquipmentJSON);

    const emptyHead = {...defaultEquipment};
    emptyHead.name = "Casque non porté";

    const emptyFeet = {...defaultEquipment};
    emptyFeet.name = "Chaussures non portées";
    emptyFeet.localization = Localization.Feet;

    const emptyBody = {...defaultEquipment};
    emptyBody.name = "Armure non portée";
    emptyBody.localization = Localization.Body;

    const emptyLeftHand = {...defaultEquipment};
    emptyLeftHand.name = "Main gauche vide";
    emptyLeftHand.localization = Localization.Lefthand;

    const masterData: MasterDataOutfit = {
      head: [emptyHead, ...headEquipments],
      body: [emptyBody, ...bodyEquipments],
      leftHand: [emptyLeftHand, ...leftHandEquipments],
      rightHand: [],
      feet: [emptyFeet, ...feetEquipments],
      fetish: []
    }
    setMasterData(masterData);
  }, []);

  const handleCharacterChange = useCallback((updatedCharacter: Attributes) => {
    setCharacter({...updatedCharacter});
  }, []);

  const handleGAConfigurationChange = useCallback((updatedConfiguration: GAParameters) => {
    setSimuParameters({...updatedConfiguration});
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
      <GAConfiguration onValueChange={handleGAConfigurationChange}/>
      <Simulation character={character} parameters={simuParameters} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      {suggestion &&
        <Solution ind={suggestion} masterData={masterData} character={character}/>
      }
    </div>
  );
}

export default App;
