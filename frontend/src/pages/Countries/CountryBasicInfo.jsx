import { formatElementWithCO2, getCarbonIntensityDesc } from "@/utils/utils";
import { FrownTwoTone, QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import styles from "./index.less";
import { formatPvout } from "./utils";

export default function CountryBasicInfo(props) {
    const { name, pvout, pvoutUnit, population, carbonIntensity, carbonIntensityUnit } = props;

    return (
        <>
            <div className={styles.cardDescriptionLine}>
                <Tooltip placement="topLeft" title={`Potential Solar Power(PVOUT): ${pvout} ${pvoutUnit}`}>
                    {formatPvout(pvout)}
                </Tooltip>
            </div>
            <div className={styles.cardDescriptionLine}>
                <label>Population: </label>
                {population ? population : "-"}
            </div>
            <div className={styles.cardDescriptionLine}>
                <label>
                    Carbon Intensity
                    <Tooltip title={getCarbonIntensityDesc()}>
                        <QuestionCircleOutlined className={styles.infoIcon} />
                    </Tooltip>
                    :&nbsp;
                </label>
                {carbonIntensity ? (
                    <>
                        <FrownTwoTone twoToneColor="#ad2715" className={styles.faceIcon} />
                        {carbonIntensity}
                        {formatElementWithCO2(carbonIntensityUnit)}
                    </>
                ) : (
                    "-"
                )}
            </div>
        </>
    );
}
