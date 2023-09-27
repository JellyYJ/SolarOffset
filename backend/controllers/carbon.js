const Carbon = require('../models/carbonIntensity');
const Country = require('../models/country');
const errorCodes = require('../constants/errorCodes');
const headers = {
    'Accept':'application/json'
};
const postcodeUtils = require('../utils/postcodeUtils');
const logger = require("../utils/logger");


exports.queryCarbonIntensity = async function (req, res) {
    const query = req.params.query;

    if (query === null || query.trim() === '') {
        return res.status(errorCodes.INVALID_INPUT.code).json({message: errorCodes.INVALID_INPUT.message});
    }
    let regionId;
    //verify query
    if(postcodeUtils.isPureDigital(query)){
        if(postcodeUtils.verifyValueInRegion(query)){
            regionId = query;
        }else{
            return res.status(errorCodes.INVALID_INPUT.code).json({message: errorCodes.INVALID_INPUT.message});
        }
    }else {
       if(postcodeUtils.verifyStringFormat(query)){
           regionId = postcodeUtils.findRegionNumber(query);
           if(regionId == -1){
               return res.status(errorCodes.INVALID_POSTCODE.code).json({message: errorCodes.INVALID_POSTCODE.message});
           }
       }else{
           return res.status(errorCodes.INVALID_POSTCODE.code).json({message: errorCodes.INVALID_POSTCODE.message});
       }
    }

    try {
        const carbonIntensity = await Carbon.findOne({
            data: {
                $elemMatch: { regionid: parseInt(regionId) }
            }
        });

        if (carbonIntensity) {
            console.log(`Found carbonIntensity data for ${query}`);
            return res.json(carbonIntensity);
        }

        // If data is not found in the databases, fetch it from the API
        let URL = `https://api.carbonintensity.org.uk/regional/regionid/${regionId}`;

        const apiResponse = await fetch(URL,
            {
                method: 'GET',
                headers: headers
            })
        const apiData = await apiResponse.json();

        // Store the data in the databases
        const newCarbonIntensity = new Carbon(apiData);

        await newCarbonIntensity.save();

        console.log(`Saved newCarbonIntensity data for ${query}`);

        // Return the data to the client
        return res.json(newCarbonIntensity);
    } catch (error) {
        console.error(error);
        return res.status(errorCodes.INTERNAL_SERVER_ERROR.code).json({message: errorCodes.INTERNAL_SERVER_ERROR.message});
    }
}



exports.getDateIntensityForUK = async function (req, res) {
    try {
        let URL = `https://api.carbonintensity.org.uk/intensity`;

        const apiResponse = await fetch(URL,
            {
                method: 'GET',
                headers: headers
            })
        const apiData = await apiResponse.json();

        console.log(`Get current UK intensity ${apiData}`);

        // Return the data to the client
        return res.json(apiData);
    } catch (error) {
        console.error(error);
        return res.status(errorCodes.INTERNAL_SERVER_ERROR.code).json({message: errorCodes.INTERNAL_SERVER_ERROR.message});
    }
}







exports.setCarbonOffset = async (payment) => {
    try {
        const countryId = payment.countryId;
        const panelId = payment.panelId;


        // Find the country object by ID
        const country = await Country.findOne({_id: countryId});

        if (!country) {
            // If the country doesn't exist, return an error
            const error = Error(`Country with ID ${countryId} not found`);
            logger.warn(error) // Logging database empty error.
            throw error;
        }

        // Find the solar panel object by ID
        const panel = country.solarPanels.find(panel => panel._id == panelId);

        if (!panel) {
            // If the panel doesn't exist, return an error
            const error = Error(`Solar panel with ID ${panelId} not found in country ${country.name}`);
            logger.warn(error) // Logging database empty error.
            throw error;
        }

        const numPanels = Number(payment.amountFunded) / Number(panel.price);

        // Calculate the amount of electricity generated in a year by the solar panels
        const electricityGenerated = panel.tppout * numPanels;

        // Calculate the amount of carbon offset offset by the solar panels
        const carbonOffset = electricityGenerated * country.carbonIntensity;

        // Restrict the result to two decimal places
        const carbonOffsetFormatted = carbonOffset.toFixed(2);

        // Update the payment object with the carbon offset value
        payment.carbonOffset = carbonOffsetFormatted;

        // Save the updated payment object
        await payment.save();
        return numPanels;

    } catch (err) {
        // Handle errors
        throw err
    }
};





