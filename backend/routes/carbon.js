var express = require('express');
var router = express.Router();
const intensity_controller = require("../controllers/carbon");

/**
 * @swagger
 * /carbonIntensity/{query}:
 *   get:
 *     summary: Get the carbon intensity data for a specific region.
 *     description: Use this endpoint to get the carbon intensity data for a specific region, identified by its region ID or postcode.
 *     parameters:
 *       - name: query
 *         description: The region ID or postcode for the region you want to get the carbon intensity data for.
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: The carbon intensity data for the specified region in the UK.
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     description: The start time of the period for which the carbon intensity data is reported.
 *                   to:
 *                     type: string
 *                     description: The end time of the period for which the carbon intensity data is reported.
 *                   intensity:
 *                     type: object
 *                     description: The carbon intensity data for the specified region and period.
 *                     properties:
 *                       forecast:
 *                         type: string
 *                         description: The forecasted carbon intensity value for the period.
 *                       actual:
 *                         type: string
 *                         description: The actual carbon intensity value for the period.
 *           example:
 *             data:
 *               - from: "2022-03-19T15:30Z"
 *                 to: "2022-03-19T16:00Z"
 *                 intensity:
 *                   forecast: "152"
 *                   actual: "138"
 */
router.get('/carbonIntensity/:query', intensity_controller.queryCarbonIntensity);


/**
 * @swagger
 * /carbon/national:
 *   get:
 *     summary: Get the carbon intensity data for a specific region.
 *     description: Use this endpoint to get the current carbon intensity data for UK
 *
 *     responses:
 *       200:
 *         description: current carbon intensity data for UK
 */
router.get('/carbon/national', intensity_controller.getDateIntensityForUK);

module.exports = router;
