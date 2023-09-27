import { combineReducers } from "redux";
import { countryDataReducer, countryMapSourceReducer } from "./countryMap";

const rootReducer = combineReducers({
    // reducers
    countryData: countryDataReducer,
    countryMapSource: countryMapSourceReducer,
});

export default rootReducer;
