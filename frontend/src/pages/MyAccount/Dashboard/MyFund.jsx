import { getCurrentUserInfo, updateFootprint } from "@/services/api";
import { deleteUserIdInSession } from "@/services/utils";
import { EditOutlined } from "@ant-design/icons";
import { Button, Card, Col, InputNumber, Modal, Popconfirm, Row, Select, Statistic } from "antd";
import { useEffect, useState } from "react";
import { history } from "umi";
import HouseSelectionModal from "../../Home/HouseSelectionModal";
import styles from "./index.less";
const { Option } = Select;

export default function MyFund() {
    // control the visibility of house type selection modal
    const [houseSelectionOpen, setHouseSelectionOpen] = useState(false);
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const [editFootprintOpen, setEditFootprintOpen] = useState(false);
    // for user entering footprint
    const [editFootprint, setEditFootprint] = useState(null);
    const [footprintUnit, setFootprintUnit] = useState("kg");

    const onHouseSelectionOk = (houseType) => {
        setHouseSelectionOpen(false);
        const footprint = getHouseFootprintForType(houseType);
        updateFootprint({ carbonFootprint: footprint }).then((res) => {
            fetchCurrentUserInfo();
        });
    };

    const handleHouseTypeChange = () => {
        setHouseSelectionOpen(true);
    };

    const getHouseFootprintForType = (houseType) => {
        switch (houseType) {
            case 1:
                return 5000;
                break;
            case 2:
                return 8000;
                break;
            case 3:
                return 12000;
                break;
            default:
                return 8000;
                break;
        }
    };

    // handle Offset More btn clicked
    const handleOnClick = () => {
        history.push({
            pathname: "/countries",
        });
    };

    // get User info from DB
    const [userInfo, setUserInfo] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);

    /* Fetch data of user */
    useEffect(() => {
        fetchCurrentUserInfo();
    }, []);

    const fetchCurrentUserInfo = () => {
        getCurrentUserInfo()
            .then((res) => {
                setUserInfo(res.data._id);
                if (res.data) {
                    setCurrentUserInfo(res.data);
                    setEditFootprint(res.data.carbonFootprint);
                    setFootprintUnit("kg");
                    // setHouseFootprint(res.data.carbonFootprint);
                }
            })
            .catch((err) => {
                // token expired or deleted
                console.log(err);
                deleteUserIdInSession();
                setUserInfo("");
            });
    };

    const onChangeEditFootprint = (value) => {
        setEditFootprint(value);
    };

    const onConfirmEditFootprint = () => {
        let footprint = editFootprint;
        if (footprintUnit === "ton") {
            footprint = editFootprint * 1000;
        }
        if (editFootprint) {
            updateFootprint({ carbonFootprint: footprint }).then((res) => {
                fetchCurrentUserInfo();
            });
        }
    };
    const onSelectChange = (value) => {
        if (value === "kg") {
            setEditFootprint(editFootprint * 1000);
            setFootprintUnit("kg");
        } else if (value === "ton") {
            setEditFootprint(editFootprint / 1000);
            setFootprintUnit("ton");
        }
    };

    const selectAfter = (
        <Select
            defaultValue="kg"
            style={{
                width: 70,
            }}
            value={footprintUnit}
            onChange={onSelectChange}
        >
            <Option value="kg">kg</Option>
            <Option value="ton">ton</Option>
        </Select>
    );

    return (
        <>
            <Card title="My Solar Panel Fund">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Total Carbon Offset (annually)"
                            value={
                                currentUserInfo?.totalCarbonOffset % 1 === 0
                                    ? currentUserInfo?.totalCarbonOffset
                                    : currentUserInfo?.totalCarbonOffset?.toFixed(2)
                            }
                            suffix="kg"
                            valueStyle={{ color: "#22577A" }}
                        />
                        <Button className={styles.button} type="primary" onClick={handleOnClick}>
                            Offset More
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="My Carbon Footprint (annually)"
                            value={
                                !currentUserInfo?.carbonFootprint
                                    ? "-"
                                    : currentUserInfo?.carbonFootprint % 1 === 0
                                    ? currentUserInfo?.carbonFootprint
                                    : currentUserInfo?.carbonFootprint?.toFixed(2)
                            }
                            suffix={
                                <>
                                    kg
                                    <Popconfirm
                                        title="Enter Your Carbon Footprint"
                                        onConfirm={onConfirmEditFootprint}
                                        description={
                                            <InputNumber
                                                defaultValue={currentUserInfo?.carbonFootprint}
                                                style={{ width: "200px" }}
                                                onChange={onChangeEditFootprint}
                                                autoFocus
                                                addonAfter={selectAfter}
                                                value={editFootprint}
                                            ></InputNumber>
                                        }
                                    >
                                        <EditOutlined className={styles.editIcon} />
                                    </Popconfirm>
                                </>
                            }
                            valueStyle={{ color: "#22577A" }}
                        />
                        <Button className={styles.secButton} type="secondary" onClick={handleHouseTypeChange}>
                            Estimate by House Type
                        </Button>
                        <Button className={styles.secButton} type="secondary" onClick={() => setCalculatorOpen(true)}>
                            Use Footprint Calculator
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Total Fund"
                            value={
                                currentUserInfo?.totalFunded % 1 === 0
                                    ? currentUserInfo?.totalFunded
                                    : currentUserInfo?.totalFunded?.toFixed(2)
                            }
                            prefix="£"
                            valueStyle={{ color: "#22577A" }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="Total Solar Panels"
                            value={
                                currentUserInfo?.totalPanelsBought % 1 === 0
                                    ? currentUserInfo?.totalPanelsBought
                                    : currentUserInfo?.totalPanelsBought?.toFixed(2)
                            }
                            valueStyle={{ color: "#22577A" }}
                        />
                    </Col>
                </Row>
            </Card>

            <HouseSelectionModal
                open={houseSelectionOpen}
                onOk={onHouseSelectionOk}
                onCancel={() => setHouseSelectionOpen(false)}
            />
            <Modal
                title="Footprint Calculator (Third Party)"
                open={calculatorOpen}
                onCancel={() => setCalculatorOpen(false)}
                onOk={() => setCalculatorOpen(false)}
                width={800}
                footer={[
                    <Button type="primary" onClick={() => setCalculatorOpen(false)}>
                        OK
                    </Button>,
                ]}
            >
                <iframe
                    style={{ height: 400, width: "100%", border: "none" }}
                    id="carbon-footprint-iframe"
                    src="https://calculator.carbonfootprint.com/calculator.aspx?lang=en-GB"
                ></iframe>
            </Modal>
        </>
    );
}
