const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
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
 *        status:
 *          type: string
 *          default: enabled
 *        totalFunded:
 *          type: int
 *          default: 0
 *        totalPanelsBought:
 *          type: int
 *          default: 0
 *        totalCarbonOffset:
 *          type: int
 *          default: 0
 *    UserRegister:
 *      type: object
 *      required:
 *        - name
 *        - email
 *        - password
 *      properties:
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *    UserLogin:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *        password:
 *          type: string
 *    UserInfo:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *        email:
 *          type: string
 *        role:
 *          type: string
 *          default: user
 *        status:
 *          type: string
 *          default: enabled
 *        totalFunded:
 *          type: int
 *          default: 0
 *        totalPanelsBought:
 *          type: int
 *          default: 0
 *        totalCarbonOffset:
 *          type: int
 *          default: 0
 *        updatedAt:
 *          type: dateTime
 *
 */
const userSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            default: 'user'
        },
        status: {
            type: String,
            required: true,
            default: 'enabled'
        },
        totalFunded: {
            type: Number,
            required: false,
            default: 0
        },
        totalPanelsBought: {
            type: Number,
            required: false,
            default: 0
        },
        totalCarbonOffset: {
            type: Number,
            required: false,
            default: 0
        },
        carbonFootprint: {
            type: Number,
            required: false,
            default: 0
        },
        tokens:[{
            token:{
                type:String,
                required: false
            }
        }]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model('User', userSchema);
