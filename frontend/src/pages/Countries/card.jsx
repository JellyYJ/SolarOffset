import { ReactComponent as MapIcon } from "@/assets/map.svg";
import { Button, Card, Checkbox, Tooltip } from "antd";
import CountryBasicInfo from "./CountryBasicInfo";
import "./index.less";
import styles from "./index.less";
const { Meta } = Card;

// Card form antd
export default function CountryCard(props) {
    const {
        image,
        name,
        carbonIntensity,
        carbonIntensityUnit,
        pvout,
        pvoutUnit,
        // carbonBenefit,
        population,
        handleChange,
        numChecked,
        checked,
        onClick,
        onClickViewMap,
        isAvailable,
    } = props;

    const handleCardClick = (e) => {
        // check if user clicks the checkbox
        if (_.get(e, "target.tagName") !== "INPUT") {
            onClick();
        }
    };

    return (
        <Card
            className={`country_card ${checked ? "selectedCard" : ""}`}
            cover={<img alt={`${name} Map`} src={image} />}
            hoverable
            actions={[
                carbonIntensity ? (
                    <Button type="primary" onClick={onClick}>
                        Check Details
                    </Button>
                ) : (
                    <Button type="primary" disabled onClick={onClick}>
                        Coming Soon
                    </Button>
                ),
            ]}
        >
            <Meta
                title={
                    <div>
                        <span className={styles.country_card_title}>{name}</span>
                        {!!carbonIntensity && (
                            <Tooltip title="View on Map">
                                <MapIcon
                                    className={styles.mapIcon}
                                    style={{ float: "right" }}
                                    onClick={onClickViewMap}
                                />
                            </Tooltip>
                        )}
                    </div>
                }
                description={
                    <div>
                        <CountryBasicInfo
                            name={name}
                            pvout={pvout}
                            population={population}
                            pvoutUnit={pvoutUnit}
                            carbonIntensity={carbonIntensity}
                            carbonIntensityUnit={carbonIntensityUnit}
                        />
                        {/* <div className={styles.cardDescriptionLine}>
                            Carbon Benefits: {carbonBenefit}
                            <Tooltip title="The environmental and economic benefits of using solar energy">
                                <InfoCircleOutlined className={styles.infoIcon} />
                            </Tooltip>
                        </div> */}
                    </div>
                }
            />
            <Checkbox
                disabled={!isAvailable}
                onChange={(e) => handleChange(e.target.checked, numChecked, name)}
                className="checkbox"
            />
        </Card>
    );
}
