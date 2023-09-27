import { formattedCO2 } from "@/utils/utils";
import { FrownTwoTone, MehTwoTone, SmileTwoTone } from "@ant-design/icons";
import { Button, Col, Divider, Row, Statistic } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.less";

export default function LocationDetail(props) {
    // get prefix icon for carbon intensity
    const getPrefixForCarbonItensity = (index) => {
        if (index === "very low") {
            return <SmileTwoTone twoToneColor="#36cfc9" />;
        } else if (index === "low") {
            return <SmileTwoTone twoToneColor="#57CC99" />;
        } else if (index === "moderate") {
            return <MehTwoTone twoToneColor="#FAAD14" />;
        } else if (index === "high") {
            return <MehTwoTone twoToneColor="#FAAD14" />;
        } else if (index === "very high") {
            return <FrownTwoTone twoToneColor="#ad2715" />;
        } else {
            return "";
        }
    };
    const [generationMix, setGenerationMix] = useState({});

    useEffect(() => {
        const mix = _.get(props.detail, "data[0].generationmix", []);
        let mixMap = {};
        if (mix.length) {
            for (let ele of mix) {
                mixMap[ele["fuel"]] = ele["perc"];
            }
        }
        setGenerationMix(mixMap);
    }, [props.detail]);

    const handleNext = () => {
        props.onOk();
    };
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Statistic title="Your Location" value={props.detail.shortname} />
                </Col>
                <Col span={12}>
                    <Statistic
                        title="Carbon Intensity"
                        value={_.get(props.detail, "data[0].intensity.forecast", "-")}
                        prefix={getPrefixForCarbonItensity(_.get(props.detail, "data[0].intensity.index", ""))}
                        suffix={<span>g{formattedCO2()}</span>}
                    />
                </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={16}>
                <Col span={8}>
                    <Statistic title="Solar" value={generationMix.solar} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Wind" value={generationMix.wind} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Hydro" value={generationMix.hydro} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Biomass" value={generationMix.biomass} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Gas" value={generationMix.gas} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="coal" value={generationMix.coal} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Nuclear" value={generationMix.nuclear} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Imports" value={generationMix.imports} suffix="%" />
                </Col>
                <Col span={8}>
                    <Statistic title="Other" value={generationMix.other} suffix="%" />
                </Col>
            </Row>
            <div className={styles.drawerButtonWrapper}>
                <Button style={{ marginRight: 12 }} onClick={props.onGoBack}>
                    Back
                </Button>
                <Button key="submit" type="primary" onClick={handleNext}>
                    Offset Carbon
                </Button>
            </div>
        </>
    );
}
