import Login from "@/pages/Login";
import Register from "@/pages/Register";
import {getCurrentUserInfo, postLogout} from "@/services/api";
import {saveUserIdInSession, deleteUserIdInSession} from "@/services/utils";
import {
    BarChartOutlined,
    HomeOutlined,
    RadarChartOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {Button, Col, Menu, Row} from "antd";
import _ from "lodash";
import {useEffect, useState} from "react";
import {history, useNavigate} from "umi";
import styles from "./index.less";

export default function GlobalHeader(props) {
    const navigate = useNavigate();
    const items = [
        {
            label: "Countries",
            key: "countries",
            icon: <HomeOutlined/>,
            role: ["guest", "user", "staff"],
        },
        {label: "Compare", key: "compare", icon: <RadarChartOutlined/>, role: ["guest", "user", "staff"]},
        {
            label: "My Account",
            key: "my-account",
            icon: <UserOutlined/>,
            children: [
                {label: "Dashboard", key: "dashboard"},
                {label: "Account Information", key: "account-information"},
            ],
            role: ["user", "staff"],
        },
        {label: "Statistics", key: "staff", icon: <BarChartOutlined/>, role: ["staff"]},
        {label: "Account Management", key: "admin", icon: <UsergroupAddOutlined/>, role: ["admin"]},
    ];

    // get current menu tab from url
    const currentPathName = _.get(history, "location.pathname").split("/");
    let currentMenu = _.get(currentPathName, "[1]", "countries");
    const [current, setCurrent] = useState(currentMenu);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    const [renderedItems, setRenderedItems] = useState(items.filter((ele) => ele.role.includes("guest")));

    // track if url changes
    useEffect(() => {
        return history.listen((location) => {
            const currentPathName = _.get(history, "location.pathname").split("/");
            setCurrent(_.get(currentPathName, "[1]", "countries"));
        });
    }, [history]);

    useEffect(() => {
        getCurrentUserInfo()
            .then((res) => {
                if (res.data) {
                    setCurrentUserId(res.data._id);
                    saveUserIdInSession(res.data._id);
                    setCurrentUserInfo(res.data);
                    const menus = items.filter((ele) => ele.role.includes(res.data.role));
                    setRenderedItems(menus);
                }
            })
            .catch((err) => {
                // token expired or deleted
                setCurrentUserId("");
                deleteUserIdInSession();
            });
    }, []);

    const onClick = (e) => {
        setCurrent(e.key);
        if (e.keyPath) {
            let path = "";
            // for those with sub-menus
            for (let key of e.keyPath) {
                // consider the case when menu is collapsed
                if (key === "rc-menu-more") {
                    continue;
                }
                path = `/${key}` + path;
            }
            history.push(path);
        } else {
            history.push(`/${e.key}`);
        }
    };

    const onClickTitle = (e) => {
        setCurrent("");
        history.push("/");
    };

    const openModal = () => {
        setLoginOpen(true);
    };

    const closeModal = () => {
        setLoginOpen(false);
    };

    const handleLogout = () => {
        postLogout()
            .then((res) => {
                if (res.data) {
                    setCurrentUserId("");
                    setCurrentUserInfo(null);
                    // return to the home page in case accessing some menus without permission
                    deleteUserIdInSession();
                    history.push("/");
                    // refresh page
                    navigate(0);

                }
            })
            .catch((err) => {
                console.error("error when logout", err.message);
            });
    };

    const openRegister = () => {
        setRegisterOpen(true);
    };
    const closeRegister = () => {
        setRegisterOpen(false);
    };

    return (
        <div className={styles.headerWrapper}>
            <Login open={loginOpen} onCancel={closeModal} openRegister={openRegister}/>
            <Register open={registerOpen} onCancel={closeRegister} openLogin={openModal}/>
            <Row className={styles.sloganBar}>
                <Col span={12} offset={6}>
                    <div className={styles.centerText}>
                        {!currentUserId
                            ? "Join The Movement! Track Your Progress!"
                            : `Welcome, ${currentUserInfo.name}!`}
                    </div>
                </Col>
                <Col span={6}>
                    <div className={styles.rightLogin}>
                        {!currentUserId ? (
                            <Button type="primary" onClick={openModal} className={styles.signupButton}>
                                Login / Register
                            </Button>
                        ) : (
                            <Button ghost onClick={handleLogout} className={styles.signupButton}>
                                Logout
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
            <div className={styles.headerContainer}>
                <div className={styles.title} onClick={onClickTitle}>
                    Solar Offset
                </div>
                <div className={styles.description}>Reduce Carbon Footprint Through Your Contribution</div>
                <Menu
                    className={styles.navMenu}
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="horizontal"
                    items={renderedItems}
                    disabledOverflow={true}
                />
            </div>
        </div>
    );
}
