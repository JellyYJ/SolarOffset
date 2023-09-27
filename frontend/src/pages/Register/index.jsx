import { postLogin, register } from "@/services/api";
import { saveUserIdInSession } from "@/services/utils";
import { Button, Form, Input, message, Modal } from "antd";
import _ from "lodash";
import { history, useLocation, useNavigate } from "umi";
import styles from "./index.less";

const Register = (props) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();

    const location = useLocation();
    const navigate = useNavigate();

    const onFinish = (values) => {
        const options = {
            name: values.name,
            email: values.email,
            password: values.password,
        };
        register(options)
            .then((res) => {
                // successfully created
                if (res.data.userId) {
                    postLogin({ email: values.email, password: values.password }).then((response) => {
                        const userId = _.get(response, "data.userId", "");
                        if (userId) {
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
                    });
                } else {
                    throw new Error("Error occurs when register!");
                }
            })
            .catch((err) => {
                console.log("Err", err);
                const msg = _.get(err, "response.data[0].msg", "");
                errorMessage("Sorry. " + (msg || err.message));
                console.log("Error occurs when register:", err);
            });
    };

    const handleCancel = () => {
        props.onCancel();
        form.resetFields();
    };

    const clickLogin = () => {
        props.onCancel();
        props.openLogin();
    };

    const errorMessage = (content) => {
        messageApi.open({
            type: "error",
            //content: "Sorry, the email or password you entered is incorrect!",
            content: content,
        });
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Registration"
                open={props.open}
                onCancel={handleCancel}
                className={styles.modal}
                okButtonProps={{
                    style: { display: "none" },
                }}
                cancelButtonProps={{
                    style: { display: "none" },
                }}
                width={380}
            >
                <div className={styles.formContainer}>
                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        scrollToFirstError
                        className={styles.registerForm}
                        layout="vertical"
                    >
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your name.",
                                    whitespace: true,
                                },
                            ]}
                        >
                            <Input placeholder="Display Name" />
                        </Form.Item>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    type: "email",
                                    message: "The input is not a valid Email.",
                                },
                                {
                                    required: true,
                                    message: "Please enter your Email.",
                                },
                            ]}
                        >
                            <Input placeholder="Email Address" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter your password.",
                                },
                                {
                                    min: 8,
                                    max: 20,
                                    message: "Please choose a password with 8-20 characters.",
                                },
                            ]}
                            hasFeedback
                        >
                            <Input.Password placeholder="Password" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            label="Confirm Password"
                            dependencies={["password"]}
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password.",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("The two passwords that you entered do not match.")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password placeholder="Confirm Password" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" className={styles.registerFormButton}>
                            Register
                        </Button>
                        <div className={styles.registerButtonWrapper}>
                            Already have an account? <a onClick={clickLogin}>Login here!</a>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default Register;
