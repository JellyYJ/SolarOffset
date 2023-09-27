import * as countryImages from "@/assets/countryMaps";
import {
    formatElementWithCO2,
    getCarbonBenefitsDesc,
    getCarbonIntensityDesc,
    getElecAvailabilityDesc,
    getPVOUTDesc,
    getSolarPowerGenerationDesc,
} from "@/utils/utils";
import { ArrowLeftOutlined, FrownTwoTone, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, Row, Tooltip, Typography } from "antd";
import { formatPvout } from "../Countries/utils";
import styles from "./index.less";
import SolarPanel from "./SolarPanel";
const { Paragraph, Title } = Typography;

export default function CountryDetails(props) {
    const { countryData } = props;

    if (countryData && Object.keys(countryData).length) {
        return (
            <Card
                className={styles.detailCard}
                title={
                    <Row>
                        <Col span={8}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => {
                                    history.back();
                                }}
                            >
                                Back
                            </Button>
                        </Col>
                        <Col span={8} style={{ textAlign: "center" }}>
                            <span className={styles.cardTitle}>{countryData?.name}</span>
                        </Col>
                    </Row>
                }
            >
                <div className={styles.infoContent}>
                    <Row gutter={[16, 0]}>
                        <Col span={16}>
                            <Descriptions
                                title="Basic Information"
                                className={styles.detailDescription}
                                column={3}
                                layout="vertical"
                                size="small"
                            >
                                <Descriptions.Item label="Country Name">{countryData.name}</Descriptions.Item>
                                <Descriptions.Item label="Population">
                                    {countryData.population.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Land Area">
                                    {countryData.landArea.toLocaleString()} km²
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <span>
                                            Potential Solar Power(PVOUT)
                                            <Tooltip title={getPVOUTDesc()}>
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </span>
                                    }
                                >
                                    <Tooltip
                                        title={
                                            <>
                                                {countryData.pvout.value.toLocaleString()} {countryData.pvout.unit}
                                            </>
                                        }
                                    >
                                        {formatPvout(countryData.pvout.value)}
                                    </Tooltip>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <span>
                                            Carbon Intensity
                                            <Tooltip title={getCarbonIntensityDesc()}>
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </span>
                                    }
                                >
                                    <FrownTwoTone twoToneColor="#ad2715" className={styles.faceIcon} />
                                    {countryData.carbonIntensity.value.toLocaleString()}&nbsp;
                                    {formatElementWithCO2(countryData.carbonIntensity.unit)}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <span>
                                            Potential Carbon Reduction
                                            <Tooltip
                                                title={getCarbonBenefitsDesc(
                                                    `${countryData.installedCapacity.value.toLocaleString()}${
                                                        countryData.installedCapacity.unit
                                                    }`
                                                )}
                                            >
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </span>
                                    }
                                >
                                    {countryData.carbonBenefits.value.toLocaleString()}&nbsp;
                                    {formatElementWithCO2(countryData.carbonBenefits.unit)}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <span>
                                            Potential Solar Power Generation
                                            <Tooltip
                                                title={getElecAvailabilityDesc(
                                                    `${countryData.installedCapacity.value.toLocaleString()}${
                                                        countryData.installedCapacity.unit
                                                    }`
                                                )}
                                            >
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </span>
                                    }
                                >
                                    {countryData.electricityAvailability.value.toLocaleString()}&nbsp;
                                    {countryData.electricityAvailability.unit}
                                </Descriptions.Item>
                                {/* <Descriptions.Item label="Max. Installation Capacity">
                                    {countryData.installedCapacity.value.toLocaleString()}&nbsp;
                                    {countryData.installedCapacity.unit}
                                </Descriptions.Item> */}

                                <Descriptions.Item
                                    span={2}
                                    label={
                                        <span>
                                            Current Solar Power Generation
                                            <Tooltip title={getSolarPowerGenerationDesc()}>
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </span>
                                    }
                                >
                                    {countryData.solarElectricityPercent} of total power generated
                                </Descriptions.Item>
                                <Descriptions.Item label="Description" span={3}>
                                    <Paragraph
                                        ellipsis={{
                                            rows: 2,
                                            expandable: true,
                                            symbol: "more",
                                        }}
                                        style={{ fontSize: 16 }}
                                    >
                                        {countryData.description}
                                    </Paragraph>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={8}>
                            <div>
                                <img
                                    className={styles.detailImg}
                                    alt={`${countryData.name} Map`}
                                    src={countryImages[countryData.name.replace(/\s+/g, "")]}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <Divider />
                <Title level={5} className={styles.solarPanelFundTitle}>
                    Select a Solar Panel to Fund
                </Title>
                <SolarPanel countryData={countryData} onSelectSolarPanel={props.onSelectSolarPanel} />
            </Card>
        );
    } else {
        return <></>;
    }
}
