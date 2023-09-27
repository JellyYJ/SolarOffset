// import CountryBoundaries from "@/assets/ne_50m.geo.json";
import DisputeArea from "@/assets/ne_50m_disputed_area.geo.json";
import { setCountryMapSourceAction } from "@/stores/countryMap";
import { formatElementWithCO2, getPVOUTDesc } from "@/utils/utils";
import { CloudTwoTone, FireTwoTone, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, theme, Tooltip } from "antd";
import _ from "lodash";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Popup, Source } from "react-map-gl";
import { useDispatch, useSelector } from "react-redux";
import { history } from "umi";
import { mapboxPublicKey as mapAccessToken } from "../../../config";
import CountryBasicInfo from "./CountryBasicInfo";
import styles from "./index.less";
import { getCountryCenterCoord } from "./utils";

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

export default function CountryMap({ countryData, chosenCountry, drawerOpen, setDrawerOpen }) {
    const dispatch = useDispatch();
    const mapRef = useRef();
    // popup info when hover a feature on the map
    const [hoverInfo, setHoverInfo] = useState(null);
    const [cursor, setCursor] = useState("");
    // initial map center point
    const [initialPos, setInitialPos] = useState([20, 2]); // longitude and latitude of Africa Center
    // country detail drawer visible
    // const [drawerOpen, setDrawerOpen] = useState(false);
    // clicked country on the map
    const [clickedCountry, setClickedCountry] = useState(null);

    const countryMapSource = useSelector((state) => state.countryMapSource);

    // get color hex value from global theme
    const { token } = theme.useToken();
    const { colorPrimary, navy, primary1, primary2, primary3, primary4, gold4, gold, orange7, volcano10 } = token;

    const availableCountryNameList = countryData?.map((ele) => ele.name);

    let hoveredId = null;

    useEffect(() => {
        if (countryData && !countryMapSource) {
            dispatch(setCountryMapSourceAction({ countryData }));
        }
    }, [countryData]);

    const countriesLayer = {
        type: "fill",
        source: "countries",
        paint: {
            "fill-color":
                // {
                //     property: "pvoutValue",
                //     stops: [[0, primary1], [3, primary3], [4, primary4], [5, colorPrimary], primary1],
                // },
                // ["match", ["get", "pvoutValue"], 3, primary3, 4, primary4, 5, colorPrimary, primary1],
                [
                    "step",
                    ["get", "pvoutValue"],
                    primary2, // any item where `pvoutValue` is <= 3 will be displayed with this color
                    0.1,
                    primary3,
                    3,
                    primary4, // any item where `pvoutValue` is <= 4 && > 3 will be displayed with this color
                    4,
                    colorPrimary,
                    5.2,
                    navy, // any item where `pvoutValue` is > 5 will be displayed with this color
                ],
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.5, 1],
            "fill-outline-color": "white",
        },
        // filter: ["!=", "name", "Antarctica"], // not display Antarctica
    };

    const disputeLayer = {
        type: "line",
        paint: {
            "line-color": "white",
            "line-dasharray": [2, 2],
        },
    };

    const clickedCountryLayer = {
        type: "line",
        source: "countries",
        paint: {
            "line-width": 2.5,
            // "line-color": primary9,
            "line-color": "white",
        },
    };

    const filter = useMemo(() => ["==", "ADMIN", clickedCountry?.name || ""], [clickedCountry?.name || ""]);

    const ukRegionsLayer = {
        type: "fill",
        source: "ukRegions",
        layout: {},
        paint: {
            "fill-color": primary1,
            "fill-outline-color": "white",
        },
    };

    useEffect(() => {
        // click ViewOnMap from List page
        if (mapRef && mapRef.current && !!chosenCountry) {
            const { lng, lat } = getCountryCenterCoord(chosenCountry);
            mapRef.current.flyTo({
                center: { lng: lng - 10, lat: lat },
                zoom: 2.5,
                duration: 400,
            });
            const availableCountry = countryData.find((ele) => ele.name === chosenCountry);
            setClickedCountry(availableCountry);
            setTimeout(() => {
                setDrawerOpen(true);
            }, 200);
        }
    }, [chosenCountry, mapRef.current]);

    // Called when one of the map's sources loads or changes
    const onSourceData = useCallback((e) => {
        const vectorTiles = mapRef.current.querySourceFeatures("countries", {
            sourceLayer: "country_boundaries",
        });
        const processedVectorTiles = vectorTiles.map((tile) => {
            const availableCountry = countryData.filter((ele) => ele.name === tile.properties.name_en);
            if (availableCountry && availableCountry.length) {
                return { ...tile, properties: { ...tile.properties, ...availableCountry[0] } };
            } else {
                return tile;
            }
        });
    }, []);

    // called after all necessary resources have been downloaded
    const onMapLoad = () => {
        // console.log("onMapLoad");
    };

    // on click a feature
    const onClick = useCallback((e) => {
        console.log("onClick", e?.features[0]?.properties);
        const countryName = _.get(e, "features[0].properties.ADMIN", "");
        if (countryName && availableCountryNameList.includes(countryName)) {
            setDrawerOpen(true);
            const availableCountry = countryData.find((ele) => ele.name === e.features[0].properties.ADMIN);
            setClickedCountry(availableCountry);
            mapRef.current.flyTo({
                // center: e.features[0].geometry.coordinates[0],
                center: { lng: e.lngLat.lng - 10, lat: e.lngLat.lat },
                zoom: 2.5,
                duration: 400,
            });
        } else {
            closeDrawer();
        }
    }, []);

    // on enter map
    const onMouseEnter = useCallback((e) => {
        setCursor("pointer");
        const feature = e.features && e.features[0];
    }, []);

    // on leave map
    const onMouseLeave = useCallback(() => {
        setCursor("");
        if (hoveredId !== null) {
            mapRef.current.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
        }
        setHoverInfo(null);
    }, []);

    // on hover map
    const onMouseMove = useCallback((e) => {
        const {
            features,
            point: { x, y },
        } = e;
        const hoveredFeature = features && features[0];
        // When the mouse moves over the layer, update the feature state for the feature under the mouse
        if (hoveredId !== null) {
            mapRef.current.setFeatureState({ source: "countries", id: hoveredId }, { hover: false });
        }
        if (hoveredFeature) {
            setHoverInfo({
                longitude: e.lngLat.lng,
                latitude: e.lngLat.lat,
                countryName: hoveredFeature && hoveredFeature.properties.ADMIN,
                details: hoveredFeature,
            });
            if (mapRef && hoveredFeature.id) {
                hoveredId = hoveredFeature.id;
                mapRef.current.setFeatureState({ source: "countries", id: hoveredFeature.id }, { hover: true });
            }
        } else {
            setHoverInfo(null);
        }
    }, []);

    // close country detail drawer
    const closeDrawer = () => {
        setDrawerOpen(false);
        setClickedCountry(null);
    };

    // click card and go to the detail page
    const handleDetailClick = (countryId) => {
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

    if (!countryData && !countryMapSource) {
        return <></>;
    }
    return (
        <div className={styles.mapContainer}>
            <Map
                ref={mapRef}
                mapboxAccessToken={mapAccessToken}
                style={{ borderRadius: "inherit" }}
                initialViewState={{
                    longitude: initialPos[0],
                    latitude: initialPos[1],
                    zoom: 1.8,
                    minZoom: 1.2,
                    maxZoom: 4,
                    renderWorldCopies: true,
                    projection: "mercator",
                }}
                cursor={cursor}
                interactiveLayerIds={["countries-layer"]}
                onClick={onClick}
                onMouseMove={onMouseMove}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onLoad={onMapLoad}
            >
                <Source id="countries" type="geojson" data={countryMapSource} generateId>
                    <Layer id="countries-layer" {...countriesLayer} />
                    <Layer id="clicked-country-layer" {...clickedCountryLayer} filter={filter} />
                </Source>
                <Source id="disputeArea" type="geojson" data={DisputeArea}>
                    <Layer id="dispute-layer" {...disputeLayer} />
                </Source>
                <Source
                    id="ukRegions"
                    type="geojson"
                    data="https://s3.eu-west-2.amazonaws.com/carbonintensity.org.uk/DNORegions_pretty_test_country.geojson"
                >
                    {/* <Layer id="uk-regions-layer" {...ukRegionsLayer} /> */}
                </Source>

                {/* mapbox popup content for unavailable countries */}
                {hoverInfo && hoverInfo.countryName && !hoverInfo.details.properties.isAvailable && (
                    <Popup
                        longitude={hoverInfo.longitude}
                        latitude={hoverInfo.latitude}
                        offset={popupOffsets(6, 12, 200)}
                        closeButton={false}
                        closeOnClick={false}
                    >
                        <div className={`${styles.popupWrapper} ${styles.unavailable}`}>
                            <div className={styles.popupCountryName}>{hoverInfo.countryName}</div>
                            <div className={styles.popupCountryDesc}>No data available</div>
                        </div>
                    </Popup>
                )}
                {/* mapbox popup content for available countries */}
                {hoverInfo && hoverInfo.countryName && hoverInfo.details.properties.isAvailable && (
                    <Popup
                        longitude={hoverInfo.longitude}
                        latitude={hoverInfo.latitude}
                        offset={popupOffsets(6, 12, 240)}
                        closeButton={false}
                    >
                        <div className={`${styles.popupWrapper} ${styles.available}`}>
                            <div className={styles.popupCountryName}>{hoverInfo.countryName}</div>
                            <div className={styles.popupCountryDesc}>
                                PVOUT: {hoverInfo.details.properties.pvoutValue.toLocaleString()}
                                {hoverInfo.details.properties.pvoutUnit}
                            </div>
                            <div className={styles.popupCountryDesc}>
                                Carbon Intensity: {hoverInfo.details.properties.carbonIntensityValue.toLocaleString()}
                                {formatElementWithCO2(hoverInfo.details.properties.carbonIntensityUnit)}
                            </div>
                            <div className={styles.popupCountryDesc}>
                                Carbon Benefits: {hoverInfo.details.properties.carbonBenefitsValue.toLocaleString()}
                                {formatElementWithCO2(hoverInfo.details.properties.carbonBenefitsUnit)}
                            </div>
                        </div>
                    </Popup>
                )}
                {/* legend for map */}
                <Card size="small" className={styles.legendCard}>
                    <div>
                        Potential Solar Power{" "}
                        <Tooltip title={getPVOUTDesc()}>
                            <QuestionCircleOutlined className={styles.infoIcon} />
                        </Tooltip>
                    </div>
                    <div className={styles.legend} style={{ background: primary3 }}></div>
                    <div className={styles.legend} style={{ background: primary4 }}></div>
                    <div className={styles.legend} style={{ background: colorPrimary }}></div>
                    <div className={styles.legend} style={{ background: navy }}></div>
                    <div className={styles.legendMeaning}>
                        <CloudTwoTone twoToneColor="#91b3b1" />
                        <FireTwoTone twoToneColor="#4769b2" />
                    </div>
                </Card>
                {/* drawer to show details of a clicked country */}
                {clickedCountry && (
                    <Drawer
                        title={clickedCountry.name}
                        placement="left"
                        open={drawerOpen}
                        mask={false}
                        closable={true}
                        onClose={closeDrawer}
                        getContainer={false}
                        width={300}
                    >
                        <CountryBasicInfo
                            name={clickedCountry.name}
                            pvout={clickedCountry.pvout.value}
                            pvoutUnit={clickedCountry.pvout.unit}
                            population={clickedCountry.population.toLocaleString()}
                            carbonIntensity={clickedCountry.carbonIntensity.value}
                            carbonIntensityUnit={clickedCountry.carbonIntensity.unit}
                        />
                        <div className={styles.detailButtonWrapper}>
                            <Button type="primary" onClick={() => handleDetailClick(clickedCountry._id)}>
                                Check Details
                            </Button>
                        </div>
                    </Drawer>
                )}
            </Map>
        </div>
    );
}
