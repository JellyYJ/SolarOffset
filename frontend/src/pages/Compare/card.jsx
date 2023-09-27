import {
    formatElementWithCO2,
    getCarbonBenefitsDesc,
    getCarbonIntensityDesc,
    getElecAvailabilityDesc,
    getSolarPowerGenerationDesc,
} from "@/utils/utils";
import { FrownTwoTone, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Card, Tooltip } from "antd";
import { ReactComponent as CarIcon } from "../../assets/carIcon.svg";
import { ReactComponent as HouseIcon } from "../../assets/houseIcon.svg";
import { ReactComponent as TreeIcon } from "../../assets/treeIcon.svg";
import "./index.less";
import RadarComponent from "./Radar";

const { Meta } = Card;

export default function CountryCard(props) {
    const { image, handleOnClick, countryData, max } = props;
    const {
        name,
        population,
        carbonIntensity,
        carbonBenefits,
        carbonBenefitResults,
        electricityAvailability,
        installedCapacity,
        solarElectricityPercent,
        solarPanels,
    } = countryData;

    return (
        <Card
            className="card"
            title={name}
            cover={<img src={image} alt={`${name} Map`} className="card-cover" />}
            actions={[
                <Button type="primary" onClick={handleOnClick}>
                    Check Details
                </Button>,
            ]}
        >
            <Meta
                description={
                    <>
                        <span>
                            Population: <br />
                            <p>{population.toLocaleString()}</p>
                        </span>
                        <span>
                            {"Carbon Intensity[1]:"}
                            <Tooltip title={getCarbonIntensityDesc()}>
                                <QuestionCircleOutlined className="infoIcon" />
                            </Tooltip>
                            <p>
                                <FrownTwoTone twoToneColor="#ad2715" />{" "}
                                {formatElementWithCO2(
                                    `${carbonIntensity.value.toLocaleString()} ${carbonIntensity.unit}`
                                )}
                            </p>
                        </span>
                        <span>
                            {"Potential Carbon Reduction[2]:"}
                            <Tooltip title={getCarbonBenefitsDesc(installedCapacity.value + installedCapacity.unit)}>
                                <QuestionCircleOutlined className="infoIcon" />
                            </Tooltip>
                            <p>
                                {formatElementWithCO2(
                                    `${carbonBenefits.value.toLocaleString()} ${carbonBenefits.unit}`
                                )}{" "}
                            </p>
                        </span>
                        <div className="icons-container">
                            <div className="icon-data">
                                <span>
                                    {"\u2248 "}
                                    {carbonBenefitResults.trees.value.toLocaleString()}
                                </span>
                                <TreeIcon className="icon" />
                            </div>
                            <div className="icon-data">
                                <span>
                                    {"\u2248 "}
                                    {carbonBenefitResults.households.value.toLocaleString()}
                                </span>
                                <HouseIcon className="icon" />
                            </div>
                            <div className="icon-data">
                                <span>
                                    {"\u2248 "}
                                    {carbonBenefitResults.cars.value.toLocaleString()}
                                </span>
                                <CarIcon className="icon" />
                            </div>
                        </div>

                        <span>
                            {"Potential Solar Power Generation:[3]"}
                            <Tooltip
                                title={getElecAvailabilityDesc(
                                    `${installedCapacity.value.toLocaleString()} ${installedCapacity.unit}`,
                                    "[4]"
                                )}
                            >
                                <QuestionCircleOutlined className="infoIcon" />
                            </Tooltip>
                            <p>{`${electricityAvailability.value.toLocaleString()} ${electricityAvailability.unit}`}</p>
                        </span>
                        {/* <span>
                            Maxmium Installing Capacity:
                            <p>{installedCapacity}</p>
                        </span> */}
                        <span>
                            {"Current Solar Power Generation:[5]"}
                            <Tooltip title={getSolarPowerGenerationDesc()}>
                                <QuestionCircleOutlined className="infoIcon" />
                            </Tooltip>
                            <p>
                                {solarElectricityPercent}
                                <span className="solarElectricityPercent">of total power generated</span>
                            </p>
                        </span>
                        <span>
                            Solar Panel Price:
                            <p>From £{solarPanels.priceRange.lowest.toLocaleString()}</p>
                            <span className="donate-desciption">You can make a minimum donation of £5</span>
                        </span>
                        <div className="radarChartContainer">
                            {countryData && <RadarComponent countryData={countryData} max={max} />}
                        </div>
                    </>
                }
            />
        </Card>
    );
}
