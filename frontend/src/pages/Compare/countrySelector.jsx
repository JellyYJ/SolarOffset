import { Select } from "antd";
import { useEffect, useState } from "react";
import { getCountryData } from "../../services/api";
import "./index.less";

export default function CountrySelector(props) {
    const [countryData, setCountryData] = useState(null);
    const [disabledCountry, setDisabledCountry] = useState([]);
    const [error, setError] = useState([]);

    // Get countryData from DB
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getCountryData();
                setCountryData(response);
            } catch (err) {
                setError(err.message);
                setCountryData([]);
            }
        }
        fetchData();
    }, []);

    const handleSelect = (value) => {
        // console.log("name: " + value);
        // Find the selected country by name
        const selectedCountry = countryData.find((country) => country.name === value);
        console.log(selectedCountry);

        // Disable the selected country option
        setDisabledCountry([...disabledCountry, selectedCountry]);

        // Pass the selected country to compare page
        props.handleCountrySelect(selectedCountry);
    };

    return (
        <div className="countrySelector">
            <Select
                placeholder="Select a country to compare"
                onChange={handleSelect}
                options={
                    countryData &&
                    countryData
                        .filter((country) => !disabledCountry.includes(country.name))
                        .map((country) => ({
                            value: country.name,
                            label: country.name,
                            disabled: props.selectedCountry && props.selectedCountry.name === country.name,
                        }))
                }
                // disabled={selectedCountries.length === 2}
                disabled={props.disabled}
            />
        </div>
    );
}
