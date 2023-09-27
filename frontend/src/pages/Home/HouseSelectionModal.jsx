import largeHouseImg from "@/assets/largeHouse.png";
import mediumHouseImg from "@/assets/mediumHouse.png";
import smallHouseImg from "@/assets/smallHouse.png";
import { Button, Card, Col, message, Modal, Row } from "antd";
import { useState } from "react";
import styles from "./index.less";

const { Meta } = Card;

export default function HouseSelectionModal(props) {
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedHouse, setSelectedHouse] = useState(0); // 1-small, 2-medium, 3-large
    const handleNext = () => {
        if (!selectedHouse) {
            messageApi.open({ type: "error", content: "Please select your house type" });
        } else {
            props.onOk(selectedHouse);
        }
    };
    const handleCancel = () => {
        props.onCancel();
    };
    const handleCardClick = (houseSize) => {
        setSelectedHouse(houseSize);
    };

    return (
        <>
            {contextHolder}
            <Modal
                className={styles.modalCenterFooter}
                open={props.open}
                title="Select Your Household to Find Out its Carbon Footprint"
                onOk={handleNext}
                onCancel={handleCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handleNext}>
                        Confirm
                    </Button>,
                ]}
                mask={false}
                maskClosable={false}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Card
                            className={selectedHouse === 1 ? styles.selectedCard : ""}
                            hoverable
                            cover={<img className={styles.houseImg} src={smallHouseImg} />}
                            onClick={() => handleCardClick(1)}
                        >
                            <Meta title="Small" description="1-2 Bed Flat" />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            className={selectedHouse === 2 ? styles.selectedCard : ""}
                            hoverable
                            cover={<img className={styles.houseImg} src={mediumHouseImg} />}
                            onClick={() => handleCardClick(2)}
                        >
                            <Meta title="Medium" description="3-4 Bed Flat" />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            className={selectedHouse === 3 ? styles.selectedCard : ""}
                            hoverable
                            cover={<img className={styles.houseImg} src={largeHouseImg} />}
                            onClick={() => handleCardClick(3)}
                        >
                            <Meta title="Large" description=">5 Bed Flat" />
                        </Card>
                    </Col>
                </Row>
            </Modal>
        </>
    );
}
