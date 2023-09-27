const mongoose = require('mongoose');

const generationMixSchema = new mongoose.Schema({
    fuel: {
        type: String,
        required: true
    },
    perc: {
        type: Number,
        required: true
    }
});

const dataSchema = new mongoose.Schema({
    from: {
        type: Date,
        required: true
    },
    to: {
        type: Date,
        required: true
    },
    intensity: {
        forecast: {
            type: Number,
            required: true
        },
        index: {
            type: String,
            required: true
        }
    },
    generationmix: [generationMixSchema]
});

const regionDataSchema = new mongoose.Schema({
    regionid: {
        type: Number,
        required: true
    },
    dnoregion: {
        type: String,
        required: true
    },
    shortname: {
        type: String,
        required: true
    },
    data: [dataSchema]
});

const carbonIntensitySchema = new mongoose.Schema({
    data: [regionDataSchema]
});

module.exports = mongoose.model('CarbonIntensity', carbonIntensitySchema);
