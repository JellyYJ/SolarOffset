import PageContainer from "@/components/PageContainer";
import Header from "./header";
import styles from "./index.less";
import Tab from "./tab";

export default function Page() {
    return (
        <PageContainer>
            <div className={styles.wrapper}>
                <Header />
                <Tab />
            </div>
        </PageContainer>
    );
}
