import GlobalFooter from "@/components/GlobalFooter";
import GlobalHeader from "@/components/GlobalHeader";
import rootReducer from "@/stores/index";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { Outlet, useAppData, useLocation } from "umi";
import styles from "./index.less";

export default function Layout() {
    const { clientRoutes } = useAppData();
    const location = useLocation();
    const store = createStore(rootReducer);
    return (
        <Provider store={store}>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "#38A3A5",
                        colorLink: "#38A3A5",
                        colorLinkHover: "#6FB1B0",
                        colorLinkActive: "#3E797F",
                        navy: "#22577A",
                        primary1: "#d8e6e3",
                        primary2: "#ccd9d7",
                        primary3: "#a7ccc9",
                        primary4: "#7ebfbc",
                        primary5: "#59b3b1",
                        primary7: "#257b80",
                        primary8: "#155459",
                        primary9: "#0a2e33",
                        primary10: "#020b0d",
                    },
                }}
            >
                <GlobalHeader></GlobalHeader>
                <div className={styles.outletWrapper}>
                    <Outlet />
                    <GlobalFooter />
                </div>
            </ConfigProvider>
        </Provider>
    );
}
