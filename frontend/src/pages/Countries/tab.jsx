import { GlobalOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import { useEffect, useState } from "react";
import { getCountryData } from "../../services/api";
import Countries from "./countries";
import CountryMap from "./CountryMap";
import "./index.less";

export default function MyTabs() {
    // require country data
    const [countryData, setCountryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("1");
    const [chosenCountry, setChosenCountry] = useState("");
    const [mapDrawerOpen, setMapDrawerOpen] = useState(false);

    /* Fetch data of countries */
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getCountryData();
                setCountryData(response);
                // dispatch(setCountryDataAction(response));
                setError(null);
            } catch (err) {
                setError(err);
                setCountryData([]); // important, otherwise the page keeps loading
            } finally {
                setLoading(false); // data successfully loaded
            }
        }
        fetchData();
    }, []);

    const onTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "1") {
            setMapDrawerOpen(false);
        }
    };

    const handleClickViewMap = (countryDetail) => {
        setActiveTab("2");
        setChosenCountry(countryDetail.name);
    };

    return (
        <Tabs
            className="tabs"
            activeKey={activeTab}
            items={[
                {
                    key: "1",
                    label: (
                        <span>
                            <UnorderedListOutlined />
                            List
                        </span>
                    ),
                    children: <Countries countryData={countryData} handleClickViewMap={handleClickViewMap} />,
                },
                {
                    key: "2",
                    label: (
                        <span>
                            <GlobalOutlined />
                            Map
                        </span>
                    ),
                    children: (
                        <CountryMap
                            countryData={countryData}
                            chosenCountry={chosenCountry}
                            drawerOpen={mapDrawerOpen}
                            setDrawerOpen={(value) => setMapDrawerOpen(value)}
                        />
                    ),
                },
            ]}
            onChange={onTabChange}
        ></Tabs>
    );
}
