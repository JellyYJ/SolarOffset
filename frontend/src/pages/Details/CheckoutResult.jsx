import { getCountryDetails, getCurrentUserInfo } from "@/services/api";
import { getUserIdFromSession } from "@/services/utils";
import { ShareAltOutlined } from "@ant-design/icons";
import { Button, message, Result } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "umi";

/**
 * Checkout Result Page
 * showing successful or cancelled payment
 */
const CheckoutResult = (props) => {
    const { successData, onGoBack } = props;
    const [price, setPrice] = useState(0);
    // const myHouseType = localStorage.getItem("myHouseType");

    const [countryData, setCountryData] = useState(null);
    //error handling
    const [error, setError] = useState(null);
    const [carbonFootprint, setCarbonFootprint] = useState(8000);

    const location = useLocation();
    // to get queries from url
    const paymentPanelId = new URLSearchParams(location.search).get("panel_id");
    const paymentCountryId = new URLSearchParams(location.search).get("countryId");

    // request country data when loading for the first time
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getCountryDetails(paymentCountryId);
                setCountryData(response);
                setError(null);
            } catch (err) {
                setError(err.message);
                setCountryData(null);
            } finally {
            }
        }

        fetchData();

        getCurrentUserInfo()
            .then((res) => {
                if (res.data) {
                    const footprint = res.data.carbonFootprint;
                    if (footprint) {
                        setCarbonFootprint(footprint);
                    }
                }
            })
            .catch((err) => {});
    }, []);

    const index = countryData?.solarPanels.findIndex((panel) => panel._id === paymentPanelId);
    const carbonEmissionResult = props.paymentResponse?.data.payment.carbonOffset;
    const result = ((carbonEmissionResult / carbonFootprint) * 100).toFixed(2) + "%";

    const userId = getUserIdFromSession();

    return successData === 1 ? (
        <Result
            status="success"
            title={
                <>
                    Thank you!
                    <br />
                    You've successfully funded a Solar Panel in {countryData?.name}!
                </>
            }
            subTitle={
                <>
                    Order number: {props.paymentResponse?.data.payment._id}
                    <br />
                    Solar Panel Plan: Plan {index + 1} - £ {countryData?.solarPanels[index].price.value}
                    <br />
                    Actual payment amount: £{props.paymentResponse?.data.payment.amountFunded}
                    <br />
                    For a {index === 0 ? "small" : "medium"} house, with a capacity of{" "}
                    {countryData?.solarPanels[index].installedCapacity.value}{" "}
                    {countryData?.solarPanels[index].installedCapacity.unit} and generating an average of{" "}
                    {countryData?.solarPanels[index].tppout.value} {countryData?.solarPanels[index].tppout.unit} of
                    electricity
                    <br />
                    You help save {carbonEmissionResult}kg carbon offset annually ({result} of your carbon footprint).
                </>
            }
            extra={[
                userId ? (
                    <Button key="Dashboard" href="/my-account/dashboard">
                        Go My Dashboard
                    </Button>
                ) : null,
                /*  <Button key="buy" href="/countries">
                      View Countries
                  </Button>,*/
                <Button
                    type="primary"
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                        message.info("Sorry, sharing is currently unavailable.");
                    }}
                >
                    Share to Friends
                </Button>,
            ]}
        />
    ) : (
        <Result
            status="warning"
            title="Payment Cancelled"
            extra={
                <Button type="primary" key="console" onClick={() => onGoBack()}>
                    Go Back
                </Button>
            }
        />
    );
};

export default CheckoutResult;
