import PageContainer from "@/components/PageContainer";
import { getAllUsers, updateUserRole, updateUserStatus } from "@/services/admin.js";
import { EllipsisOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Card, Divider, Dropdown, Input, message, Modal, Table, Tag, theme } from "antd";
import { useEffect, useState } from "react";
import styles from "./index.less";
const { Search } = Input;

export default function AccountManagement() {
    // using context to created a modal with custom theme
    const [modal, contextHolder] = Modal.useModal();
    // message showing results of updating option
    const [messageApi, messageContextHolder] = message.useMessage();

    const { token } = theme.useToken();
    const { colorPrimary, navy, primary9 } = token;

    // original table data from server
    const [originalTableData, setOriginalTableData] = useState([]);
    // table data used for search
    const [tableData, setTableData] = useState([]);

    const columns = [
        {
            title: "#",
            dataIndex: "key",
            width: 48,
            align: "right",
            render: (_, record, index) => index + 1,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 100,
            filters: [
                {
                    text: <Tag color="green">Enabled</Tag>,
                    value: "enabled",
                },
                {
                    text: <Tag color="grey">Disabled</Tag>,
                    value: "disabled",
                },
            ],
            onFilter: (value, record) => record.status === value,
            render: (value) =>
                value === "enabled" ? <Tag color="green">Enabled</Tag> : <Tag color="grey">Disabled</Tag>,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 250,
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            width: 88,
            filters: [
                {
                    text: <Tag color={colorPrimary}>User</Tag>,
                    value: "user",
                },
                {
                    text: <Tag color={navy}>Staff</Tag>,
                    value: "staff",
                },
            ],
            onFilter: (value, record) => record.role === value,
            render: (value) => {
                switch (value) {
                    case "staff":
                        return <Tag color={navy}>Staff</Tag>;
                        break;
                    case "user":
                        return <Tag color={colorPrimary}>User</Tag>;
                        break;
                    case "admin":
                        return <Tag color={primary9}>Admin</Tag>;
                        break;
                    default:
                        return <Tag>Unknown</Tag>;
                        break;
                }
            },
        },
        {
            title: "Total Fund",
            dataIndex: "totalFunded",
            key: "totalFunded",
            width: 120,
            align: "right",
            sorter: (a, b) => a.fund - b.fund,
        },
        {
            title: "Panels Bought",
            dataIndex: "totalPanelsBought",
            key: "totalPanelsBought",
            width: 150,
            align: "right",
            sorter: (a, b) => a.solarPanel - b.solarPanel,
            render: (value) => value.toFixed(2),
        },
        {
            title: "Carbon Offset",
            dataIndex: "totalCarbonOffset",
            key: "totalCarbonOffset",
            width: 150,
            align: "right",
            sorter: (a, b) => a.carbonOffset - b.carbonOffset,
            render: (value) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        },
        {
            title: "Update Time",
            dataIndex: "updatedAt",
            key: "updatedAt",
            width: 180,
            render: (value) => new Date(value).toLocaleString(),
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            fixed: "right",
            width: 160,
            render: (_, record) => {
                if (record.role === "staff" || record.role === "user") {
                    if (record.status === "disabled") {
                        return <Button onClick={() => showEnableConfirm(record)}>Enable</Button>;
                    } else {
                        return (
                            <>
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                label: "Disable",
                                                key: "disabled",
                                                danger: true,
                                            },
                                        ],
                                        onClick: () => showDisableConfirm(record),
                                    }}
                                >
                                    {record.role === "staff" ? (
                                        <Button ghost type="primary" onClick={() => showDegradeConfirm(record)}>
                                            Degrade
                                            <Divider type="vertical" />
                                            <EllipsisOutlined />
                                        </Button>
                                    ) : (
                                        <Button ghost type="primary" onClick={() => showUpgradeConfirm(record)}>
                                            Upgrade
                                            <Divider type="vertical" />
                                            <EllipsisOutlined />
                                        </Button>
                                    )}
                                </Dropdown>
                            </>
                        );
                    }
                }
            },
        },
    ];

    const getUsers = () => {
        getAllUsers()
            .then((res) => {
                // console.log("[getAllUsers]", res);
                if (res.data && res.data.length) {
                    // hide admin users in current page
                    const users = res.data.filter((ele) => ele.role !== "admin");
                    setOriginalTableData(users);
                    setTableData(users);
                }
            })
            .catch((err) => {
                console.log("error getAllUsers", err);
                // problems may happen with authorization
                messageApi.open({
                    type: "error",
                    content: "Error retrieving account list. Please check your login status and try again.",
                });
            });
    };

    useEffect(() => {
        getUsers();
    }, []);

    const onSearch = (value) => {
        if (value) {
            const searchValue = value.replace(/\s/g, "").toUpperCase();
            const filteredData = originalTableData.filter(
                (ele) =>
                    ele.email.replace(/\s/g, "").toUpperCase().includes(searchValue) ||
                    ele.name.replace(/\s/g, "").toUpperCase().includes(searchValue)
            );
            setTableData(filteredData);
        } else {
            setTableData(originalTableData);
        }
    };

    // enable or disable user/staff
    const onUpdateUserStatus = (record, status) => {
        const options = { userId: record._id, status };
        updateUserStatus(options)
            .then((res) => {
                messageApi.open({
                    type: "success",
                    content: "Successfully updated account's status",
                });
                getUsers();
            })
            .catch((err) => {});
    };

    // upgrade or degrade user/staff
    const onUpdateUserRole = (record, role) => {
        const options = { userId: record._id, role };
        console.log("options", options);
        updateUserRole(options)
            .then((res) => {
                console.log("Res", res);
                messageApi.open({
                    type: "success",
                    content: "Successfully updated account's role",
                });
                getUsers();
            })
            .catch((err) => {});
    };

    const showEnableConfirm = (record) => {
        modal.confirm({
            title: "Confirm Enable",
            icon: <ExclamationCircleFilled />,
            content: (
                <>
                    <div>Account Name: {record.name}</div>
                    <div>The account will be able to login and offset carbon again.</div>
                </>
            ),
            okText: "Enable",
            cancelText: "Cancel",
            onOk() {
                onUpdateUserStatus(record, "enabled");
            },
            onCancel() {},
        });
    };
    const showDisableConfirm = (record) => {
        modal.confirm({
            title: "Confirm Disable",
            icon: <ExclamationCircleFilled />,
            content: (
                <>
                    <div>Account Name: {record.name}</div>
                    <div>The account won't be able to login after being disabled.</div>
                    <div>You can enable the account again.</div>
                </>
            ),
            okText: "Disable",
            okType: "danger",
            cancelText: "Cancel",
            onOk() {
                onUpdateUserStatus(record, "disabled");
            },
            onCancel() {},
        });
    };

    const showUpgradeConfirm = (record) => {
        modal.confirm({
            title: "Confirm Upgrade",
            icon: <ExclamationCircleFilled />,
            content: (
                <>
                    <div>User Name: {record.name}</div>
                    <div>The user will be upgraded to staff.</div>
                </>
            ),
            okText: "Upgrade",
            cancelText: "Cancel",
            onOk() {
                onUpdateUserRole(record, "staff");
            },
        });
    };

    const showDegradeConfirm = (record) => {
        modal.confirm({
            title: "Confirm Degrade",
            icon: <ExclamationCircleFilled />,
            content: (
                <>
                    <div>Staff Name: {record.name}</div>
                    <div>The staff will be degraded to user.</div>
                </>
            ),
            okText: "Degrade",
            cancelText: "Cancel",
            onOk() {
                onUpdateUserRole(record, "user");
            },
        });
    };

    return (
        <PageContainer>
            {contextHolder}
            {messageContextHolder}
            <Card
                title="Account Management"
                extra={
                    <Search placeholder="Search by Name / Email" allowClear enterButton="Search" onSearch={onSearch} />
                }
            >
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey={(record) => record.email}
                    rowClassName={(record) => (record.status === "disabled" ? styles.disabledRow : "")}
                    scroll={{
                        x: 1400,
                    }}
                />
            </Card>
        </PageContainer>
    );
}
