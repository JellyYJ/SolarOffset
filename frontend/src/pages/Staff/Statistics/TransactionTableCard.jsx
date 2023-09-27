import { Table, Tag } from "antd";

const columns = [
    {
        title: "#",
        dataIndex: "index",
        key: "index",
        render: (_, record, index) => index + 1,
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (data) => (data ? data : "-"),
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (data) => (data ? data : "Anonymous"),
    },
    {
        title: "Country",
        dataIndex: "country",
        key: "country",
    },
    {
        title: "Carbon Offset",
        dataIndex: "carbonOffset",
        key: "carbonOffset",
        align: "right",
        sorter: (a, b) => a.carbonOffset - b.carbonOffset,
        render: (data) => data.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "kg",
    },
    {
        title: "Fund Amount",
        dataIndex: "amountFunded",
        key: "amountFunded",
        align: "right",
        sorter: (a, b) => a.amountFunded - b.amountFunded,
        render: (data) => "£" + data.toLocaleString(),
    },
    {
        title: "Status",
        dataIndex: "paymentStatus",
        key: "paymentStatus",
        render: (data) => {
            if (data === "paid") {
                return <Tag color="success">{data}</Tag>;
            } else {
                return <Tag>{data}</Tag>;
            }
        },
    },
    {
        title: "Time",
        dataIndex: "transactionTime",
        key: "transactionTime",
        align: "right",
        defaultSortOrder: "descend",
        sorter: (a, b) => a.transactionTime - b.transactionTime,
        render: (data) => new Date(data * 1000).toLocaleString(),
    },
];

export default function TransactionTableCard(props) {
    const { data } = props;
    return (
        <Table
            dataSource={data}
            columns={columns}
            rowKey={(row) => row._id}
            scroll={{
                x: 1000,
            }}
            pagination={{
                defaultPageSize: 10,
                showTotal: (total) => `${total} records in total`,
                showSizeChanger: true,
            }}
        />
    );
}
