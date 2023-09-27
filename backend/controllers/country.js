const Country = require('../models/country');
const countries = require('../constants/countries');
const logger = require("../utils/logger");



const initializeDatabase = async () => {
    try {
        // Delete all existing country documents from the database
        await Country.deleteMany({});
        logger.info('Deleted all documents from the countries collection');

        // Insert the new country documents into the database
        const result = await Country.insertMany(countries);
        logger.info(`Inserted ${result.length} documents into the countries collection`);
    } catch (err) {
        logger.error(err.message); // Logging any error.
        throw new Error('Error initializing database');
    }
};


//get country list
const getCountries = async () => {
    try {
        // Retrieve all documents from the countries collection
        const countries = await Country.find().select('name population landArea pvout carbonIntensity installedCapacity carbonBenefits electricityAvailability solarElectricityPercent');
        const countryWithUnits = addUnitsToCountryList(countries);
        return countryWithUnits
    } catch (err) {
        logger.error(err.message); // Logging any error.
        throw new Error('Error retrieving countries from database');
    }
};


const getCountryById = async function(id) {
    try {
        const country = await Country.findById(id);
        const countryWithUnits = addUnitsToCountry((country));
        const countryWithBenefitResult = processCountryPanel(countryWithUnits);
        return processCarbonBenefits(countryWithBenefitResult);
    } catch (err) {
        logger.error(err.message); // Logging any error.
        throw err;
    }

}




const getCountryDetails = async function(id) {

    try {
        const country = await Country.findById(id);
        const countryWithUnits = addUnitsToCountry(country);
        const dataWithUnits = addUnitsToSolarPanels(countryWithUnits);
        return dataWithUnits;
    } catch (err) {
        logger.error(err.message); // Logging any error.
        throw err;
    }

}



const processCarbonBenefits = (countryWithUnits) => {
    const carbonBenefits = countryWithUnits.carbonBenefits.value;
    const trees = carbonToTrees(carbonBenefits);
    const households = co2ToHouseholdEnergy(carbonBenefits);
    const cars = co2ToCars(carbonBenefits);
    const results = {
        trees: {
            value: trees,
            description: 'Number of trees needed to offset the given amount of CO2 emissions'
        },
        households: {
            value: households,
            description: 'Number of households whose annual energy use equals the given amount of CO2 emissions'
        },
        cars: {
            value: cars,
            description: 'Number of cars whose annual emissions equal the given amount of CO2 emissions'
        }
    };
    return { ...countryWithUnits, carbonBenefitResults: results };

};


function processCountryPanel(country) {
    const solarPanels = country.solarPanels || []; // Handle case where solarPanels is missing or undefined
    let lowestPrice = Number.MAX_SAFE_INTEGER;
    let highestPrice = Number.MIN_SAFE_INTEGER;

    for (let panel of solarPanels) {
        const price = panel.price;
        if (price != null && price !== undefined) { // Exclude null and undefined prices
            lowestPrice = Math.min(lowestPrice, price);
            highestPrice = Math.max(highestPrice, price);
        }
    }

    const result = {
        typeCounts: solarPanels.length,
        priceRange: {
            lowest: lowestPrice === Number.MAX_SAFE_INTEGER ? null : lowestPrice,
            highest: highestPrice === Number.MIN_SAFE_INTEGER ? null : highestPrice
        }
    };
    // Create a new object with all the properties of the original country object, except for solarPanels
    const updatedCountry = {
        ...country,
        solarPanels: result,
    };

    return updatedCountry;
}




function co2ToCars(co2Emissions) {
    const emissionsPerCarPerYear = 4.6; // metric tons of CO2 per car per year
    const totalCars = co2Emissions / (emissionsPerCarPerYear * 1000); // convert to metric tons
    return parseInt(totalCars.toString());
}



function co2ToHouseholdEnergy(co2Emissions) {
    const emissionsPerHouseholdPerYear = 2.7; // metric tons of CO2 per household per year
    const totalHouseholds = co2Emissions / (emissionsPerHouseholdPerYear * 1000); // convert to metric tons
    return parseInt(totalHouseholds.toString());
}



function carbonToTrees(co2Emissions) {
    const carbonPerTree = 22; // kgCO2 per year per tree
    const treesNeeded = co2Emissions / carbonPerTree;
    return parseInt(treesNeeded.toString());
}



function addUnitsToSolarPanels(country) {
    const solarPanels = country.solarPanels
    const updatedSolarPanels = solarPanels.map(panel => {
        return {
            ...panel._doc,
            installedCapacity:{
                value: panel._doc.installedCapacity,
                unit: 'kWp'
            },
            tppout: {
                value: panel._doc.tppout,
                unit: 'MWh/year'
            },
            price: {
                value: panel._doc.price,
                unit: 'GBP'
            }
        };
    });

    const updatedCountry = {
        ...country,
        solarPanels: updatedSolarPanels,
    };

    return updatedCountry;
}






function addUnitsToCountryList(countries) {
    return countries.map(country => {
        return addUnitsToCountry(country)
    });
}

function addUnitsToCountry(country){
    return {
        ...country._doc,
        carbonIntensity: {
            value: country._doc.carbonIntensity,
            unit: 'gCO2'
        },
        installedCapacity: {
            value: country._doc.installedCapacity,
            unit: 'kW'
        },
        pvout: {
            value: country._doc.pvout,
            unit: 'kWh/kWp'
        },
        carbonBenefits: {
            value: country._doc.carbonBenefits,
            unit: 'kgCO2'
        },
        electricityAvailability: {
            value: country._doc.electricityAvailability,
            unit: 'MWh'
        },
    };
}



module.exports = {
    getCountries,
    initializeDatabase,
    getCountryById,
    getCountryDetails,
    carbonToTrees
};
