import { ReactComponent as SunIcon } from "@/assets/sun.svg";
import { getCurrentUserInfo } from "@/services/api";
import { Alert } from "antd";
import { useEffect, useState } from "react";
import largeHouse from "../../assets/largeHouse.png";
import styles from "./index.less";

export default function Header() {
    const houseImg = largeHouse;
    const [houseFootprint, setHouseFootprint] = useState(8000);
    const [loginStatus, setLoginStatus] = useState(false);

    useEffect(() => {
        getCurrentUserInfo()
            .then((res) => {
                const footprint = res?.data?.carbonFootprint;
                if (footprint) {
                    setHouseFootprint(footprint);
                    setLoginStatus(true);
                }
            })
            .catch((err) => {
                setLoginStatus(false);
            });
    }, []);
    return (
        <section>
            <Alert
                className={styles.alert}
                type="success"
                message={
                    <>
                        <div className={styles.header}>
                            <img className={styles.house_img} src={houseImg} alt="House Icon" />
                            <div className={styles.title}>
                                {loginStatus
                                    ? "Your Yearly Carbon Footprint:"
                                    : "Your Estimated Yearly Carbon Footprint:"}
                            </div>
                            <div className={styles.rect}>
                                <p className={styles.carbon_text}>{houseFootprint} kg</p>
                            </div>
                        </div>
                        <div className={styles.fund_text}>
                            <span>
                                Take a look at these countries with <strong>more sunshine </strong> than the UK! &nbsp;
                            </span>
                            {/* TODO to get exact value of UK */}
                            <SunIcon className={`${styles.sunIcon} ${styles.active}`} />
                            <SunIcon className={`${styles.sunIcon} ${styles.active}`} />
                            <SunIcon className={styles.sunIcon} />
                            <SunIcon className={styles.sunIcon} />
                            <SunIcon className={styles.sunIcon} />
                        </div>
                    </>
                }
            />
        </section>
    );
}
