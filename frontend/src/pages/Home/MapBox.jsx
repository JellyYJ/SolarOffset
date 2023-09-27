import DisputeArea from "@/assets/ne_50m_disputed_area.geo.json";
import { getCarbonIntensity, getCurrentUserInfo, getUKCarbonIntensity } from "@/services/api";
import { setCountryMapSourceAction } from "@/stores/countryMap";
import { formatElementWithCO2, formattedCO2, getCarbonIntensityDesc } from "@/utils/utils";
import { FrownTwoTone, MehTwoTone, QuestionCircleOutlined, SmileTwoTone } from "@ant-design/icons";
import { Card, Drawer, theme, Tooltip } from "antd";
import _ from "lodash";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Layer, Popup, Source } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import { history } from "umi";
import { mapboxPublicKey as mapAccessToken } from "../../../config";
import styles from "./index.less";
import LocationDetail from "./LocationDetail";
import LocationSelection from "./LocationSelection";
import { getRegionMap } from "./utils";

// custom popup offset in map
const popupOffsets = (linearOffset = 6, cursorWidth = 12, markerWidth = 160) => ({
    top: [markerWidth / 2 + linearOffset, cursorWidth + linearOffset],
    "top-left": [linearOffset, cursorWidth + linearOffset],
    "top-right": [-linearOffset, cursorWidth + linearOffset],
    bottom: [markerWidth / 2 + linearOffset, -linearOffset],
    "bottom-left": [linearOffset, -linearOffset],
    "bottom-right": [-linearOffset, -linearOffset],
    left: [linearOffset, linearOffset],
    right: [-linearOffset, -linearOffset],
});

