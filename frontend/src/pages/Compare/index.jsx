import { Card } from "antd";
import { useLocation } from "umi";
import PageContainer from "../../components/PageContainer";
import Compare from "./compare";

export default function Page() {
    // fetch the counrty id
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const countryId1 = searchParams.get("countryId1");
    const countryId2 = searchParams.get("countryId2");

    // error handling
    if (countryId1 && countryId2) {
        return (
            <section>
                <PageContainer>
                    <Card title="Compare Countries">
                        <Compare countryId1={countryId1} countryId2={countryId2} />
                    </Card>
                </PageContainer>
            </section>
        );
    } else {
        return (
            <section>
                <PageContainer>
                    <Card title="Compare Countries">
                        <Compare />
                    </Card>
                </PageContainer>
            </section>
        );
    }
}
