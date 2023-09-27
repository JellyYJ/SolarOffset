import PageContainer from "@/components/PageContainer";
import { Button, Result } from "antd";
import { history } from "umi";
export default function MyAccount() {
    const handleBackHome = () => {
        history.push("/");
    };
    return (
        <div>
            <PageContainer>
                <Result
                    status="404"
                    title="404"
                    subTitle="Sorry, the page you visited does not exist."
                    extra={
                        <Button type="primary" onClick={handleBackHome}>
                            Back Home
                        </Button>
                    }
                />
            </PageContainer>
        </div>
    );
}
