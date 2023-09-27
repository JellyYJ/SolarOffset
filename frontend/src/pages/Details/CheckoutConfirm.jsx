import MediumPanelImg from "@/assets/panelMedium.jpg";
import SmallPanelImg from "@/assets/panelSmall.jpg";
import { getCurrentUserInfo } from "@/services/api";
import { getTPPOUTDesc } from "@/utils/utils";
import { ArrowLeftOutlined, InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, InputNumber, Radio, Row, Space, Tooltip } from "antd";
import { useEffect, useState } from "react";
import styles from "./index.less";

/**
 * Checkout Confirm Page
 * to show the details of your selected panel
 * and to choose the amount of donation you would like to pay
 * @param {} props
 * @returns CheckoutConfirm
 */
const CheckoutConfirm = (props) => {
    const { countryData, selectedSolarPanel } = props;
    const [value, setValue] = useState(1);
    const [price, setPrice] = useState(0);
    const [panelDetail, setPanelDetail] = useState(null);
    const [percent, setPercent] = useState(0);
    const [newPrice, setNewPrice] = useState(0);
    // loading for donate button
    const [donateLoading, setDonateLoading] = useState(false);
    const total = newPrice || 0;

    const onChange = (e) => {
        setValue(e.target.value);
        handlePercentChange(e);
    };
    const [emissionSaved, setEmissionSaved] = useState(null);
    const [emissionPercent, setEmissionPercent] = useState(0);
    const [houseFootprint, setHouseFootprint] = useState(8000);

    const handlePercentChange = (e) => {
        const percentValue = e.target.value;
        let newPriceValue = 0;
        if (percentValue == 1) {
            newPriceValue = price * 0.1;
        }
        if (percentValue == 2) {
            newPriceValue = price * 0.25;
        }
        if (percentValue == 3) {
            newPriceValue = price * 0.5;
        }
        if (percentValue == 4) {
            newPriceValue = price;
        }
        if (percentValue == 5) {
            setPercent(5);
            handleCustomAmountChange(e);
        }
        setPercent(percentValue); // update percent value
        setNewPrice(newPriceValue);
        props.handleTotal(newPriceValue);
    };

    const handleCustomAmountChange = (value) => {
        const customValue = value;
        const newPriceValue = parseFloat(customValue);
        if (newPriceValue > price) {
            setNewPrice(price);
        } else {
            setNewPrice(newPriceValue);
        }
        setPercent(5);
        props.handleTotal(newPriceValue);
    };
    useEffect(() => {
        getCurrentUserInfo().then((res) => {
            const footprint = res?.data?.carbonFootprint;
            if (footprint) {
                setHouseFootprint(footprint);
            }
        });
    }, []);

    useEffect(() => {
        try {
            const solarPanel = countryData.solarPanels[selectedSolarPanel];
            setPrice(solarPanel.price.value);
            setPanelDetail(solarPanel);
            const emissions = countryData?.carbonIntensity.value * solarPanel?.tppout.value * (newPrice / price);
            setEmissionSaved(
                emissions.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })
            );
            setEmissionPercent((emissions / houseFootprint) * 100);
        } catch (err) {
            console.log("err get price", err && err.message);
        }
    }, [countryData, selectedSolarPanel, newPrice, price, houseFootprint]);

    return (
        <Card
            className={styles.detailCard}
            title={
                <Row>
                    <Col span={8}>
                        <Button icon={<ArrowLeftOutlined />} onClick={props.onBack}>
                            Back
                        </Button>
                    </Col>
                    <Col span={8} style={{ textAlign: "center" }}>
                        <span className={styles.cardTitle}>{countryData?.name}</span>
                    </Col>
                </Row>
            }
        >
            <div style={{ paddingBottom: "24px" }}>
                <Alert
                    message="Carbon Offset"
                    description={`You are going to save about ${
                        emissionSaved ? emissionSaved : 0
                    } kg carbon emissions annually (${
                        emissionPercent ? emissionPercent.toFixed(2) : 0
                    }% of your carbon footprint)`}
                    type="success"
                    showIcon
                />
            </div>
            <Row gutter={16}>
                <Col span={12}>
                    <h2 className={styles.h2Title}>Fund Information</h2>
                    <Row>
                        <Col span={16}>
                            <Descriptions className={styles.detailDescription} size="small" column={1}>
                                <Descriptions.Item label="Country">{countryData && countryData.name}</Descriptions.Item>
                                <Descriptions.Item label="Solar Panel Plan">
                                    Plan {selectedSolarPanel + 1} - £ {price}
                                </Descriptions.Item>
                                <Descriptions.Item label="Solar Panel Type">{panelDetail?.type}</Descriptions.Item>
                                <Descriptions.Item label="Installation Area">
                                    {panelDetail?.installationArea}
                                </Descriptions.Item>
                                <Descriptions.Item label="Installation Capacity">
                                    {panelDetail?.installedCapacity.value} {panelDetail?.installedCapacity.unit}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Row>
                                            Total Solar Power Output
                                            <Tooltip title={getTPPOUTDesc()}>
                                                <QuestionCircleOutlined className={styles.detailPageInfoIcon} />
                                            </Tooltip>
                                        </Row>
                                    }
                                >
                                    {panelDetail?.tppout.value} {panelDetail?.tppout.unit}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={8}>
                            <img
                                className={styles.solarPanelImg}
                                src={selectedSolarPanel === 0 ? SmallPanelImg : MediumPanelImg}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Card>
                        <h2 className={styles.h2Title}>Pay</h2>
                        <Descriptions column={1} size="small" className={styles.detailDescription}>
                            <Descriptions.Item label="Amount">£ {price}</Descriptions.Item>
                            <Descriptions.Item label={<>Payment Methods</>}>
                                <Tooltip title="Sorry, we only support Stripe for now.">
                                    <InfoCircleOutlined className={styles.infoIcon} />
                                </Tooltip>
                            </Descriptions.Item>
                        </Descriptions>
                        <Space direction="vertical" size="small">
                            <Row>
                                <Radio.Group onChange={onChange} value={value} optionType="button">
                                    <Radio value={1}>Stripe</Radio>
                                    <Radio value={2} disabled>
                                        Paypal
                                    </Radio>
                                </Radio.Group>
                            </Row>
                            <Descriptions
                                size="small"
                                column={1}
                                layout="vertical"
                                className={styles.detailDescription}
                            >
                                <Descriptions.Item label="You can donate a part of the amount">
                                    <Row>
                                        <Radio.Group onChange={handlePercentChange} value={percent} optionType="button">
                                            <Radio value={1}>10%</Radio>
                                            <Radio value={2}>25%</Radio>
                                            <Radio value={3}>50%</Radio>
                                            <Radio value={4}>All</Radio>
                                            <Radio value={5}>Custom</Radio>
                                        </Radio.Group>
                                        <InputNumber
                                            style={{ display: percent === 5 ? "flex" : "none" }}
                                            placeholder="Other amount"
                                            type="number"
                                            min={5}
                                            step={5}
                                            prefix="£"
                                            className={styles.customAmount}
                                            value={newPrice}
                                            onChange={handleCustomAmountChange}
                                        />
                                    </Row>
                                </Descriptions.Item>
                            </Descriptions>
                            <h2 className={styles.total}>Total: £ {total}</h2>
                        </Space>
                        <Row>
                            <Button
                                size="large"
                                loading={donateLoading}
                                style={{ width: "100%" }}
                                type="primary"
                                disabled={!total}
                                onClick={() => {
                                    setDonateLoading(true);
                                    props.onPayment();
                                }}
                            >
                                Donate
                            </Button>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};
export default CheckoutConfirm;
