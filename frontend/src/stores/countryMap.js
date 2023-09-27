import countryBoundaries from "@/assets/ne_50m.geo.json";
// for initial states
const initialState = {};

/* Action: to process data */
export const setCountryDataAction = (payload) => ({
    type: "SET_COUNTRY_DATA",
    payload,
});

export const setCountryMapSourceAction = (payload) => {
    return {
        type: "SET_COUNTRY_MAP_SOURCE",
        payload,
    };
};

/* Reducer: to update state only */
export function countryDataReducer(state = null, action) {
    switch (action.type) {
        case "SET_COUNTRY_DATA":
            const { payload } = action;
            return payload;
        default:
            return state;
    }
}
export function countryMapSourceReducer(state = null, action) {
    switch (action.type) {
        case "SET_COUNTRY_MAP_SOURCE":
            // fetch("https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson")
            //     .then((res) => {
            //         return res.json();
            //     })
            // .then((data) => {

            // process geo data for mapbox source
            const { payload } = action;
            const { countryData } = payload;
            const availableCountryNameList = countryData.map((ele) => ele.name);
            let features = countryBoundaries.features.map((feature) => {
                const isAvailable = availableCountryNameList.includes(feature.properties.ADMIN);
                let details = {};
                if (isAvailable) {
                    const availableCountry = countryData.find((ele) => ele.name === feature.properties.ADMIN);
                    for (const [key, matrix] of Object.entries(availableCountry)) {
                        if (typeof matrix === "object" && "value" in matrix && "unit" in matrix) {
                            details[`${key}Value`] = matrix["value"];
                            details[`${key}Unit`] = matrix["unit"];
                        } else {
                            details[key] = matrix;
                        }
                    }
                    return { ...feature, properties: { ...feature.properties, isAvailable: true, ...details } };
                } else {
                    for (const [key, matrix] of Object.entries(countryData[0])) {
                        if (typeof matrix === "object" && "value" in matrix && "unit" in matrix) {
                            details[`${key}Value`] = 0;
                            details[`${key}Unit`] = "";
                        } else {
                            details[key] = 0;
                        }
                    }
                    return {
                        ...feature,
                        properties: { ...feature.properties, isAvailable: false, ...details },
                    };
                }
            });
            return { ...countryBoundaries, features };
        default:
            return state;
    }
}
