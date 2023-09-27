import MediumPanelImg from "@/assets/panelMedium.jpg";
import SmallPanelImg from "@/assets/panelSmall.jpg";
import { getTPPOUTDesc } from "@/utils/utils";
import { QuestionCircleOutlined, RocketOutlined } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Row, Tooltip } from "antd";
import { useState } from "react";
import styles from "./index.less";

export default function SolarPanel(props) {
    const [selectedPanel, setSelectedPanels] = useState(-1);

    const handlePanelSelect = (solarId) => {
        setSelectedPanels(solarId);
        // save to sessionStorage to deal with payment failure

        // props.onChangePanel(solarId);
    };
    const onSelectSolarPanel = (solarId) => {
        sessionStorage.setItem("selectedSolarPanel", solarId);
        props.onSelectSolarPanel(solarId);
    };
    //TODO: Add Image and properly align the cards
    if (props.countryData && Object.keys(props.countryData).length) {
        return (
            <Row gutter={[24, 16]}>
                {props.countryData.solarPanels.map(
                    (item, index) =>
                        index <= 1 && (
                            <Col key={item._id} span={12}>
                                <Card
                                    className={selectedPanel === index ? styles.selectedCard : ""}
                                    title={"Solar Panel Plan " + (index + 1)}
                                    hoverable
                                    onClick={() => handlePanelSelect(index)}
                                >
                                    <Row gutter={16}>
                                        <Col span={18}>
                                            <Descriptions size="small" className={styles.detailDescription}>
                                                <Descriptions.Item span={3} label="Solar Panel Type">
                                                    {item.type}
                                                </Descriptions.Item>
                                                <Descriptions.Item span={3} label="Installation Area">
                                                    {item.installationArea}
                                                </Descriptions.Item>
                                                <Descriptions.Item span={3} label="Installation Capacity">
                                                    {item.installedCapacity.value} {item.installedCapacity.unit}
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                    span={3}
                                                    label={
                                                        <Row>
                                                            Total Solar Power Output
                                                            <Tooltip title={getTPPOUTDesc()}>
                                                                <QuestionCircleOutlined
                                                                    className={styles.detailPageInfoIcon}
                                                                />
                                                            </Tooltip>
                                                        </Row>
                                                    }
                                                >
                                                    {item.tppout.value} {item.tppout.unit}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Col>
                                        <Col span={6}>
                                            <img
                                                className={styles.solarPanelImg}
                                                src={item.type.startsWith("Small") ? SmallPanelImg : MediumPanelImg}
                                            />
                                        </Col>
                                    </Row>
                                    <h2 className={styles.title}>£ {item.price.value}</h2>
                                    <div className={styles.donateButtonWrapper}>
                                        {/* TODO add onSelectSolarPanel */}
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<RocketOutlined />}
                                            onClick={() => onSelectSolarPanel(index)}
                                        >
                                            Donate From £5
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        )
                )}
            </Row>
        );
    }
}
