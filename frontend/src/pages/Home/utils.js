// constant for region and postcode relations
const Regions = Object.freeze({
    NORTH_SCOTLAND: {
        number: 1,
        region: "North Scotland",
        outwardPostcodes: ["AB", "IV", "KW", "PH", "ZE"],
    },
    SOUTH_SCOTLAND: {
        number: 2,
        region: "South Scotland",
        outwardPostcodes: ["DD", "DG", "EH", "FK", "G", "KA", "KY", "ML", "PA", "TD"],
    },
    NORTH_WEST_ENGLAND: {
        number: 3,
        region: "North West England",
        outwardPostcodes: [
            "BB",
            "BD",
            "BL",
            "CA",
            "CH",
            "CW",
            "FY",
            "HD",
            "HX",
            "L",
            "LA",
            "M",
            "OL",
            "PR",
            "SK",
            "WA",
            "WN",
        ],
    },
    NORTH_EAST_ENGLAND: {
        number: 4,
        region: "North East England",
        outwardPostcodes: ["DH", "DL", "NE", "SR", "TS"],
    },
    YORKSHIRE: {
        number: 5,
        region: "Yorkshire",
        outwardPostcodes: ["BD", "HD", "HG", "HU", "HX", "LS", "WF", "YO", "S"],
    },
    NORTH_WALES: {
        number: 6,
        region: "North Wales",
        outwardPostcodes: ["LL"],
    },
    SOUTH_WALES: {
        number: 7,
        region: "South Wales",
        outwardPostcodes: ["CF", "LD", "NP", "SA", "SY"],
    },
    WEST_MIDLANDS: {
        number: 8,
        region: "West Midlands",
        outwardPostcodes: ["B", "CV", "DY", "HR", "NN", "ST", "TF", "WR", "WS", "WV"],
    },
    EAST_MIDLANDS: {
        number: 9,
        region: "East Midlands",
        outwardPostcodes: ["DE", "DN", "LE", "LN", "NG"],
    },
    EAST_ENGLAND: {
        number: 10,
        region: "East England",
        outwardPostcodes: ["AL", "CB", "CM", "CO", "HP", "IP", "LU", "NR", "PE", "SG", "SS"],
    },
    SOUTH_WEST_ENGLAND: {
        number: 11,
        region: "South West England",
        outwardPostcodes: ["BA", "BH", "BS", "DT", "EX", "GL", "PL", "SN", "SP", "TA", "TQ", "TR"],
    },
    LONDON: {
        number: 13,
        region: "London",
        outwardPostcodes: [
            "BR",
            "CR",
            "DA",
            "E",
            "EC",
            "EN",
            "IG",
            "KT",
            "N",
            "NW",
            "RM",
            "SE",
            "SM",
            "SW",
            "TW",
            "UB",
            "W",
            "WC",
            "WD",
        ],
    },
    SOUTH_EAST_ENGLAND: {
        number: 14,
        region: "South East England",
        outwardPostcodes: ["BN", "CT", "GU", "ME", "MK", "OX", "PO", "RG", "RH", "SL", "SO", "TN"],
    },
});

/**
 * change Regions to a map with region name as key
 */
const getRegionMap = () => {
    let regionMap = [];
    for (let regionKey of Object.keys(Regions)) {
        const region = Regions[regionKey];
        const regionName = region["region"];
        const regionId = region["number"];
        const outwardPostcodes = region["outwardPostcodes"];
        regionMap[regionName] = { key: regionKey, name: regionName, id: regionId, posecodes: outwardPostcodes };
    }
    return regionMap;
};

/**
 * check the validation of the postcode
 * @param {*} postcode
 * @returns array with matching result
 */
//
const checkPostcode = (postcode) => {
    postcode = postcode.replace(/\s/g, "");
    var regex =
        /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
    return postcode.match(regex);
};

module.exports = { getRegionMap, checkPostcode };
