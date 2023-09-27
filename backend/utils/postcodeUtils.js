const Regions = require('../constants/region');

function extractInitialUppercaseLetters(str) {
    const match = str.match(/^[A-Z]+/);
    return match ? match[0] : '';
}

function findRegionNumber(postcode) {
    const outwardPostcode = extractInitialUppercaseLetters(postcode);

    for (const regionKey in Regions) {
        const region = Regions[regionKey];
        if (region.outwardPostcodes.includes(outwardPostcode)) {
            return region.number;
        }
    }
    return -1;
}

function isPureDigital(query) {
    const pureDigitalRegex = /^\d+$/; // Regular expression to match pure digits
    return pureDigitalRegex.test(query); // Test the input against the regular expression
}

function verifyValueInRegion(value) {
    const allowedValues = [1,2,3,4,5,6,7,8,9,10,11,13,14];
    if (typeof value === 'number') {
        return allowedValues.includes(value);
    } else if (typeof value === 'string') {
        const regionNumber = parseInt(value);
        return !isNaN(regionNumber) && allowedValues.includes(regionNumber);
    } else {
        return false;
    }
}



function verifyStringFormat(str) {
    return /^[A-Z][A-Z0-9]*$/.test(str);
}




module.exports = {
    findRegionNumber,
    extractInitialUppercaseLetters,
    isPureDigital,
    verifyValueInRegion,
    verifyStringFormat
};
