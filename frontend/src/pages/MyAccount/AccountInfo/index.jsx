import PageContainer from "@/components/PageContainer";
import { getCurrentUserInfo, updateUserName, updateUserPassword } from "@/services/api";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, message, Radio, Row, Statistic, Tooltip } from "antd";
import { useEffect, useState } from "react";
import largeHouse from "../../../assets/largeHouse.png";
import styles from "./index.less";

export default function AccountInfo() {
    // get User info from DB
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserInfo, setCurrentUserInfo] = useState(null);

    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [messageApi, messageContextHolder] = message.useMessage();

    const [editingPassword, setEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const userId = currentUserInfo?._id;

    /* Fetch data of user */
    useEffect(() => {
        getCurrentUserInfo()
            .then((res) => {
                if (res.data) {
                    setCurrentUserInfo(res.data);
                }
            })
            .catch((err) => {
                // token expired or deleted
                console.log(err);
            });
    }, []);
    // console.log("currentUserInfo: " + currentUserInfo);

    // Format the time
    // console.log(currentUserInfo);

    const createdAt = new Date(currentUserInfo?.createdAt);
    const formattedCreatedAt = `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;

    // Handle name editing
    const handleNameEdit = () => {
        setEditingName(true);
        setNewName(currentUserInfo?.name);
    };

    const handleNameCancel = () => {
        setEditingName(false);
    };

    const handleNameSave = async () => {
        try {
            await updateUserName(userId, newName);
            setCurrentUserInfo({ ...currentUserInfo, name: newName });
            setEditingName(false);
        } catch (err) {
            console.log(err.message);
            message.error("Error updating name, please try again later.");
        }
    };

    const handleNameChange = (e) => {
        setNewName(e.target.value);
    };

    // Handle password editing
    const handlePasswordEdit = () => {
        setEditingPassword(true);
        setNewPassword("");
        setOldPassword("");
        setPasswordError("");
    };

    const handlePasswordCancel = () => {
        setEditingPassword(false);
        setNewPassword("");
        setOldPassword("");
        setPasswordError("");
    };

    const handlePasswordSave = async () => {
        try {
            // await updateUserPassword(userId, oldPassword, newPassword);
            const response = await updateUserPassword(userId, oldPassword, newPassword);
            if (response.error) {
                setPasswordError(response.error);
                message.error(response.message);
            } else {
                setCurrentUserInfo({ ...currentUserInfo, password: newPassword });
                setEditingPassword(false);
                setNewPassword("");
                setOldPassword("");
                setPasswordError("");
                message.success("Password updated successfully");
            }
        } catch (err) {
            setNewPassword("");
            setOldPassword("");
            setPasswordError(err);
            console.log(err.message);
            message.error("Error updating password, please try again.");
        }
    };

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleOldPasswordChange = (e) => {
        setOldPassword(e.target.value);
    };

    // Radio button handling
    const [value, setValue] = useState(2); // set default value to 2

    const onChange = (e) => {
        console.log("radio checked", e.target.value);
        setValue(e.target.value);
    };

    return (
        <PageContainer>
            <div className={styles.container}>
                <div className={styles.infoContainer}>
                    <Card title="Basic Information">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={24}>
                                <Statistic
                                    title="Name:"
                                    value={currentUserInfo?.name}
                                    valueStyle={{
                                        color: "#22577A",
                                        fontSize: "18px",
                                        maxWidth: "100%",
                                        wordWrap: "break-word",
                                    }}
                                    suffix={
                                        editingName ? (
                                            <>
                                                <Input
                                                    value={newName}
                                                    onChange={handleNameChange}
                                                    addonBefore="Name"
                                                    autoFocus
                                                />

                                                <Button type="primary" onClick={handleNameSave} icon={<SaveOutlined />}>
                                                    Save
                                                </Button>
                                                <Button onClick={handleNameCancel} icon={<CloseOutlined />}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Tooltip title="Click to change name">
                                                <EditOutlined onClick={handleNameEdit} />
                                            </Tooltip>
                                        )
                                    }
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Solar Fund"
                                    value={
                                        currentUserInfo?.totalFunded % 1 === 0
                                            ? currentUserInfo?.totalFunded
                                            : currentUserInfo?.totalFunded?.toFixed(2)
                                    }
                                    prefix="£"
                                    valueStyle={{ color: "#22577A", fontSize: "18px" }}
                                />
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Create Time"
                                    value={formattedCreatedAt}
                                    valueStyle={{ color: "#22577A", fontSize: "18px" }}
                                />
                            </Col>
                        </Row>
                        <Col xs={24} sm={12} md={6}></Col>
                    </Card>

                    <Card title="Contact Information">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={12}>
                                <Statistic
                                    title="E-mail:"
                                    value={currentUserInfo?.email}
                                    valueStyle={{ color: "#22577A", fontSize: "18px" }}
                                />
                            </Col>

                            <Radio.Group className={styles.radioGroup} onChange={onChange} value={value}>
                                <Col span={24}>
                                    <Radio value={1} style={{ fontSize: "16px", marginTop: "16px" }}>
                                        I want to receive promotional email
                                    </Radio>
                                </Col>
                                <Col span={24}>
                                    <Radio value={2} style={{ fontSize: "16px", marginTop: "10px" }}>
                                        I DON'T want to receive promotional email
                                    </Radio>
                                </Col>
                            </Radio.Group>
                        </Row>
                    </Card>

                    <Card title="Password">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={12}>
                                <Statistic
                                    title="Password:"
                                    value="*********"
                                    valueStyle={{ color: "#22577A", fontSize: "18px" }}
                                    suffix={
                                        editingPassword ? (
                                            <>
                                                <Input.Password
                                                    value={oldPassword}
                                                    onChange={handleOldPasswordChange}
                                                    placeholder="Old Password"
                                                />
                                                <Input.Password
                                                    value={newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="New Password"
                                                />
                                                <Button
                                                    type="primary"
                                                    onClick={handlePasswordSave}
                                                    icon={<SaveOutlined />}
                                                >
                                                    Save
                                                </Button>
                                                <Button onClick={handlePasswordCancel} icon={<CloseOutlined />}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Tooltip title="Click to change password">
                                                <EditOutlined onClick={handlePasswordEdit} />
                                            </Tooltip>
                                        )
                                    }
                                />
                            </Col>
                        </Row>
                    </Card>
                </div>

                <div className={styles.picContainer}>
                    <img src={largeHouse} alt="Profile Picture" style={{ width: "100%" }} />
                    {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}
                </div>
            </div>
        </PageContainer>
    );
}
