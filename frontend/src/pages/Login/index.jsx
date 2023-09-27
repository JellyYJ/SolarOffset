import { postLogin } from "@/services/api";
import { saveUserIdInSession } from "@/services/utils";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal } from "antd";
import _ from "lodash";
import { history, useLocation, useNavigate } from "umi";
import styles from "./index.less";

/**
 * Login Modal
 * @param {*} props
 * @returns Login
 */
const Login = (props) => {
    const [form] = Form.useForm();
    //const [confirmLoading, setConfirmLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    //const [error, setError] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const handleCancel = () => {
        form.resetFields();
        props.onCancel();
    };

    const onFinish = (values) => {
        const options = {
            email: values.email,
            password: values.password,
        };
        postLogin(options)
            .then((response) => {
                const userId = _.get(response, "data.userId", "");
                if (userId) {
                    // save userId to sessionStorage
                    saveUserIdInSession(userId);
                    handleCancel();
                    // if the page is the checkout result page, jump to the country list page after login or register
                    // to get queries from url
                    const paymentSuccess = new URLSearchParams(location.search).get("success");
                    const paymentCanceled = new URLSearchParams(location.search).get("canceled");
                    if (paymentSuccess || paymentCanceled) {
                        history.push("/countries");
                        navigate(0);
                    } else {
                        navigate(0);
                    }
                }
            })
            .catch((error) => {
                const msg = _.get(error, "response.data.Error");
                loginErrorMessage("Sorry. " + (msg || error.message));
                console.log("Error getting login details!", error);
            });
    };
    const forgotMessage = () => {
        messageApi.open({
            type: "warning",
            content: "Sorry, this feature is still under development.",
        });
    };

    const loginErrorMessage = (content) => {
        messageApi.open({
            type: "error",
            //content: "Sorry, the email or password you entered is incorrect!",
            content: content,
        });
    };

    const clickRegister = () => {
        props.onCancel();
        props.openRegister();
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Login to Your Account"
                open={props.open}
                //confirmLoading={confirmLoading}
                onCancel={handleCancel}
                className={styles.modal}
                width={380}
                okButtonProps={{
                    style: { display: "none" },
                }}
                cancelButtonProps={{
                    style: { display: "none" },
                }}
            >
                <div className={styles.formContainer}>
                    <Form
                        form={form}
                        name="normal_login"
                        className={styles.loginForm}
                        initialValues={{
                            remember: false,
                        }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Email!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined className="site-form-item-icon" />}
                                placeholder="Email"
                                className={styles.formInput}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input your Password!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                type="password"
                                placeholder="Password"
                            />
                        </Form.Item>
                        <a className={styles.loginFormForgot} onClick={forgotMessage}>
                            Forgot your password?
                        </a>
                        <Button type="primary" htmlType="submit" className={styles.loginFormButton}>
                            Log In
                        </Button>
                        <div className={styles.registerButtonWrapper}>
                            Don't have an account? <a onClick={clickRegister}>Register now!</a>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default Login;
