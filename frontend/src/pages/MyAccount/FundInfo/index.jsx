import { getCarbonInfo } from "@/services/api";
import { getUserIdFromSession } from "@/services/utils";
import { Card, Input, Table, theme } from "antd";
import { useEffect, useState } from "react";

const { Search } = Input;

export default function MyTransaction() {
    const { token } = theme.useToken();
    const { colorPrimary, navy } = token;
    // original table data from server
    const [originalTableData, setOriginalTableData] = useState([]);
    // table data used for search
    const [tableData, setTableData] = useState([]);
    // get User info from DB
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userFundInfo, setFundInfo] = useState(null);
    const [currentFundInfo, setCurrentFundInfo] = useState([]);

    /* Fetch data of user */
    useEffect(() => {
        const userId = getUserIdFromSession();
        if (userId) {
            getCarbonInfo({ userId })
                .then((res) => {
                    setFundInfo(userId);
                    if (res.data) {
                        setCurrentFundInfo(res.data);
                        const tableData = res.data.payments.map((payment, index) => {
                            return {
                                key: index, // add a unique key for each row
                                orderNumber: payment._id,
                                country: payment.countryname,
                                amountFunded: payment.amountFunded,
                                transactionTime: payment.createdAt,
                                carbonOffset: payment.carbonOffset,
                                // map other payment properties as needed
                            };
                        });
                        setTableData(tableData);
                        setOriginalTableData(tableData);
                    }
                })
                .catch((err) => {
                    // token expired or deleted
                    setFundInfo("");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, []);
    console.log("currentFundInfo", currentFundInfo);

    const columns = [
        {
            title: "#",
            dataIndex: "key",
            width: 30,
            align: "right",
            render: (_, record, index) => index + 1,
        },
        {
            title: "Order Number",
            dataIndex: "orderNumber",
            key: "orderNumber",
            width: 80,
        },
        {
            title: "Country",
            dataIndex: "country",
            key: "country",
            width: 100,
        },
        {
            title: "Fund",
            dataIndex: "amountFunded",
            key: "amountFunded",
            width: 100,
            align: "right",
            render: (data) => "£" + data,
            sorter: (a, b) => a.amountFunded - b.amountFunded,
        },
        {
            title: "Carbon Offset",
            dataIndex: "carbonOffset",
            key: "carbonOffset",
            width: 120,
            align: "right",
            render: (data) => data + "kg",
            sorter: (a, b) => a.carbonOffset - b.carbonOffset,
        },
        {
            title: "Fund Time",
            dataIndex: "transactionTime",
            key: "fundTime",
            width: 150,
            align: "right",
            defaultSortOrder: "descend",
            sorter: (a, b) => new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime(),
            render: (text) => {
                const createdAt = new Date(text);
                const formattedCreatedAt = `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;
                return formattedCreatedAt;
            },
        },
    ];

    const onSearch = (value) => {
        if (value) {
            const searchValue = value.replace(/\s/g, "").toUpperCase();
            const filteredData = originalTableData.filter((ele) =>
                ele.country.replace(/\s/g, "").toUpperCase().includes(searchValue)
            );
            setTableData(filteredData);
        } else {
            setTableData(originalTableData);
        }
    };
    return (
        /* <PageContainer>*/
        <Card
            title="Transactions"
            extra={<Search placeholder="Search by Country" allowClear enterButton="Search" onSearch={onSearch} />}
        >
            <Table
                columns={columns}
                dataSource={tableData}
                rowKey={(record) => record.orderNumber}
                scroll={{
                    x: 1000,
                }}
            />
        </Card>
        /* </PageContainer>*/
    );
}
