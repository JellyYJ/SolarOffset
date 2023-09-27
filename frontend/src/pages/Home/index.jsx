import { getCountryData } from "@/services/api";
import { setCountryDataAction } from "@/stores/countryMap";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { history } from "umi";
import HouseSelectionModal from "./HouseSelectionModal";
import MapBox from "./MapBox";

export default function HomePage() {
    const dispatch = useDispatch();
    // control the visibility of location selection modal
    const [locationSelectionOpen, setLocationSelectionOpen] = useState(false);
    // control the visibility of location detail modal
    const [locationDetailOpen, setLocationDetailOpen] = useState(false);
    // control the visibility of house type selection modal
    const [houseSelectionOpen, setHouseSelectionOpen] = useState(false);
    // carbon intensity detail of a location
    const [locationDetail, setLocationDetail] = useState({});
    // countryData
    // get countryData from redux store
    const countryData = useSelector((state) => state.countryData);

    // save user's location to local storage for the first visit
    const saveLocationToStorage = (value) => {
        localStorage.setItem("myLocation", value);
    };
    // save user's house type to local storage for the first visit
    const saveHouseTypeToStorage = (value) => {
        localStorage.setItem("myHouseType", value);
    };

    // useEffect(() => {
    //     const mapBoxIframe = document.getElementById("fakeMapBox");
    //     const iframeDocument = mapBoxIframe.contentWindow || mapBoxIframe.contentDocument;
    // }, []);

    // check house selection in local storage
    const checkHouseSelection = () => {
        const storageHouse = localStorage.getItem("myHouseType");
        if (!storageHouse) {
            setHouseSelectionOpen(true);
        }
    };

    // check location selection in local storage when first load page
    useEffect(() => {
        // const storageLocation = localStorage.getItem("myLocation");
        // if (!storageLocation) {
        //     // user has not selected a location before
        //     setTimeout(() => {
        //         setLocationSelectionOpen(true);
        //     }, 2000);
        // } else {
        //     // location selected, check house type selection
        //     setTimeout(() => {
        //         checkHouseSelection();
        //     }, 2000);
        // }
        try {
            getCountryData().then((res) => {
                dispatch(setCountryDataAction(res));
            });
        } catch (err) {
            dispatch(setCountryDataAction([]));
        }
    }, []);

    const onHouseSelectionOk = (houseType) => {
        setHouseSelectionOpen(false);
        saveHouseTypeToStorage(houseType);
        history.push("/countries");
    };

    return (
        <>
            <MapBox countryData={countryData} />
            {/* directly embed electricity maps to our landing page */}
            {/* <iframe
                allow="cross-origin-isolated"
                className={styles.mapBoxFrame}
                src="https://app.electricitymaps.com/zone/GB"
                title="fakeMapBox"
                id="fakeMapBox"
            ></iframe> */}
            <HouseSelectionModal
                open={houseSelectionOpen}
                onOk={onHouseSelectionOk}
                onCancel={() => setHouseSelectionOpen(false)}
            />
        </>
    );
}
