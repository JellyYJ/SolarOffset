const mongoose = require('mongoose');

const solarPanelSchema = new mongoose.Schema({
    installationArea: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    installedCapacity: {
        type: Number,
        required: true,
        unit: 'kWp'
    },
    tppout: {
        type: Number,
        required: true,
        unit: 'MWh/year'
    },
    price: {
        type: Number,
        required: true,
        unit: 'GBP'
    }
});

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    population: {
        type: Number,
        required: true
    },
    landArea: {
        type: Number,
        required: true,
        unit: 'square kilometers'
    },
    description: {
        type: String,
        required: true
    },
    carbonIntensity: {
        type: Number,
        required: true,
        unit: 'gCO2/kWh'
    },
    installedCapacity: {
        type: Number,
        required: true,
        unit: 'MV'
    },
    pvout: {
        type: Number,
        required: true,
        unit: 'kWh/kWp'
    },
    carbonBenefits: {
        type: Number,
        required: true,
        unit: 'kgCO2'
    },
    electricityAvailability: {
        type: Number,
        required: true,
        unit: 'MWh'
    },
    solarElectricityPercent: {
        type: String,
        required: true
    },
    solarPanels: {
        type: [solarPanelSchema],
        required: true
    }
});

const Country = mongoose.model('Country', countrySchema);

module.exports = Country;
