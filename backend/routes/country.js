var express = require("express");
var router = express.Router();
const country_controller = require("../controllers/country");
const errorCodes = require("../constants/errorCodes");

/**
 * @swagger
 * /country/list:
 *   get:
 *     summary: Get a list of all countries with relevant data
 *     description: Retrieves a list of all countries from the database and their relevant data, including installed capacity, PV output, carbon intensity, carbon benefits, and electricity availability. If there are no countries in the database, initializes the database with sample data.
 *     responses:
 *       200:
 *         description: A list of all countries with relevant data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   installedCapacity:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   pvout:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   carbonIntensity:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   carbonBenefits:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 *                   electricityAvailability:
 *                     type: object
 *                     properties:
 *                       value:
 *                         type: number
 *                       unit:
 *                         type: string
 */
router.get("/country/list", async (req, res) => {
  try {
    // Check if there is any country data in the database
    const countries = await country_controller.getCountries();

    // If there are no countries, initialize the database with sample data
    if (countries.length === 0 || countries.length != 4) {
      await country_controller.initializeDatabase();
      const updatedCountries = await country_controller.getCountries();
      res.send(updatedCountries);
    } else {
      res.send(countries);
    }
  } catch (err) {
    console.log(err);
    res
      .status(errorCodes.INTERNAL_SERVER_ERROR.code)
      .send(errorCodes.INTERNAL_SERVER_ERROR.message);
  }
});




/**
 * @swagger
 * /compare/{countryId1}/{countryId2}:
 *   get:
 *     summary: Compare two countries based on their solar panel data
 *     parameters:
 *       - in: path
 *         name: countryId1
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the first country to compare
 *       - in: path
 *         name: countryId2
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the second country to compare
 *     responses:
 *       200:
 *         description: A list of two countries with their solar panel data comparison
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The unique ID of the country
 *                   name:
 *                     type: string
 *                     description: The name of the country
 *                   population:
 *                     type: number
 *                     description: The population of the country
 *                   landArea:
 *                     type: number
 *                     description: The land area of the country in square kilometers
 *                   description:
 *                     type: string
 *                     description: A brief description of the country
 *                   carbonIntensity:
 *                     type: number
 *                     description: The carbon intensity of the country in gCO2/kWh
 *                   carbonBenefits:
 *                     type: number
 *                     description: The estimated carbon benefits of the country in kgCO2/year
 *                   pvout:
 *                     type: number
 *                     description: The average solar irradiation of the country in kWh/kWp/year
 *                   electricityAvailability:
 *                     type: number
 *                     description: The annual electricity availability of the country in MWh/year
 *                   installedCapacity:
 *                     type: number
 *                     description: The installed solar capacity of the country in MW
 *                   solarPanels:
 *                     type: object
 *                     description: Solar panel data comparison of the country
 *                     properties:
 *                       typeCounts:
 *                         type: number
 *                         description: The number of solar panel types in the country
 *                       priceRange:
 *                         type: object
 *                         description: The range of solar panel prices in the country
 *                         properties:
 *                           lowest:
 *                             type: number
 *                             description: The lowest solar panel price in the country
 *                           highest:
 *                             type: number
 *                             description: The highest solar panel price in the country
 *                   __v:
 *                     type: number
 *                     description: The version of the country document
 */
router.get('/compare/:countryId1/:countryId2', async (req, res) => {
    try {
        const country1 = await country_controller.getCountryById(req.params.countryId1);
        const country2 = await country_controller.getCountryById(req.params.countryId2);

        if (!country1 || !country2) {
            res.status(errorCodes.COUNTRY_NOT_FOUND.code).send(errorCodes.COUNTRY_NOT_FOUND.message);
        } else {
            const countries = [country1, country2];
            res.json(countries)
        }
    } catch (err) {
        console.log(err);
        res.status(errorCodes.INTERNAL_SERVER_ERROR.code).send(errorCodes.INTERNAL_SERVER_ERROR.message);
    }
});




/**
 * @swagger
 * /country/{countryId}:
 *   get:
 *     summary: Get details for a specific country by ID
 *     parameters:
 *       - name: countryId
 *         in: path
 *         description: ID of the country to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Country details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID of the country
 *                 name:
 *                   type: string
 *                   description: Name of the country
 *                 population:
 *                   type: integer
 *                   description: Population of the country
 *                 landArea:
 *                   type: integer
 *                   description: Land area of the country in square kilometers
 *                 description:
 *                   type: string
 *                   description: Description of the country
 *                 carbonIntensity:
 *                   type: object
 *                   description: Carbon intensity of the country's electricity grid
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: Carbon intensity value
 *                     unit:
 *                       type: string
 *                       description: Carbon intensity unit
 *                 carbonBenefits:
 *                   type: object
 *                   description: Estimated carbon benefits of the country's solar power installations
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: Carbon benefits value
 *                     unit:
 *                       type: string
 *                       description: Carbon benefits unit
 *                 pvout:
 *                   type: object
 *                   description: Average solar irradiation for the country
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: PVOUT value
 *                     unit:
 *                       type: string
 *                       description: PVOUT unit
 *                 electricityAvailability:
 *                   type: object
 *                   description: Annual electricity availability for the country
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: Electricity availability value
 *                     unit:
 *                       type: string
 *                       description: Electricity availability unit
 *                 installedCapacity:
 *                   type: object
 *                   description: Total installed solar power capacity for the country
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: Installed capacity value
 *                     unit:
 *                       type: string
 *                       description: Installed capacity unit
 *                 solarPanels:
 *                   type: array
 *                   description: List of solar panels installed in the country
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID of the solar panel
 *                       installationArea:
 *                         type: string
 *                         description: Area where the solar panel is installed
 *                       type:
 *                         type: string
 *                         description: Type of solar panel
 *                       installedCapacity:
 *                         type: object
 *                         description: Installed capacity of the solar panel
 *                         properties:
 *                           value:
 *                             type: number
 *                             description: Installed capacity value
 *                           unit:
 *                             type: string
 *                             description: Installed capacity unit
 *                       tppout:
 *                         type: object
 *                         description: Annual energy output of the solar panel
 *                         properties:
 *                           value:
 *                             type: number
 *                             description: tppout value
 *
 */
router.get('/country/:countryId', async (req, res) => {
    try {
        const countryId = req.params.countryId;
        const countryDetails = await country_controller.getCountryDetails(countryId);

        if (!countryDetails) {
            return res.sendStatus(errorCodes.COUNTRY_NOT_FOUND.code);
        }

        return res.json(countryDetails);
    } catch (err) {
        console.error(err);
        return res.sendStatus(errorCodes.INTERNAL_SERVER_ERROR.code);
    }
});




module.exports = router;
