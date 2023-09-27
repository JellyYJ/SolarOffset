import { ReactComponent as TreeIcon } from "@/assets/treeIcon.svg";
import PageContainer from "@/components/PageContainer";
import { getAllPayments, getStaffStatistics } from "@/services/staff";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Tabs, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import styles from "./index.less";
import StatisticsTableCard from "./StatisticsTableCard";
import TransactionTableCard from "./TransactionTableCard";

// used for exported CSV of countries details
const countryCSVHeaders = [
    { label: "Country", key: "name" },
    { label: "Installation Capacity", key: "installedCapacity" },
    { label: "Total Carbon Offset(kg)", key: "totalCarbon" },
    { label: "Total Fund(£)", key: "totalFunded" },
];

// used for exported CSV of transactions
const transactionCSVHeaders = [
    { label: "Email", key: "email" },
    { label: "Name", key: "name" },
    { label: "Country", key: "country" },
    { label: "Carbon Offset(kg)", key: "carbonOffset" },
    { label: "Fund Amount(£)", key: "amountFunded" },
    { label: "Status", key: "paymentStatus" },
    { label: "Time", key: "transactionTime" },
];

export default function Statistics() {
    const [activeTabKey, setActiveTabKey] = useState("1");
    const [countriesData, setCountriesData] = useState([]);
    const [transactionData, setTransactionData] = useState([]);
    const [totalCarbonInfo, setTotalCarbonInfo] = useState({});
    useEffect(() => {
        getStaffStatistics()
            .then((res) => {
                if (res.data) {
                    setCountriesData(res.data.countriesData);
                    setTotalCarbonInfo(res.data.totalCarbonInfo);
                }
            })
            .catch((err) => {
                console.log("err", err);
            });
        getAllPayments().then((res) => {
            if (res.data) {
                setTransactionData(res.data);
            }
        });
    }, []);

    const exportCSVContent = () => {
        if (activeTabKey === "1") {
            const csvData = countriesData.map((ele) => ({ ...ele, totalCarbon: ele.totalCarbon.toFixed(2) }));
            return (
                <Tooltip title="Export a CSV file of details for each country">
                    <CSVLink data={csvData} headers={countryCSVHeaders} filename={"details-for-each-country.csv"}>
                        <Button icon={<DownloadOutlined />} type="primary">
                            Export CSV
                        </Button>
                    </CSVLink>
                </Tooltip>
            );
        } else {
            const csvData = transactionData.map((ele) => ({
                ...ele,
                carbonOffset: ele.carbonOffset.toFixed(2),
                transactionTime: new Date(ele.transactionTime * 1000).toLocaleString(),
            }));
            return (
                <Tooltip title="Export a CSV file of all transactions">
                    <CSVLink data={csvData} headers={transactionCSVHeaders} filename={"all-transactions.csv"}>
                        <Button icon={<DownloadOutlined />} type="primary">
                            Export CSV
                        </Button>
                    </CSVLink>
                </Tooltip>
            );
        }
    };

    return (
        <PageContainer>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} xl={6}>
                    <Card className={styles.statisticCard} bordered={false}>
                        <Statistic
                            title="Total Carbon Offset"
                            value={totalCarbonInfo.totalCarbonOffset || "0"}
                            suffix="kg"
                            precision={2}
                            valueStyle={{ color: "#22577A" }}
                        />
                        {/* <div className={styles.statisticDivider}></div>
                        <span className={styles.statisticDailyDetail}>Daily Carbon Offset: - kg</span> */}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} xl={6}>
                    <Card className={styles.statisticCard} bordered={false}>
                        <Statistic
                            title="Total Carbon Saved"
                            value={totalCarbonInfo.totalTree || "0"}
                            valueStyle={{ color: "#22577A" }}
                            prefix={
                                <span>
                                    <TreeIcon className={styles.treeIcon} /> ×
                                </span>
                            }
                        />
                        {/* <div className={styles.statisticDivider}></div>
                        <span className={styles.statisticDailyDetail}>
                            Daily Carbon Saved: <TreeIcon className={`${styles.treeIcon} ${styles.sm}`} /> × -
                        </span> */}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} xl={6}>
                    <Card className={styles.statisticCard} bordered={false}>
                        <Statistic
                            title="Total Solar Panels Bought"
                            value={totalCarbonInfo.totalPanelsBought || "0"}
                            precision={2}
                            valueStyle={{ color: "#22577A" }}
                        />
                        {/* <div className={styles.statisticDivider}></div>
                        <span className={styles.statisticDailyDetail}>Daily Solar Panels Bought: -</span> */}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={12} xl={6}>
                    <Card className={styles.statisticCard} bordered={false}>
                        <Statistic
                            title="Total Fund"
                            value={totalCarbonInfo.totalFunded || "0"}
                            prefix="£"
                            valueStyle={{ color: "#22577A" }}
                        />
                        {/* <div className={styles.statisticDivider}></div>
                        <span className={styles.statisticDailyDetail}>Daily Fund: £ -</span> */}
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginTop: 24 }}>
                <Tabs
                    activeKey={activeTabKey}
                    tabBarExtraContent={exportCSVContent()}
                    onTabClick={(tab) => setActiveTabKey(tab)}
                    items={[
                        {
                            label: "Details for Each Country",
                            key: "1",
                            children: <StatisticsTableCard data={countriesData} />,
                        },
                        {
                            label: "All Transactions",
                            key: "2",
                            children: <TransactionTableCard data={transactionData} />,
                        },
                    ]}
                ></Tabs>
            </Card>
        </PageContainer>
    );
}
