import { ReactComponent as SunIcon } from "@/assets/sun.svg";
import styles from "./index.less";

// center latitude and longitutde for each country
export const getCountryCenterCoord = (countryName) => {
    switch (countryName) {
        case "South Africa":
            return { lng: 24, lat: -29 };
            break;
        case "Algeria":
            return { lng: 2, lat: 29 };
            break;
        case "Morocco":
            return { lng: -6.5, lat: 32 };
            break;
        case "Egypt":
            return { lng: 30, lat: 27 };
            break;
        default:
            return {};
            break;
    }
};

export const formatPvout = (pvValue) => {
    const minPvValue = 4;
    const maxPvValue = 5.35;
    const normalisedValue = (pvValue - minPvValue) / (maxPvValue - minPvValue);

    let sunIconCount = Math.floor(normalisedValue * 4) + 1;
    sunIconCount = Math.max(Math.min(sunIconCount, 5), 1);
    let elements = [];

    for (let i = 0; i < 5; i++) {
        if (i < sunIconCount) {
            elements.push(<SunIcon key={`${name}_${i}`} className={`${styles.sunIcon} ${styles.active}`} />);
        } else {
            elements.push(<SunIcon key={`${name}_${i}`} className={styles.sunIcon} />);
        }
    }
    return <>{elements}</>;
};
