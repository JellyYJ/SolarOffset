const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const Payment = require("../models/payments");
const paymentController = require("../controllers/payments");
const countryController = require("../controllers/country");
const Country = require("../models/country")
describe("Payments Controller", function () {

    before(function (done) {
        mongoose
            .connect(
                "mongodb://127.0.0.1:27017/solaroffset-test", {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    useCreateIndex: true
                }
            )
            .then((result) => {
                // Creating a new user.
                const payment = new Payment({
                    amountFunded: 0,
                    panelId: "panel1",
                    countryId: "country1",
                    country: "South Africa",
                    _id: "5c0f66b979af55031b34728a",
                    userId: "5c0f66b979af55031b34123a"
                });
                // Saving the user the database.
                return payment.save();
            })
            .then(() => {
                // Creating a new user.
                const payment = new Payment({
                    amountFunded: 0,
                    panelId: "panel2",
                    countryId: "country2",
                    country: "Uganda",
                    _id: "5c0f66b979af55031b34123a",
                    userId: "5c0f66b979af55031b34123a"
                });
                // Saving the user the database.
                return payment.save();
            }).then(() =>{
                const country = new Country({
                    _id : "5c0f66b979af55031b34728a",
                    name: 'South Africa',
                    population: 59900000,
                    landArea: 1213090.00,
                    description: 'South Africa is a country on the southernmost tip of the African continent, marked by several distinct ecosystems. Inland safari destination Kruger National Park is populated by big game. The Western Cape offers beaches, lush winelands around Stellenbosch and Paarl, craggy cliffs at the Cape of Good Hope, forest and lagoons along the Garden Route, and the city of Cape Town, beneath flat-topped Table Mountain.',
                    carbonIntensity: 716,
                    carbonBenefits: 4083527,
                    pvout: 5.03,
                    electricityAvailability: 5698194,
                    installedCapacity: 6221,
                    solarPanels: [
                        {
                            installationArea: "Dickenson Avenue",
                            type:"Small residential",
                            installedCapacity: 1,
                            installedCapacityUnit: 'kWp',
                            tppout: 1.716,
                            price: 120,
                            _id: "5c0f66b979af55031b34741a",
                        },
                        {
                            installationArea: "Emthanjeni Local Municipality",
                            type:"Medium size comercial",
                            installedCapacity: 100,
                            tppout: 191.523,
                            price: 800,
                        },
                        {
                            installationArea: "Fetakgomo Local Municipality",
                            type:"Ground-mounted large scale",
                            installedCapacity: 1000,
                            tppout: 1849,
                            price: 5000,
                        },
                        {
                            installationArea: "Kamiesberg Local Municipality",
                            type:"Floating large scale",
                            installedCapacity: 1000,
                            tppout: 1817,
                            price: 15000,
                        }
                    ]
                });
            // Saving the user the database.
                return country.save();
            })

            .then(() => {
                done();
            });
    });

    describe("generatePaymentUrl Functionality", function () {

        it("should return a new checkout session url", function (done) {
            // Dummy request object.
            const req = {
                body: {
                    countryId: "testcountryid",
                    price: 100,
                    panelId: "testpanel",
                    country: "testcountry",
                },
            };
            const res = {
                url: null,
                json: function (data) {
                    this.url = data.url;
                    return this;
                },
            };
            paymentController.generatePaymentUrl(req, res, () => {
            }).then((result) => {
                expect(res.url).to.not.be.null;
                expect(res.url).to.contains("https://");
                done();
            });
        });

        it("should throw an error as price is a negative value", function (done) {
            // Dummy request object.
            const req = {
                body: {
                    countryId: "testcountryid",
                    price: -100,
                    panelId: "testpanel",
                    country: "testcountry",
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
                    this.message = data.Error;
                    return this;
                },
            };
            paymentController.generatePaymentUrl(req, res, () => {
            }).then((result) => {
                expect(res.message).to.contain("Invalid non-negative integer");
                done();
            });
        });
    });

    describe("validatePaymentStatus Functionality", function () {

        it("should return a success message that the payment has been saved", function (done) {
            // Dummy request object.
            const req = {
                user: {
                    name: "tester",
                    email: "test@test.com",
                    userId: "5c0f66b979af55031b34728a"
                },
                body: {
                    sessionId: "cs_test_a1eBgOQVQHjFDGN9OUgO0CwebOn7CmnhaMIxNkusjVdo8QtWRJ527d6681",
                    countryId: "5c0f66b979af55031b34728a",
                    price: 100,
                    panelId: "5c0f66b979af55031b34741a",
                    country: "testcountry",
                },
            };
            const res = {
                statusCode: 500,
                message: null,
                payment: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.message;
                    this.payment = data.payment;
                    return this;
                },
            };
            paymentController.validatePaymentStatus(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(201);
                expect(res.message).to.contain("Payment saved!");
                done();
            });
        });

        it("should throw an error if the countryId is not found", function (done) {
            // Dummy request object.
            const req = {
                user: {
                    name: "tester",
                    email: "test@test.com",
                    userId: "5c0f66b979af55031b34728a"
                },
                body: {
                    sessionId: "cs_test_a1eBgOQVQHjFDGN9OUgO0CwebOn7CmnhaMIxNkusjVdo8QtWRJ527d6681",
                    countryId: "5c0f66b979af55031b39874a",
                    price: 100,
                    panelId: "5c0f66b979af55031b34741a",
                    country: "testcountry",
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
                    this.message = data.Error;
                    return this;
                },
            };
            paymentController.validatePaymentStatus(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(500);
                expect(res.message).to.contain("Country with ID 5c0f66b979af55031b39874a not found");
                done();
            });
        });

        it("should throw an error if the panelId is not found", function (done) {
            // Dummy request object.
            const req = {
                user: {
                    name: "tester",
                    email: "test@test.com",
                    userId: "5c0f66b979af55031b34728a"
                },
                body: {
                    sessionId: "cs_test_a1eBgOQVQHjFDGN9OUgO0CwebOn7CmnhaMIxNkusjVdo8QtWRJ527d6681",
                    countryId: "5c0f66b979af55031b34728a",
                    price: 100,
                    panelId: "nullPanelId",
                    country: "testcountry",
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
                    this.message = data.Error;
                    return this;
                },
            };
            paymentController.validatePaymentStatus(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(500);
                expect(res.message).to.contain("Solar panel with ID nullPanelId not found in country");
                done();
            });
        });

        it("should throw an error if the payment has failed", function (done) {
            // Dummy request object.
            const req = {
                user: {
                    name: "tester",
                    email: "test@test.com",
                    userId: "5c0f66b979af55031b34728a"
                },
                body: {
                    sessionId: "cs_test_a1xjbUO92s0al7SWUvtY9kO83TwfQ97XzFIDA4P6SGKBBYm7G6XvC9CP4o",
                    countryId: "5c0f66b979af55031b34728a",
                    price: 100,
                    panelId: "testpanel",
                    country: "testcountry",
                },
            };
            const res = {
                statusCode: 500,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.session_status = data.status;
                    this.payment_status = data.payment_status;
                    return this;
                },
            };
            paymentController.validatePaymentStatus(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(500);
                expect(res.payment_status).to.contain("unpaid");
                expect(res.session_status).to.contain("expired");
                done();
            });
        });

        it("should throw an error if the session is invalid", function (done) {
            // Dummy request object.
            const req = {
                user: {
                    name: "tester",
                    email: "test@test.com",
                    userId: "5c0f66b979af55031b34728a"
                },
                body: {
                    sessionId: "testInvalidSession",
                    countryId: "5c0f66b979af55031b34728a",
                    price: 100,
                    panelId: "testpanel",
                    country: "testcountry",
                },
            };
            const res = {
                statusCode: 500,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.Error;
                    return this;
                },
            };
            paymentController.validatePaymentStatus(req, res, () => {
            }).then(() => {
                expect(res.message).to.contain("No such checkout.session");
                done();
            });
        });
    });

    describe("getAllPayments Functionality", function () {
        it("should return all the existing payments in the database.", function (done) {

            const res = {
                statusCode: 500,
                payments: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.payments = data;
                    return this;
                },
            };

            paymentController.getAllPayments({}, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.payments).to.be.not.null;
                expect(res.payments).to.have.length(5);
                done();
            });
        });

        it("should throw an error with code 500 if we cannot connect to the db", function (done) {
            sinon.stub(Payment, "find");
            Payment.find.throws();

            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.Error;
                },
            };

            paymentController.getAllPayments({}, res, () => {
            }).then(() => {
                expect(res.statusCode).to.be.equal(500);
                expect(res.message).to.contains("Error");
                done();
            });

            Payment.find.restore();
        });

        it("should throw an error with code 404 if the database is empty", function (done) {
            sinon.stub(Payment, "find");
            Payment.find.returns([]);

            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.Error;
                },
            };

            paymentController.getAllPayments({}, res, () => {
            }).then(() => {
                expect(res.statusCode).to.be.equal(404);
                expect(res.message).to.contains("Payments db empty.");
                done();
            });

            Payment.find.restore();
        });
    });

    describe("getPaymentsByEmail Functionality", function () {
        it("should return all the existing payments in the database by userId", function (done) {
            const req = {
                params: {
                    userId: "5c0f66b979af55031b34123a"
                }
            };
            const res = {
                statusCode: 500,
                payments: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.payments = data;
                    return this;
                },
            };

            paymentController.getPaymentsByEmail(req, res, () => {
            }).then((result) => {
                expect(res.statusCode).to.be.equal(200);
                expect(res.payments).to.be.not.null;
                expect(res.payments).to.have.length(2);
                done();
            });
        });

        it("should throw an error with code 500 if we cannot connect to the db", function (done) {
            sinon.stub(Payment, "find");
            Payment.find.throws();
            const req = {
                params: {
                    userId: "5c0f66b979af55031b34123a"
                }
            };
            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.Error;
                },
            };

            paymentController.getPaymentsByEmail(req, res, () => {
            }).then(() => {
                expect(res.statusCode).to.be.equal(500);
                expect(res.message).to.contains("Error");
                done();
            });

            Payment.find.restore();
        });

        it("should throw an error with code 404 if the database is empty", function (done) {
            sinon.stub(Payment, "find");
            Payment.find.returns([]);
            const req = {
                params: {
                    userId: "5c0f66b979af55031b34123a"
                }
            };
            const res = {
                statusCode: 500,
                message: null,
                status: function (code) {
                    this.statusCode = code;
                    return this;
                },
                json: function (data) {
                    this.message = data.Error;
                },
            };

            paymentController.getPaymentsByEmail(req, res, () => {
            }).then(() => {
                expect(res.statusCode).to.be.equal(404);
                expect(res.message).to.contains("No Payments exist.");
                done();
            });

            Payment.find.restore();
        });
    });

    after(function (done) {
        Country.deleteMany({}, function(err) {
            Payment.deleteMany({}, function(err) {
                mongoose.disconnect( function () {
                    done();
                });
            })
        })
    });
});
