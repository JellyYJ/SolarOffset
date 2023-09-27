import * as countryImages from "@/assets/countryMaps";
import { Empty } from "antd";
import { useEffect, useState } from "react";
import { history } from "umi";
import { getCompareCountriesById } from "../../services/api";
import CountryCard from "./card";
import CountrySelector from "./countrySelector";
import "./index.less";

export default function Compare({ countryId1, countryId2 }) {
    /* get selected countries data with compare api */
    const [countryData, setCountryData] = useState(null);
    // error handling
    const [error, setError] = useState(null);

    // console.log("countryId1: " + countryId1); // testing
    useEffect(() => {
        async function fetchData() {
            try {
                // error handling if id is undefined
                if (!countryId1 || !countryId2) {
                    setError(`One of the Country IDs are not defined.`);
                    return;
                }
                const response = await getCompareCountriesById(countryId1, countryId2);
                // setCountryData(response);
                if (response == null) {
                    setError("Resonse is null.");
                } else {
                    setCountryData(response);
                }
            } catch (err) {
                console.log(err);
                setError("Failed to fetch country data.");
            }
        }
        fetchData();
    }, [countryId1, countryId2]);

    /* Country Selector */
    const [select1, setSelect1] = useState(null);
    const [select2, setSelect2] = useState(null);

    const handleCountry1Select = (country) => {
        setSelect1(country);
    };

    const handleCountry2Select = (country) => {
        setSelect2(country);
    };

    // get compare Countries data
    useEffect(() => {
        async function fetchData() {
            try {
                if (!select1 || !select2) {
                    return;
                }
                const response = await getCompareCountriesById(select1._id, select2._id);
                if (response == null) {
                    setError("Response is null.");
                } else {
                    setCountryData(response);
                }
            } catch (err) {
                setError(err);
            }
        }
        fetchData();
    }, [select1, select2]);

    /* jump to the corresponding country detail page */
    const handleOnClick = (countryId) => {
        history.push({
            pathname: "/countries/" + countryId,
        });
    };

    if (!countryData || !countryData.length) {
        return (
            <div>
                <div>
                    <div className="countrySelector">
                        <CountrySelector
                            handleCountrySelect={handleCountry1Select}
                            selectedCountry={select2} // pass currently selected country in the second selector
                        />
                        <CountrySelector
                            handleCountrySelect={handleCountry2Select}
                            selectedCountry={select1} // pass currently selected country in the first selector
                        />
                    </div>

                    <div className="compare">
                        {countryData && <CountryCard countryData={countryData[0]} />}
                        {countryData && <CountryCard countryData={countryData[1]} />}
                    </div>
                </div>
                <Empty
                    className="compare-empty"
                    description={
                        <span className="compare-error">Please select from available countries to compare</span>
                    }
                ></Empty>
            </div>
        );
    }

    const getChartMetricList = (eachCountry) => {
        return [
            eachCountry.carbonIntensity.value,
            eachCountry.carbonBenefits.value / 1000,
            eachCountry.electricityAvailability.value / 1000,
            eachCountry.installedCapacity.value,
            parseFloat(eachCountry.solarElectricityPercent) * 1000,
        ];
    };
    //   const list = [countryData[0].carbonIntensity.value, ]
    let max = getChartMetricList(countryData[0])
        .concat(getChartMetricList(countryData[1]))
        .reduce((accumulator, currentValue) => Math.max(accumulator, currentValue), 0);

    return (
        <section>
            <div className="countrySelector">
                <CountrySelector
                    handleCountrySelect={handleCountry1Select}
                    selectedCountry={select2} // pass currently selected country in the second selector
                />
                <CountrySelector
                    handleCountrySelect={handleCountry2Select}
                    selectedCountry={select1} // pass currently selected country in the first selector
                />
            </div>

            <div className="compare">
                {countryData && (
                    <>
                        <CountryCard
                            image={countryImages[countryData[0].name.replace(/\s+/g, "")]}
                            countryData={countryData[0]}
                            handleOnClick={() => handleOnClick(countryData[0]._id)}
                            max={max}
                        />

                        <CountryCard
                            image={countryImages[countryData[1].name.replace(/\s+/g, "")]}
                            countryData={countryData[1]}
                            handleOnClick={() => handleOnClick(countryData[1]._id)}
                            max={max}
                        />
                    </>
                )}
            </div>
            {/* <div className="radarChartContainer">{countryData && <RadarComponent countryData={countryData} />}</div> */}
        </section>
    );
}
