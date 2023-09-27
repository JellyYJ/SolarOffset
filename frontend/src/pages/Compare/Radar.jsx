import { Radar } from "@ant-design/plots";
import { theme } from "antd";

const labelList = [
    "Carbon Intensity",
    "Potential Carbon Reduction",
    "Potential Solar Power Generation",
    "Max. Installing Capacity",
    "Curr. Solar Power Generation",
];

export default function RadarComponent({ countryData, max }) {
    // get color hex value from global theme
    const { token } = theme.useToken();
    const { colorPrimary } = token;
    const getCountryData = () => {
        const {
            name,
            carbonIntensity,
            carbonBenefits,
            electricityAvailability,
            installedCapacity,
            solarElectricityPercent,
        } = countryData;
        return [
            { name, item: "1", value: parseFloat(carbonIntensity.value.toFixed(2)) }, // Round to two decimal places },
            { name, item: "2", value: parseFloat(carbonBenefits.value / 1000) },
            {
                name,
                item: "3",
                value: parseFloat(electricityAvailability.value / 1000),
            },
            { name, item: "4", value: parseFloat(installedCapacity.value.toFixed(2)) },
            { name, item: "5", value: parseFloat(solarElectricityPercent) * 1000 },
        ];
    };

    // Set max value for radars
    const country1Data = getCountryData();

    // const max = Math.max(...country1Data.map((item) => item.value), ...country2Data.map((item) => item.value));

    const config1 = {
        data: country1Data,
        xField: "item",
        yField: "value",
        seriesField: "name",
        color: colorPrimary,
        yAxis: {
            max: Math.ceil(max / 1000) * 1000,
            label: {
                formatter: (value) => `${value}`,
            },
            grid: {
                alternateColor: "rgba(0, 0, 0, 0.04)",
            },
            label: null, // hide the label of yAxis
        },
        // xAxis: {
        //     line: null,
        //     tickLine: null,
        //     grid: {
        //         line: {
        //             style: {
        //                 lineDash: null,
        //             },
        //         },
        //     },
        // },
        // xAxis: {
        //     label: null,
        // },
        // shadow the area
        area: {},
        point: {
            size: 3,
            shape: "polygon",
        },
        legend: false, // hide the legend
        // defaultInteractions: [], // disabled the interaction when hovering
        tooltip: {
            title: (item) => labelList[parseInt(item) - 1],
            formatter: (datum) => {
                const { item } = datum;
                if (item === "1") {
                    return { name: datum.name, value: datum.value + " gCO2" };
                } else if (item === "2") {
                    return { name: datum.name, value: (datum.value * 1000).toLocaleString() + " kgCO2" };
                } else if (item === "3") {
                    return { name: datum.name, value: (datum.value * 1000).toLocaleString() + " MWh" };
                } else if (item === "4") {
                    return { name: datum.name, value: datum.value.toLocaleString() + " kW" };
                } else if (item === "5") {
                    return { name: datum.name, value: datum.value / 1000 + "%" };
                }
            },
        },
    };

    return <Radar {...config1} />;
}
