import PageContainer from "@/components/PageContainer";
import { getCountryDetails, postStripePayment, validStripePayment } from "@/services/api";
import { Steps, theme } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useLocation, useMatch } from "umi";
import CheckoutConfirm from "./CheckoutConfirm";
import CheckoutResult from "./CheckoutResult";
import CountryDetails from "./CountryDetails";

const Details = () => {
    const { token } = theme.useToken();

    // match current countryId from url
    const match = useMatch("/countries/:id");
    const countryId = _.get(match, "params.id", "");
    // save the detail of current country
    const [countryData, setCountryData] = useState(null);
    //error handling
    const [error, setError] = useState(null);
    /* const [paymentId, setPaymentId] = useState(null);*/
    const handleTotal = (total) => {
        setTotal(total);
    };
    const [total, setTotal] = useState(0);
    const [paymentResponse, setPaymentResponse] = useState(null);

    // request country data when loading for the first time
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getCountryDetails(countryId);
                setCountryData(response);
                setError(null);
            } catch (err) {
                setError(err.message);
                setCountryData(null);
            } finally {
            }
        }

        fetchData();
    }, []);

    // set status for Step component
    const [currentStep, setCurrentStep] = useState(0);

    // get the solarPanel which user selects
    const [selectedSolarPanel, setSelectedSolarPanel] = useState(-1);

    // if payment failure, get the selectedSolarPanel from sessionStorage
    useEffect(() => {
        if (selectedSolarPanel === -1) {
            setSelectedSolarPanel(parseInt(sessionStorage.getItem("selectedSolarPanel")));
        }
    }, []);

    const [isSuccess, setIsSuccess] = useState(0);

    const handleSelectSolarPanel = (solarId) => {
        setSelectedSolarPanel(solarId);
        next();
        window.scrollTo(0, 0);
    };

    const steps = [
        {
            title: "Select Solar Panel Plan",
            content: <CountryDetails countryData={countryData} onSelectSolarPanel={handleSelectSolarPanel} />,
        },
        {
            title: "Confirm and Check Out",
            content: (
                <CheckoutConfirm
                    countryData={countryData}
                    selectedSolarPanel={selectedSolarPanel}
                    handleTotal={handleTotal}
                    onPayment={() => handlePayment()}
                    onBack={() => prev()}
                />
            ),
        },
        {
            title: "Finished",
            content: (
                <CheckoutResult
                    successData={isSuccess}
                    /*paymentId={paymentId}*/
                    paymentResponse={paymentResponse}
                    onGoBack={() => {
                        window.history.pushState({}, document.title, window.location.pathname);
                        setCurrentStep(1);
                    }}
                />
            ),
        },
    ];

    const next = () => {
        setCurrentStep(currentStep + 1);
    };
    const prev = () => {
        setCurrentStep(currentStep - 1);
    };
    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    const contentStyle = {
        lineHeight: "26px",
        // textAlign: "center",
        color: token.colorTextTertiary,
        backgroundColor: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        // border: `1px dashed ${token.colorBorder}`,
        marginTop: 16,
    };

    /*    const handlePayment = () => {
            const options = {
                countryId: countryData._id,
                price: countryData.solarPanels[selectedSolarPanel].price.value,
            };
            return postStripePayment(options)
                .then((response) => {
                    window.location.href = response.data.url;
                })
                .catch((err) => {
                    console.log("payment err", err);
                });
        };*/

    const handlePayment = async () => {
        const options = {
            countryId: countryData._id,
            price: total,
            panelId: countryData.solarPanels[selectedSolarPanel]._id,
            country: countryData.name,
        };
        try {
            const response = await postStripePayment(options);
            // console.log("[postStripePayement] response", response);
            window.location.href = response.data.url;
        } catch (error) {
            console.log("payment error", error);
        }
    };

    const location = useLocation();
    // to get queries from url
    const paymentSuccess = new URLSearchParams(location.search).get("success");
    const paymentCanceled = new URLSearchParams(location.search).get("canceled");
    const paymentSessionId = new URLSearchParams(location.search).get("session_id");
    const paymentPanelId = new URLSearchParams(location.search).get("panel_id");
    const paymentCountryId = new URLSearchParams(location.search).get("countryId");
    const paymentCountry = new URLSearchParams(location.search).get("country");

    const handlePaymentIdChange = () => {
        // Do something with paymentId here
        // console.log("paymentId", paymentId);
    };

    useEffect(() => {
        if (paymentSuccess) {
            setCurrentStep(2);
            setIsSuccess(1);
            validPayment();
        } else if (paymentCanceled) {
            setCurrentStep(2);
            setIsSuccess(0);
        }
    }, [paymentSuccess, paymentCanceled]);

    /*    useEffect(() => {
            handlePaymentIdChange();
        }, [paymentId]);*/

    const validPayment = async () => {
        const options = {
            sessionId: paymentSessionId,
            countryId: paymentCountryId,
            panelId: paymentPanelId,
            country: paymentCountry,
        };
        try {
            const response = await validStripePayment(options);
            setPaymentResponse(response);
            /*setPaymentId(response.data.paymentId);*/
            // window.location.href = response.data.url;
        } catch (error) {
            console.log("payment error", error);
        }
    };

    return (
        <PageContainer>
            <Steps current={currentStep} items={items} />
            <div style={contentStyle}>{steps[currentStep].content}</div>
        </PageContainer>
    );
};
export default Details;
