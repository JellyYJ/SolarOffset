// Initialising country data
const Country = require("../models/country");
const countries = [
    new Country({
        name: 'South Africa',
        population: 59900000,
        landArea: 1213090.00,
        description: 'South Africa is a country on the southernmost tip of the African continent.\n' +
            '\n' +
            'It has a growing solar power industry with high potential due to its location in a region with abundant solar radiation. However, the country still heavily relies on coal-fired power plants, which contribute significantly to its carbon emissions. To mitigate its emissions, South Africa has committed to reducing its carbon emissions through its NDCs under the Paris Agreement and implemented carbon offset initiatives such as afforestation, reforestation, and renewable energy projects. These initiatives generate carbon credits that can be sold on the international market, providing economic benefits for local communities while reducing greenhouse gas emissions. While progress has been made, there is still much room for growth and improvement in South Africa\'s solar power and carbon offset initiatives.',
        carbonIntensity: 716,
        carbonBenefits: 4083527,
        pvout: 5.03,
        electricityAvailability: 5698194,
        installedCapacity: 6221,
        solarElectricityPercent: "2.98%",
        solarPanels: [
            {
                installationArea: "Dickenson Avenue",
                type:"Small residential",
                installedCapacity: 1,
                installedCapacityUnit: 'kWp',
                tppout: 1.716,
                price: 80,
            },
            {
                installationArea: "Emthanjeni Local Municipality",
                type:"Medium size comercial",
                installedCapacity: 100,
                tppout: 191.523,
                price: 8000,
            },
            {
                installationArea: "Fetakgomo Local Municipality",
                type:"Ground-mounted large scale",
                installedCapacity: 1000,
                tppout: 1849,
                price: 10000,
            },
            {
                installationArea: "Kamiesberg Local Municipality",
                type:"Floating large scale",
                installedCapacity: 1000,
                tppout: 1817,
                price: 15000,
            }
        ]
    }),
    new Country({
        name: 'Algeria',
        population: 44180000,
        landArea: 2381740.00,
        description: 'Algeria is a North African country with a Mediterranean coastline and a Saharan desert interior.\n' +
            '\n' +
            'Algeria has high solar power potential but still heavily relies on fossil fuels, particularly natural gas, for energy. To reduce emissions, it has committed to reducing its emissions intensity by 7% by 2030 and implemented carbon offset initiatives such as reforestation, afforestation, and clean energy projects. These initiatives generate carbon credits for economic benefits and emissions reductions. However, there is still much room for growth and improvement in Algeria\'s renewable energy and emissions reduction efforts.',
        carbonIntensity: 488,
        carbonBenefits: 1529123,
        pvout: 5.12,
        electricityAvailability: 3134003,
        installedCapacity: 448,
        solarElectricityPercent: "1.04%",
        solarPanels: [
            {
                installationArea: "Ksar Kaddour",
                type:"Small residential",
                installedCapacity: 1,
                tppout: 1.819,
                price: 80,
            },
            {
                installationArea: "Tazrouk",
                type:"Small residential",
                installedCapacity: 3,
                tppout: 5.658,
                price: 150,
            },
            {
                installationArea: "Kano",
                type:"Medium size commercial",
                installedCapacity: 100,
                tppout: 181.735,
                price: 2000,
            },
        ]
    }),

    new Country({
        name: 'Egypt',
        population: 109300000,
        landArea: 995450.00,
        description: 'Egypt, a country linking northeast Africa with the Middle East, dates to the time of the pharaohs.\n' +
            '\n' +
            'Egypt has made progress in developing its solar power sector, including constructing the world\'s largest solar park. However, the country still heavily relies on natural gas for its energy needs. To reduce carbon emissions, Egypt has implemented carbon offset initiatives such as afforestation and reforestation projects and aims to achieve 42% of its electricity from renewable sources by 2035. Despite these efforts, more work is needed to transition towards renewable energy sources.',
        carbonIntensity: 464,
        carbonBenefits: 3799889,
        pvout: 5.35,
        electricityAvailability: 8193218,
        installedCapacity: 1675,
        solarElectricityPercent: "2.37%",
        solarPanels: [
            {
                installationArea: "New Valley Governorate",
                type:"Small residential",
                installedCapacity: 1,
                tppout: 1.910,
                price: 100,
            },
            {
                installationArea: "Marsa Matruh",
                type:"Small residential",
                installedCapacity: 3,
                tppout: 5.733,
                price: 270,
            },
            {
                installationArea: "Red Sea Governorate",
                type:"Medium size commercial",
                installedCapacity: 100,
                tppout: 190.497,
                price: 2400,
            },
        ]
    }),

    new Country({
        name: 'Morocco',
        population: 37984655,
        landArea: 710850.00,
        description: 'Morocco is a North African country bordering the Atlantic Ocean and Mediterranean Sea.\n' +
            '\n' +
            'Despite significant progress in solar and renewable energy, Morocco still needs to take more steps towards carbon neutrality. To achieve this goal, Morocco has implemented carbon offset measures, including forest restoration and land management programs, which provide economic benefits to local communities while reducing greenhouse gas emissions.\n' +
            '\n' +
            'However, the country\'s heavy reliance on fossil fuels in other industries, such as transportation, poses a challenge to reducing its overall carbon footprint. Nevertheless, Morocco\'s progress in renewable energy and carbon offset measures stands out within the region and serves as an example for other countries to follow in transitioning to a more sustainable energy future.',
        carbonIntensity: 610,
        carbonBenefits: 864584,
        pvout: 5.02,
        electricityAvailability: 1417661,
        installedCapacity: 774,
        solarElectricityPercent: "4.41%",

        solarPanels: [
            {
                installationArea: "Serghina",
                type:"Small residential",
                installedCapacity: 1,
                tppout: 1.783,
                price: 50,
            },
            {
                installationArea: "Tagmout",
                type:"Small residential",
                installedCapacity: 3,
                tppout: 5.642,
                price: 200,
            },
            {
                installationArea: "Shoul",
                type:"Medium size commercial",
                installedCapacity: 100,
                tppout: 164.638,
                price: 1500,
            },
        ]
    }),
]

module.exports = countries
