import * as countryImages from "@/assets/countryMaps";
import { Button, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { history } from "umi";
import CountryCard from "./card";
import "./index.less";

export default function Countries(props) {
    const { countryData, handleClickViewMap } = props;
    // console.log("images", images);
    const [messageApi, contextHolder] = message.useMessage();

    // checkbox handling
    const [numChecked, setNumChecked] = useState(0);
    const [selectedCountries, setSelectedCountries] = useState([]);

    // enable the btn only when two checked
    function handleChange(checked, currentNumChecked, countryName) {
        const newNumChecked = checked ? currentNumChecked + 1 : currentNumChecked - 1;
        setNumChecked(newNumChecked);
        // console.log(`Checkbox for ${countryName} is now ${checked ? "checked" : "unchecked"}.`); // testing

        if (checked) {
            setSelectedCountries((prevSelectedCountries) => [...prevSelectedCountries, countryName]);
        } else {
            setSelectedCountries((prevSelectedCountries) =>
                prevSelectedCountries.filter((name) => name !== countryName)
            );
        }
    }

    // get clicked country from landing page to highlight
    const highlightCountry = sessionStorage.getItem("highlightCountry");
    useEffect(() => {
        setTimeout(() => {
            sessionStorage.removeItem("highlightCountry");
        }, 3000);
    }, []);

    const isDisabled = numChecked !== 2;

    // pass selected countries id
    const compareOnClick = () => {
        let [firstCountry, secondCountry] = selectedCountries;

        // get country id
        const countryId1 = countryData.find((country) => country.name === firstCountry)?._id;
        const countryId2 = countryData.find((country) => country.name === secondCountry)?._id;
        // console.log("Navigating to: /compare?countryId1=" + countryId1 + "&countryId2=" + countryId2); // testing

        if (countryId1 && countryId2) {
            history.push({
                pathname: "/compare",
                search: `?countryId1=${countryId1}&countryId2=${countryId2}`,
            });
        } else {
            // handle one or more ID is undefined
            history.push({
                pathname: "/compare",
            });
        }

        // NOT IN USE: for different situations of selcted countries
        // else if (countryId1 && countryId2 === undefined) {
        //     // handle the case where one or both IDs are undefined
        //     history.push({
        //         pathname: "/compare",
        //         search: `?countryId1=${countryId1}&countryId2=${countryId1}`
        //     });
        // } else if (countryId1 === undefined && countryId2) {
        //     // handle the case where one or both IDs are undefined
        //     history.push({
        //         pathname: "",
        //         search: `?firstCountry=${firstCountry}&countryId2=${countryId2}`
        //     });
        // } else {
        //     history.push({
        //         pathname: "/compare",
        //         search: `?firstCountry=${firstCountry}&secondCountry=${secondCountry}`
        //     });
        //     console.log("just country names");
        // }
    };

    // click card and go to the detail page
    const handleCardClick = (countryId) => {
        if (countryId) {
            history.push({
                pathname: "/countries/" + countryId,
            });
        } else {
            messageApi.open({
                type: "error",
                content: "Sorry, the detail of the country is not available yet.",
            });
        }
    };

    // click ViewOnMap and go to the map tab
    const onClickViewMap = (countryDetail) => {
        if (countryDetail) {
            handleClickViewMap(countryDetail);
        }
    };

    // when not connected to db
    if (!countryData) {
        return (
            <div className="spin-container">
                <Spin className="spin" size="large" />
            </div>
        );
    }

    return (
        <section>
            <Button size="large" type="primary" disabled={isDisabled} className="compare_btn" onClick={compareOnClick}>
                Compare
            </Button>
            <div className="countries">
                {countryData &&
                    countryData.map((country) => (
                        <div key={country._id}>
                            {contextHolder}
                            <CountryCard
                                image={countryImages[country.name.replace(/\s+/g, "")]}
                                name={country.name}
                                population={country.population.toLocaleString()}
                                carbonIntensity={<>{country.carbonIntensity.value.toLocaleString()}</>}
                                carbonIntensityUnit={country.carbonIntensity.unit}
                                // carbonFootprint={country.carbonFootprint}
                                // carbonBenefit={
                                //     <>
                                //         {country.carbonBenefits.value.toLocaleString()}
                                //         {formatElementWithCO2(country.carbonIntensity.unit)}
                                //     </>
                                // }
                                pvout={country.pvout.value.toLocaleString()}
                                pvoutUnit={country.pvout.unit}
                                handleChange={handleChange}
                                numChecked={numChecked}
                                checked={highlightCountry === country._id}
                                isAvailable={true}
                                onClick={() => handleCardClick(country._id)}
                                onClickViewMap={() => onClickViewMap(country)}
                            />
                        </div>
                    ))}
                <CountryCard
                    image={`https://upload.wikimedia.org/wikipedia/commons/2/2d/Location_Nigeria_AU_Africa.svg`}
                    name="Nigeria"
                    carbonIntensity=""
                    carbonFootprint=""
                    solarPower=""
                    carbonBenefit=""
                    population=""
                    handleChange={handleChange}
                    numChecked={numChecked}
                    isAvailable={false}
                    onClick={() => handleCardClick("")}
                />
                <CountryCard
                    image={`https://upload.wikimedia.org/wikipedia/commons/c/ca/Location_Angola_AU_Africa.svg`}
                    name="Angola"
                    carbonIntensity=""
                    carbonFootprint=""
                    solarPower=""
                    carbonBenefit=""
                    population=""
                    handleChange={handleChange}
                    numChecked={numChecked}
                    isAvailable={false}
                    onClick={() => handleCardClick("")}
                />
            </div>
        </section>
    );
}
