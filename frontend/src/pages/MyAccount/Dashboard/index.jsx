import PageContainer from "@/components/PageContainer";
import MyTransaction from "@/pages/MyAccount/FundInfo";
import MyFund from "./MyFund";

export default function Dashboard() {
    return (
        <div>
            <PageContainer>
                <MyFund />
                <br />
                <MyTransaction />
            </PageContainer>
        </div>
    );
}
