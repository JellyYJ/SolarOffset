import { Col, Row, Typography } from "antd";
import styles from "./index.less";
const { Title } = Typography;
export default function GlobalFooter() {
    return (
        <div className={styles.footerWrapper}>
            <div className={styles.content}>
                <Title level={5} type="secondary">
                    Resources
                </Title>
                <Row>
                    <Col span={12}>
                        <div className={styles.resource}>
                            UK carbon intensity -{" "}
                            <a target="_blank" href="https://carbonintensity.org.uk">
                                https://carbonintensity.org.uk
                            </a>
                        </div>
                        <div className={styles.resource}>
                            Countrys' photovoltaic power output -{" "}
                            <a target="_blank" href="https://globalsolaratlas.info/global-pv-potential-study">
                                https://globalsolaratlas.info/global-pv-potential-study
                            </a>
                        </div>
                        <div className={styles.resource}>
                            Solar panels'(PV system) type, area, installed capacity, and TPPOUT -{" "}
                            <a target="_blank" href="https://globalsolaratlas.info/map">
                                https://globalsolaratlas.info/map
                            </a>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className={styles.resource}>
                            Carbon intensity of African countries -{" "}
                            <a target="_blank" href="https://ourworldindata.org/energy-access">
                                https://ourworldindata.org/energy-access
                            </a>
                        </div>
                        <div className={styles.resource}>
                            Solar energy installation capacity of African countries -{" "}
                            <a
                                target="_blank"
                                href="https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2022/Apr/IRENA_RE_Capacity_Statistics_2022.pdf"
                            >
                                IRENA_RE_Capacity_Statistics_2022.pdf
                            </a>
                        </div>
                        <div className={styles.resource}>
                            Rules for calculating solar power generation and carbon offsets -{" "}
                            <a target="_blank" href="https://www.electricitymaps.com">
                                https://www.electricitymaps.com
                            </a>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
