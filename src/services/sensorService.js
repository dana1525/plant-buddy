import { getPlantsByUser, logPlantStatus, updatePlantSensorData } from "./plantService";

const SIMULATION_RANGES = {
    soilMoisture: {min: 10,  max: 90,    unit: "%"  },
    temperature:  {min: 15,  max: 32,    unit: "°C" },
    lightLevel:   {min: 100, max: 10000, unit: "lux"}
};

const getRandomValue = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateSensorValues = (plantType) => {
    let ranges = {...SIMULATION_RANGES};

    switch(plantType.toLowerCase()){
        case "cactus":
            ranges.soilMoisture.max = 40;
            ranges.temperature.min = 20;
            break;
        case "fern":
            ranges.soilMoisture.min = 60;
            ranges.lightLevel.max = 5000;
            break;
        ////////////// DE COMPLETAT ////////////////
    }

    return {
        soilMoisture: getRandomValue(ranges.soilMoisture.min, ranges.soilMoisture.max),
        temperature:  getRandomValue(ranges.temperature.min,  ranges.temperature.max),
        lightLevel:   getRandomValue(ranges.lightLevel.min,   ranges.lightLevel.max)
    };
};

const simulateChangesOverTime = (currentValues) => {
    // 20% sansa ca planta sa fie udata (crestere intre 10-30%)
    const isWatered = Math.random() < 0.2 && currentValues.soilMoisture < 60;

    const soilMoistureChange = isWatered ? getRandomValue(5, 15) : getRandomValue(-4, -1); // scade mai rapid, urca mai lent

    const temperatureChange  = getRandomValue(-1, 1);
    const lightLevelChange   = getRandomValue(-200, 200);

    return {
        soilMoisture: Math.max(SIMULATION_RANGES.soilMoisture.min,
            Math.min(currentValues.soilMoisture + soilMoistureChange, SIMULATION_RANGES.soilMoisture.max)),
        temperature: Math.max(SIMULATION_RANGES.temperature.min,
            Math.min(currentValues.temperature + temperatureChange, SIMULATION_RANGES.temperature.max)),
        lightLevel: Math.max(SIMULATION_RANGES.lightLevel.min,
            Math.min(currentValues.lightLevel + lightLevelChange, SIMULATION_RANGES.lightLevel.max))
    };
};

const determineStatus = (sensorValues, plantType) => {
    const thresholds = getThreshholdsForPlantType(plantType);

    if(sensorValues.soilMoisture < thresholds.soilMoisture.min)
        return "Needs Water";
    if(sensorValues.soilMoisture > thresholds.soilMoisture.max)
        return "Overwatered";
    if(sensorValues.temperature < thresholds.temperature.min)
        return "Too Cold";
    if(sensorValues.temperature > thresholds.temperature.max)
        return "Too Hot";
    if(sensorValues.lightLevel < thresholds.lightLevel.min)
        return "Needs More Light";
    if(sensorValues.lightLevel > thresholds.lightLevel.max)
        return "Too Much Light";

    return "Healthy";
};


const getThreshholdsForPlantType = (plantType) => {
    let thresholds = {
        soilMoisture: {min: 30,   max: 70  },
        temperature:  {min: 18,   max: 28  }, 
        lightLevel:   {min: 1000, max: 8000}
    };

    switch(plantType.toLowerCase()){
        case "cactus":
            thresholds.soilMoisture = {min: 15,   max: 30   };
            thresholds.temperature  = {min: 20,   max: 32   };
            thresholds.lightLevel   = {min: 3000, max: 10000};
            break;
        case "fern":
            thresholds.soilMoisture = {min: 60,   max: 80  };
            thresholds.temperature  = {min: 18,   max: 24  };
            thresholds.lightLevel   = {min: 500,  max: 3000};
            break;
        ////////////// DE COMPLETAT ////////////////
    }

    return thresholds;
};

export const initializePlantSensors = async(plantId, plantType) => {
    const sensorValues = generateSensorValues(plantType);
    const status = determineStatus(sensorValues, plantType);

    await updatePlantSensorData(plantId, sensorValues, status);
    return {sensorValues, status};
};

export const updateAllPlantSensors = async(userId) => {
    const plants = await getPlantsByUser(userId);

    const updatePromises = plants.map(async (plant) => {
        let sensorValues;

        if(plant.sensors)
            sensorValues = simulateChangesOverTime(plant.sensors);
        else
            sensorValues = generateSensorValues(plant.type);

        const status = determineStatus(sensorValues, plant.type);
        await updatePlantSensorData(plant.id, sensorValues, status);

        await logPlantStatus(plant.id, sensorValues, status);
        await pruneLogs(plant.id, 100);

        return {id: plant.id, sensorValues, status};
    });
    return Promise.all(updatePromises);
};