import './App.css';
import { useCallback, useEffect, useState } from 'react';

import { GAParameters, Individual } from './common/ga';
import { Attributes, defaultAttributes, defaultEquipment, EquipmentClass, generateEquipmentFromJSON, getDefaultOutfit, Localization, MasterDataOutfit, Outfit, Profile } from './common/kigardModels';
import { Character } from './components/Character';
import { Simulation } from './components/Simulation';
import { Solution } from './components/Solution';
import { GAConfiguration } from './components/GAConfiguration';
import { COutfit } from './components/COutfit';

import headEquipmentJSON from './data/head_equipment.json';
import feetEquipmentJSON from './data/feet_equipment.json';
import bodyEquipmentJSON from './data/body_equipment.json';
import leftHandEquipmentJSON from './data/left_hand_equipment.json';
import rightHandEquipmentJSON from './data/right_hand_equipment.json';
import containerEquipmentJSON from './data/container_equipment.json';

function App() {

  const [masterData, setMasterData] = useState<MasterDataOutfit>({
    head: [],
    body: [],
    lefthand: [],
    righthand: [],
    fetish: [],
    feet: [],
    container: []
  });

  const [character, setCharacter] = useState<Attributes>({...defaultAttributes});

  const [outfit, setOutfit] = useState<Outfit>(getDefaultOutfit());

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
    const rightHandEquipments = generateEquipmentFromJSON(rightHandEquipmentJSON);
    const containerEquipments = generateEquipmentFromJSON(containerEquipmentJSON);

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

    const emptyRightHand = {...defaultEquipment};
    emptyRightHand.name = "Sans arme";
    emptyRightHand.localization = Localization.RightHand;
    emptyRightHand.pa = 6;

    const emptyContainer = {...defaultEquipment};
    emptyContainer.name = "Pas de conteneur";
    emptyContainer.localization = Localization.Container;
    emptyContainer.kind = EquipmentClass.Container;
    emptyContainer.attributes.nbProjectiles = 1;

    const masterData: MasterDataOutfit = {
      head: [emptyHead, ...headEquipments],
      body: [emptyBody, ...bodyEquipments],
      lefthand: [emptyLeftHand, ...leftHandEquipments],
      righthand: [emptyRightHand, ...rightHandEquipments],
      feet: [emptyFeet, ...feetEquipments],
      fetish: [],
      container: [emptyContainer, ...containerEquipments]
    }
    setMasterData(masterData);
  }, []);

  const handleCharacterChange = useCallback((updatedCharacter: Attributes) => {
    setCharacter({...updatedCharacter});
  }, []);

  const handleOutfitChange = useCallback((updatedOutfit: Outfit) => {
    setOutfit({...updatedOutfit});
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
      <COutfit  masterData={masterData} onValueChange={handleOutfitChange}/>
      <GAConfiguration onValueChange={handleGAConfigurationChange}/>
      <Simulation character={character} outfit={outfit} parameters={simuParameters} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      {suggestion &&
        <Solution ind={suggestion} masterData={masterData} character={character}/>
      }
    </div>
  );
}

export default App;
