const expect = require("chai").expect;

const CarbonIntensityController = require("../controllers/carbon");

describe("Carbon Intensity Controller", function () {

    describe("queryCarbonIntensity Functionality", function () {

        it("should return an error if the query is null", function (done) {
            // Dummy request object.
            const req = {
                params: {
                    query: null
                },
            };
            const res = {
                statusCode: 500,
                userStatus: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.message;
                    return this;
                },
            };
            CarbonIntensityController.queryCarbonIntensity(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(400);
                expect(res.message).to.contain("Invalid Input");
                done();
            });
        });

        it("should return an error if the postcode is invalid", function (done) {
            // Dummy request object.
            const req = {
                params: {
                    query: "AB CDE"
                },
            };
            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.message;
                    return this;
                },
            };

            CarbonIntensityController.queryCarbonIntensity(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(401);
                expect(res.message).to.contain("Invalid postcode");
                done();
            });
        });

        it("should return an error if the region id is not within the range", function (done) {
            // Dummy request object.
            const req = {
                params: {
                    query: "20"
                },
            };
            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.message;
                    return this;
                },
            };

            CarbonIntensityController.queryCarbonIntensity(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(400);
                expect(res.message).to.contain("Invalid Input");
                done();
            });
        });
    });
});
