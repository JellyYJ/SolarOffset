const mongoose = require('mongoose');
const Schema = mongoose.Schema;


/**
 * @openapi
 * components:
 *  schemas:
 *    Payment:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - amountFunded
 *        - amountPanel
 *        - panelId
 *        - carbonOffset
 *      properties:
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *        role:
 *          type: string
 *          default: user
 *        amountFunded:
 *          type: number
 *          required: true
 *          default: 0
 *        panelId:
 *          type: string
 *          required: true
 *        countryId:
 *          type: string
 *          required: true
 *        carbonOffset:
 *          type: number
 *          required: true
 *          description: "Carbon offset value in kgCO2 these payments' panel"
 *        transactionTime:
 *          type: number
 *          required: false
 *        paymentStatus:
 *          type: string
 *          required: false
 *        status:
 *          type: string
 *          required: false
 *
 */
const paymentSchema = new Schema({
        name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        userId: {
            type: String,
            required: false
        },
        amountFunded: {
            type: Number,
            required: true,
            default: 0
        },
        panelId: {
            type: String,
            required: true
        },
        countryId: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        carbonOffset: {
            type: Number,
            required: false,
            unit: 'kgCO2'
        },
        sessionId: {
            type: String,
            unique: true,
        },
        transactionTime: {
            type: Number,
            required: false,
        },
        paymentStatus: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
