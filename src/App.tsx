import './App.css';
import { useCallback, useEffect, useState } from 'react';

import { GAParameters, Individual } from './common/ga';
import { Attributes, defaultAttributes, defaultEquipment, Equipment, EquipmentClass, generateEquipmentFromJSON, generateQualityEquipments, getDefaultOutfit, Localization, MasterDataOutfit, Outfit, Profile, Quality } from './common/kigardModels';
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
    optimProfile: Profile.mage,
    optimSimuTurns: [9, 12, 5, 14, 10]
  });
  const [suggestion, setSuggestion] = useState<Individual | undefined>(undefined);

  useEffect(() => {
    const headEquipments = generateEquipmentFromJSON(headEquipmentJSON, Localization.Head);
    const feetEquipments = generateEquipmentFromJSON(feetEquipmentJSON, Localization.Feet);
    const bodyEquipments = generateEquipmentFromJSON(bodyEquipmentJSON, Localization.Body);
    const leftHandEquipments = generateEquipmentFromJSON(leftHandEquipmentJSON, Localization.Lefthand);
    const rightHandEquipments = generateEquipmentFromJSON(rightHandEquipmentJSON, Localization.RightHand);
    const containerEquipments = generateEquipmentFromJSON(containerEquipmentJSON, Localization.Container);

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

    let qualityEquipment = generateQualityEquipments(headEquipments, Quality.Great, headEquipments.length);
    let masterEquipment = generateQualityEquipments(headEquipments, Quality.Master, headEquipments.length + qualityEquipment.length);
    let headMasterData = [emptyHead, ...headEquipments, ...qualityEquipment, ...masterEquipment];

    qualityEquipment = generateQualityEquipments(bodyEquipments, Quality.Great, bodyEquipments.length);
    masterEquipment = generateQualityEquipments(bodyEquipments, Quality.Master, bodyEquipments.length + qualityEquipment.length);
    let bodyMasterData = [emptyBody, ...bodyEquipments, ...qualityEquipment, ...masterEquipment];

    qualityEquipment = generateQualityEquipments(leftHandEquipments, Quality.Great, leftHandEquipments.length);
    masterEquipment = generateQualityEquipments(leftHandEquipments, Quality.Master, leftHandEquipments.length + qualityEquipment.length);
    let leftHandMasterData = [emptyLeftHand, ...leftHandEquipments, ...qualityEquipment, ...masterEquipment];

    qualityEquipment = generateQualityEquipments(rightHandEquipments, Quality.Great, rightHandEquipments.length);
    masterEquipment = generateQualityEquipments(rightHandEquipments, Quality.Master, rightHandEquipments.length + qualityEquipment.length);
    let rightHandMasterData = [emptyRightHand, ...rightHandEquipments, ...qualityEquipment, ...masterEquipment];

    qualityEquipment = generateQualityEquipments(feetEquipments, Quality.Great, feetEquipments.length);
    masterEquipment = generateQualityEquipments(feetEquipments, Quality.Master, feetEquipments.length + qualityEquipment.length);
    let feetMasterData = [emptyFeet, ...feetEquipments, ...qualityEquipment, ...masterEquipment];

    let fetishMasterData: Equipment[] = [];

    qualityEquipment = generateQualityEquipments(containerEquipments, Quality.Great, containerEquipments.length);
    masterEquipment = generateQualityEquipments(containerEquipments, Quality.Master, containerEquipments.length + qualityEquipment.length);
    let containerMasterData = [emptyContainer, ...containerEquipments, ...qualityEquipment, ...masterEquipment];

    const masterData: MasterDataOutfit = {
      head: headMasterData,
      body: bodyMasterData,
      lefthand: leftHandMasterData,
      righthand: rightHandMasterData,
      feet: feetMasterData,
      fetish: fetishMasterData,
      container: containerMasterData
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
      <div className="app-wrapper">
        <Character className="app-character" onValueChange={handleCharacterChange}/>
        <COutfit className="app-equipment" masterData={masterData} onValueChange={handleOutfitChange}/>
      </div>
      <GAConfiguration onValueChange={handleGAConfigurationChange}/>
      <Simulation character={character} outfit={outfit} parameters={simuParameters} masterData={masterData} onHasStarted={handleSimulationStart} onHasStopped={handleSimulationStop} onHasNewIteration={handleSimulationNewIteration}/>
      {suggestion &&
        <Solution ind={suggestion} masterData={masterData} character={character} parameters={simuParameters}/>
      }
    </div>
  );
}

export default App;