export default function MapBox(props) {
    const dispatch = useDispatch();
    // const { countryData } = props;
    const regionMap = getRegionMap();

    const mapRef = useRef();
    // popup info when hover a feature on the map
    const [userRole, setUserRole] = useState("");
    const [hoverInfo, setHoverInfo] = useState(null);
    const [cursor, setCursor] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [ukCarbonIntensity, setUkCarbonIntensity] = useState(0);
    const countryData = useSelector((state) => state.countryData);
    const countryMapSource = useSelector((state) => state.countryMapSource);

    // control the visibility of location detail modal
    const [locationDetailOpen, setLocationDetailOpen] = useState(false);
    // carbon intensity detail of a location
    const [locationDetail, setLocationDetail] = useState({});

    // get color hex value from global theme
    const { token } = theme.useToken();
    const { colorPrimary, navy, primary2, primary3, gold, yellow, orange7, volcano10 } = token;

    let hoveredId = null;

    const countriesLayer = {
        type: "fill",
        paint: {
            "fill-color": [
                "step",
                ["get", "carbonIntensityValue"],
                primary2, // any item where `pvoutValue` is < 0.1 will be displayed with this color
                0.1,
                navy,
                100,
                colorPrimary,
                200,
                gold, // any item where `pvoutValue` is < 400 && >= 200 will be displayed with this color
                400,
                orange7,
                600,
                volcano10,
            ],
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 1],
            "fill-outline-color": "white",
        },
    };
    const disputeLayer = {
        type: "line",
        paint: {
            "line-color": "white",
            "line-dasharray": [2, 2],
        },
    };

    const ukRegionsLayer = {
        type: "fill",
        source: "ukRegions",
        layout: {},
        paint: {
            "fill-color": gold,
            // "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 1],
            "fill-opacity": 1,
            "fill-outline-color": "white",
        },
    };

    useEffect(() => {
        getUKCarbonIntensity().then((res) => {
            setUkCarbonIntensity(_.get(res, "data.data[0].intensity.actual", 0));
        });

        const storageLocation = localStorage.getItem("myLocation");
        if (storageLocation) {
            const regionId = _.get(regionMap[storageLocation], "id", "");
            if (regionId) {
                getCarbonIntensity({ region: regionId })
                    .then((res) => {
                        let data = res.data;
                        const detailData = _.get(data, "data[0]", {});
                        onSelectLocationOk(detailData);
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
            }
        }
        getCurrentUserInfo()
            .then((res) => {
                if (res.data) {
                    setUserRole(res.data.role);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (countryData && !countryMapSource) {
            dispatch(setCountryMapSourceAction({ countryData }));
        }
    }, [countryData]);

    const onClick = useCallback((e) => {
        console.log("onClick", e.lngLat);
        const ukFeature =
            e.features && e.features.length && e.features.filter((ele) => ele.layer.id === "uk-regions-layer")[0];
        console.log("ukFeature", ukFeature);
        if (ukFeature) {
            openDrawer();
            return;
        }
        const countryFeature =
            e.features && e.features.length && e.features.filter((ele) => ele.layer.id === "countries-layer")[0];
        if (countryFeature) {
            // TODO figure out why countryData is null
            // console.log("countryData", countryData);
            if (countryFeature?.properties?.isAvailable) {
                // allow country-list to show the country clicked in the map
                const id = countryFeature.properties._id;
                sessionStorage.setItem("highlightCountry", id);
                if (userRole !== "admin") {
                    history.push("/countries");
                }
            }
        }
    }, []);

    // on enter map
    const onMouseEnter = useCallback(() => setCursor("pointer"), []);
    // on leave map
    const onMouseLeave = useCallback(() => {
        setCursor("");
        if (hoveredId !== null) {
            mapRef?.current?.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
        }
        setHoverInfo(null);
    }, []);

    // on hover map
    const onMouseMove = useCallback((e) => {
        const {
            features,
            point: { x, y },
        } = e;
        const countryHoveredFeature =
            features && features.length && features.filter((ele) => ele.layer.id === "countries-layer")[0];
        const ukHoveredFeature =
            features && features.length && features.filter((ele) => ele.layer.id === "uk-regions-layer")[0];
        // When the mouse moves over the layer, update the feature state for the feature under the mouse
        if (hoveredId !== null) {
            mapRef.current.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
        }
        if (countryHoveredFeature) {
            setHoverInfo({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                countryName: countryHoveredFeature && countryHoveredFeature.properties.ADMIN,
                details: countryHoveredFeature,
            });
            if (mapRef && countryHoveredFeature.id) {
                hoveredId = countryHoveredFeature.id;
                mapRef.current.setFeatureState({ source: "countries", id: countryHoveredFeature.id }, { hover: true });
                // mapRef.current.setPaintProperty("uk-regions-layer", "fill-opacity", 0.5);
            }
            // }
        } else {
            setHoverInfo(null);
        }
    }, []);

    const openDrawer = () => {
        setDrawerOpen(true);
    };
    const closeDrawer = () => {
        setDrawerOpen(false);
    };

    const getPopupContent = (hoverInfo) => {
        const { countryName, details } = hoverInfo;
        if (!hoverInfo.details.properties.isAvailable && countryName !== "United Kingdom") {
            return (
                <Popup
                    longitude={hoverInfo.longitude}
                    latitude={hoverInfo.latitude}
                    offset={popupOffsets(6, 12, 200)}
                    closeButton={false}
                    closeOnClick={false}
                >
                    <div className={`${styles.popupWrapper} ${styles.unavailable}`}>
                        <div className={styles.popupCountryName}>{countryName}</div>
                        <div className={styles.popupCountryDesc}>No data available</div>
                    </div>
                </Popup>
            );
        } else {
            return (
                <Popup
                    longitude={hoverInfo.longitude}
                    latitude={hoverInfo.latitude}
                    offset={popupOffsets(6, 12, 240)}
                    closeButton={false}
                >
                    <div className={`${styles.popupWrapper} ${styles.available}`}>
                        <div className={styles.popupCountryName}>{countryName}</div>
                        <div className={styles.popupCountryDesc}>
                            Carbon Intensity:{" "}
                            {countryName === "United Kingdom" ? (
                                <>
                                    {ukCarbonIntensity}g{formattedCO2()}
                                </>
                            ) : (
                                <>
                                    {hoverInfo.details.properties.carbonIntensityValue.toLocaleString()}
                                    {formatElementWithCO2(hoverInfo.details.properties.carbonIntensityUnit)}
                                </>
                            )}
                        </div>
                        {countryName === "United Kingdom" ? (
                            <>
                                <div className={styles.popupCountryClick}>
                                    Click to know the accurate data in your region.
                                </div>
                                {/* <div className={styles.popupCountryNote}>
                                    Sorry for the data incompleteness. We only have data for England, Scotland, and
                                    Wales.
                                </div> */}
                            </>
                        ) : (
                            <div className={styles.popupCountryClick}>Click to offset carbon in Africa.</div>
                        )}
                    </div>
                </Popup>
            );
        }
    };

    // save user's location to local storage for the first visit
    const saveLocationToStorage = (value) => {
        localStorage.setItem("myLocation", value);
    };

    const onSelectLocationOk = (detailData) => {
        setLocationDetail(detailData);
        saveLocationToStorage(detailData.shortname);
        setLocationDetailOpen(true);
    };

    if (!countryData || !countryMapSource) {
        return <></>;
    }
    return (
        <>
            <div className={styles.mapContainer}>
                <Map
                    ref={mapRef}
                    mapboxAccessToken={mapAccessToken}
                    initialViewState={{
                        longitude: -3,
                        latitude: 47,
                        zoom: 2.5,
                        minZoom: 1.2,
                        maxZoom: 6,
                        renderWorldCopies: true,
                        projection: "mercator",
                    }}
                    cursor={cursor}
                    interactiveLayerIds={["countries-layer", "uk-regions-layer"]}
                    onClick={onClick}
                    onMouseMove={onMouseMove}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <Source id="countries" type="geojson" data={countryMapSource} generateId>
                        <Layer id="countries-layer" {...countriesLayer} />
                    </Source>
                    <Source id="disputeArea" type="geojson" data={DisputeArea}>
                        <Layer id="dispute-layer" {...disputeLayer} generateId />
                    </Source>
                    {/* <Source id="countries" type="vector" url="mapbox://mapbox.country-boundaries-v1">
                        <Layer id="countries-layer" {...countriesLayer} />
                    </Source> */}
                    <Source
                        id="ukRegions"
                        type="geojson"
                        data="https://s3.eu-west-2.amazonaws.com/carbonintensity.org.uk/DNORegions_pretty_test_country.geojson"
                    >
                        <Layer id="uk-regions-layer" {...ukRegionsLayer} />
                    </Source>

                    {/* mapbox popup content */}
                    {hoverInfo && hoverInfo.countryName && getPopupContent(hoverInfo)}

                    {/* legend for map */}
                    <Card size="small" className={styles.legendCard}>
                        <div>
                            Carbon Intensity
                            <Tooltip title={getCarbonIntensityDesc()}>
                                <QuestionCircleOutlined className={styles.infoIcon} />
                            </Tooltip>
                        </div>
                        <div className={styles.legend} style={{ background: volcano10 }}></div>
                        <div className={styles.legend} style={{ background: orange7 }}></div>
                        <div className={styles.legend} style={{ background: gold }}></div>
                        <div className={styles.legend} style={{ background: colorPrimary }}></div>
                        <div className={styles.legend} style={{ background: navy }}></div>
                        <div className={styles.legendMeaning}>
                            <FrownTwoTone twoToneColor="#ad2715" />
                            <MehTwoTone twoToneColor="#FAAD14" />
                            <SmileTwoTone twoToneColor="#36cfc9" />
                        </div>
                    </Card>

                    {/* drawer for uk carbon intensity */}
                    <Drawer
                        title={"Where are you located?"}
                        placement="left"
                        open={drawerOpen}
                        mask={false}
                        closable={true}
                        onClose={closeDrawer}
                        getContainer={false}
                    >
                        {!locationDetailOpen ? (
                            <LocationSelection onOk={(detail) => onSelectLocationOk(detail)} />
                        ) : (
                            <LocationDetail
                                open={locationDetailOpen}
                                detail={locationDetail}
                                onGoBack={() => {
                                    setLocationDetailOpen(false);
                                }}
                                onOk={() => {
                                    closeDrawer();
                                    if (userRole !== "admin") {
                                        history.push("/countries");
                                    }
                                }}
                            />
                        )}
                    </Drawer>
                </Map>
            </div>
        </>
    );
}
