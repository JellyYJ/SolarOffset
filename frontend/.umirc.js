import { defineConfig } from "umi";

export default defineConfig({
    routes: [
        { path: "/", component: "Home/index" },
        { path: "/countries", component: "Countries/index" },
        { path: "/countries/:id", component: "Details/index" },
        { path: "/compare", component: "Compare/index" },
        {
            path: "/my-account",
            redirect: "/my-account/dashboard",
        },
        {
            path: "/my-account/dashboard",
            component: "MyAccount/Dashboard/index",
        },
        {
            path: "/my-account/account-information",
            component: "MyAccount/AccountInfo/index",
        },
        {
            path: "/staff",
            component: "Staff/Statistics/index",
        },
        {
            path: "/admin",
            component: "Admin/AccountManagement/index",
        },
        { path: "/*", component: "404" },
    ],
    theme: {
        "@colorPrimary": "#38A3A5",
        "@colorPrimaryHover": "#6FB1B0",
        "@colorLightGreen": "#57CC99",
        "@colorLighterGreen": "#80ED99",
        "@colorBg": "#D8F3DC",
        "@colorNavy": "#22577A",
        "@colorCyan": "#36CFC9",
        "@colorWarning": "#FAAD14",
        "@colorError": "#FF4D4F",
        "@colorErrorHover": "#EE8079",
        "@colorErrorActive": "#C84544",
        "@colorPageBg": "#f3fff5",
        "@colorGreyLabel": "#00000073",
        "@colorDivider": "#f0f0f0",
        "@colorGrey5": "#d9d9d9",
    },
    npmClient: "npm",
    // history: { type: "hash" },
    // exportStatic: {
    //     htmlSuffix: true,
    //     dynamicRoot: true,
    // },
});
