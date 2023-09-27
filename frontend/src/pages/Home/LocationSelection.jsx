import { getCarbonIntensity } from "@/services/api";
import { AutoComplete, Button, message } from "antd";
import _ from "lodash";
import { useState } from "react";
import styles from "./index.less";
import { checkPostcode, getRegionMap } from "./utils";

export default function LocationSelection(props) {
    const [messageApi, contextHolder] = message.useMessage();
    const regionMap = getRegionMap();

    const locationOptions = Object.values(regionMap).map((ele) => ({ value: ele.name }));
    // loading when fetching location carbon output data from server
    const [loading, setLoading] = useState(false);
    // TODO ask user for location permission
    const [locationValue, setLocationValue] = useState("");

    const handleOk = () => {
        if (locationValue in regionMap) {
            // if select a region from the list
            setLoading(true);
            getCarbonIntensity({ region: _.get(regionMap[locationValue], "id", "") })
                .then((res) => {
                    let data = res.data;
                    setLoading(false);
                    const detailData = _.get(data, "data[0]", {});
                    props.onOk(detailData);
                })
                .catch((err) => {
                    messageApi.open({ type: "error", content: err.message });
                    setLoading(false);
                });
        } else {
            // check the validation of the input
            try {
                const postcodeResult = checkPostcode(locationValue);
                if (!postcodeResult) {
                    throw new Error("invalid postcode");
                }
                setLoading(true);
                getCarbonIntensity({ region: postcodeResult[3].toUpperCase() })
                    .then((res) => {
                        let data = res.data;
                        setLoading(false);
                        const detailData = _.get(data, "data[0]", {});
                        props.onOk(detailData);
                    })
                    .catch((err) => {
                        messageApi.open({ type: "error", content: err.message });
                        setLoading(false);
                    });
            } catch (e) {
                messageApi.open({ type: "error", content: "Please enter a correct postcode or select a region" });
            }
        }
    };
    const onChangeLocation = (value) => {
        setLocationValue(value);
    };
    return (
        <>
            {contextHolder}
            <div>Want to see the current carbon footprint in your area?</div>
            {/* TODO add validation for input value, such as !@#$% */}
            <AutoComplete
                style={{ width: "100%", marginTop: 4 }}
                value={locationValue}
                options={locationOptions}
                placeholder="Select or enter your postcode"
                onChange={onChangeLocation}
                filterOption={(inputValue, option) =>
                    option.value
                        .replace(/\s/g, "")
                        .toUpperCase()
                        .indexOf(inputValue.replace(/\s/g, "").toUpperCase()) !== -1
                }
            />
            <div className={styles.drawerButtonWrapper}>
                <Button style={{ minWidth: 80 }} key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Go
                </Button>
            </div>
        </>
    );
}
