import { Table } from "antd";
const columns = [
    {
        title: "#",
        dataIndex: "index",
        key: "index",
        render: (_, record, index) => index + 1,
    },
    {
        title: "Country",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Max. Installation Capacity",
        dataIndex: "installedCapacity",
        key: "installedCapacity",
        align: "right",
        sorter: (a, b) => a.installedCapacity - b.installedCapacity,
        render: (data) => data?.toLocaleString() + "kW",
    },
    {
        title: "Total Carbon Offset",
        dataIndex: "totalCarbon",
        key: "totalCarbon",
        align: "right",
        sorter: (a, b) => a.totalCarbon - b.totalCarbon,
        render: (data) => data.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "kg",
    },
    {
        title: "Total Fund Amount",
        dataIndex: "totalFunded",
        key: "totalFunded",
        align: "right",
        sorter: (a, b) => a.totalFunded - b.totalFunded,
        render: (data) => "£" + data.toLocaleString(),
    },
    // {
    //     title: "Action",
    //     dataIndex: "action",
    //     key: "action",
    //     render: (_, record) => <Button>Export CSV</Button>,
    // },
];

export default function StatisticsTableCard(props) {
    const { data } = props;
    return (
        <Table
            dataSource={data}
            columns={columns}
            rowKey={(row) => row._id}
            pagination={{ defaultPageSize: 10, showSizeChanger: true, hideOnSinglePage: true }}
            showTotal={(total) => `Total ${total} items`}
        />
    );
}
