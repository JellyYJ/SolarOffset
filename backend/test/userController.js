const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const userController = require("../controllers/user");

const DB = process.env.DATABASE_HOST_TEST.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
console.log(DB);

// ** We use a dedicated test database.
describe("User Controller", function () {
  before(function (done) {
    mongoose
      .connect(
        "mongodb+srv://Yijia:Meb3XX2WnFHRmFmf@cluster0.davspsq.mongodb.net/solarOffset-test",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
          useCreateIndex: true,
        }
      )
      .then((result) => {
        // Creating a new user.
        const user = new User({
          name: "Test",
          email: "test@test.com",
          password:
            "$2a$12$7A.ZiIFFFSwJw95qX112v.lJlLCOYhsAvpxkPq8zpRkR7au740uVS",
          role: "admin",
          _id: "5c0f66b979af55031b34728a",
        });
        // Saving the user the database.
        return user.save();
      })
      .then(() => {
        // Creating a new user.
        const user = new User({
          name: "Test",
          email: "disabled@test.com",
          password: "tester",
          role: "user",
          status: "disabled",
          _id: "5c0f66b979af55031b34123a",
        });
        // Saving the user the database.
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  describe("Register Functionality", function () {
    it("should return user created success message", function (done) {
      // Dummy request object.
      const req = {
        body: {
          name: "Test",
          email: "newtest@test.com",
          password: "tester",
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
          this.userId = data.userId;
        },
      };
      userController
        .register(req, res, () => {})
        .then((result) => {
          expect(res.statusCode).to.be.equal(201);
          expect(res.message).to.contain("User created!");
          done();
        });
    });

    it("should throw and error because email already exists", function (done) {
      const req = {
        body: {
          name: "Test",
          email: "test@test.com",
          password: "tester",
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
        },
      };
      userController
        .register(req, res, () => {})
        .then((result) => {
          expect(res.statusCode).to.be.equal(500);
          expect(res.message).to.contain("duplicate key error");
          done();
        });
    });

    describe("Login Functionality", function () {
      it("should throw an error with code 500 if accessing the database fails", function (done) {
        sinon.stub(User, "findOne");
        User.findOne.throws();
        const req = {
          body: {
            email: "test@test.com",
            password: "tester",
            carbonFootprint: 0,
          },
        };
        userController
          .login(req, {}, () => {})
          .then((result) => {
            expect(result).to.be.an("error");
            expect(result).to.have.property("statusCode", 500);
            done();
          });

        User.findOne.restore();
      });

      it("should throw an error if the user does not exist", function (done) {
        const req = {
          body: {
            email: "doesnotexist@test.com",
            password: "tester",
            carbonFootprint: 0,
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
          },
        };
        userController
          .login(req, res, () => {})
          .then((result) => {
            expect(res.statusCode).to.be.equal(401);
            expect(res.message).to.contain(
              "A user with this email could not be found."
            );
            done();
          });
      });

      it("should throw an error if the user is disabled", function (done) {
        const req = {
          body: {
            email: "disabled@test.com",
            password: "tester",
            carbonFootprint: 0,
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
          },
        };

        userController
          .login(req, res, () => {})
          .then((result) => {
            expect(res.statusCode).to.be.equal(401);
            expect(res.message).to.contain("User has been disabled by admin!");
            done();
          });
      });

      it("should throw an error if the password is wrong", function (done) {
        const req = {
          body: {
            email: "test@test.com",
            password: "wrongpassword",
            carbonFootprint: 0,
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
          },
        };

        userController
          .login(req, res, () => {})
          .then((result) => {
            expect(res.statusCode).to.be.equal(401);
            expect(res.message).to.contain("Wrong password!");
            done();
          });
      });

      it("should login user and return the userId", function (done) {
        const req = {
          body: {
            email: "test@test.com",
            password: "tester123",
            carbonFootprint: 0,
          },
        };
        const res = {
          statusCode: 500,
          userId: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          cookie: function (data) {},
          json: function (data) {
            this.userId = data.userId;
          },
        };

        userController
          .login(req, res, () => {})
          .then((result) => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userId).to.contain("5c0f66b979af55031b34728a");
            done();
          });
      });
    });

    describe("Logout Functionality", function () {
      it("should logout user and return a success message", function (done) {
        const res = {
          statusCode: 500,
          message: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          clearCookie: function (name) {
            return true;
          },
          send: function (data) {
            this.message = data;
          },
        };
        userController
          .logout({}, res, () => {})
          .then((result) => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.contain("Successfully Logout!");
            done();
          });
      });
    });

    describe("getUserRole Functionality", function () {
      it("should send a response with a valid user role of an existing user", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34123a",
          },
        };
        const res = {
          statusCode: 500,
          userRole: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userRole = data.role;
          },
        };
        userController
          .getUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userRole).to.be.equal("user");
            done();
          });
      });

      it("should return an error if the userId does not exist", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34789a",
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
          },
        };
        userController
          .getUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          params: {
            userId: "abc",
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
          },
        };
        userController
          .getUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("updateUserRole Functionality", function () {
      it("should send a response with the new user role once updated", function (done) {
        const req = {
          body: {
            role: "staff",
            userId: "5c0f66b979af55031b34728a",
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
          },
        };
        userController
          .updateUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.contains("User role updated to");
            done();
          });
      });

      it("should send a response with a invalid userid which does not exist", function (done) {
        const req = {
          body: {
            role: "staff",
            userId: "5c0f66b979af55031b34456a",
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
          },
        };
        userController
          .updateUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          body: {
            role: "staff",
            userId: "abc",
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
          },
        };
        userController
          .updateUserRole(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("getUserStatus Functionality", function () {
      it("should send a response with a valid user status of an existing user", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34123a",
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
            this.userStatus = data.status;
          },
        };
        userController
          .getUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal("disabled");
            done();
          });
      });

      it("should return an error if the userId does not exist", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34789a",
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
          },
        };
        userController
          .getUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          params: {
            userId: "abc",
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
          },
        };
        userController
          .getUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("updateUserStatus Functionality", function () {
      it("should send a response with the new user status once updated", function (done) {
        const req = {
          body: {
            status: "enabled",
            userId: "5c0f66b979af55031b34728a",
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
          },
        };
        userController
          .updateUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.contains("User status updated to");
            done();
          });
      });

      it("should send a response with a invalid userid which does not exist", function (done) {
        const req = {
          body: {
            status: "enabled",
            userId: "5c0f66b979af55031b34456a",
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
          },
        };
        userController
          .updateUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          body: {
            status: "enabled",
            userId: "abc",
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
          },
        };
        userController
          .updateUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("getAllUsers Functionality", function () {
      it("should return all the users available in the database", function (done) {
        const res = {
          statusCode: 500,
          arrayOfUsers: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.arrayOfUsers = data;
          },
        };
        userController
          .getAllUsers({}, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.arrayOfUsers).to.have.lengthOf(3);
            done();
          });
      });

      it("should throw an error with code 500 if accessing the database fails", function (done) {
        sinon.stub(User, "find"); // Mocking the findOne method in User.
        User.find.throws(); // This will throw an error.

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

        userController
          .getAllUsers({}, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Error");
            done();
          });

        User.find.restore();
      });

      it("should throw an error with code 404 if the database is empty", function (done) {
        sinon.stub(User, "find"); // Mocking the findOne method in User.
        var mockFindOne = {
          select: function (callback) {
            return [];
          },
        };
        User.find.returns(mockFindOne); // This will throw an error.

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

        userController
          .getAllUsers({}, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.contains("User db empty.");
            done();
          });

        User.find.restore();
      });
    });

    describe("getUserInfo Functionality", function () {
      it("should send a response with user info of an existing user", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34123a",
          },
        };
        const res = {
          statusCode: 500,
          user: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.user = data;
          },
        };
        userController
          .getUserInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.user).to.not.be.null;
            done();
          });
      });

      it("should return an error if the userId does not exist", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34789a",
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
          },
        };
        userController
          .getUserInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User does not exist!");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          params: {
            userId: "abc",
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
          },
        };
        userController
          .getUserInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("updateUserName Functionality", function () {
      it("should send a response with the new user name once updated", function (done) {
        const req = {
          body: {
            name: "NewUsername",
            userId: "5c0f66b979af55031b34728a",
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
          },
        };
        userController
          .updateUserName(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.contains("User name updated to");
            done();
          });
      });

      it("should send a response with a invalid userid which does not exist", function (done) {
        const req = {
          body: {
            name: "userIdDoesNotExist",
            userId: "5c0f66b979af55031b34456a",
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
          },
        };
        userController
          .updateUserName(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          body: {
            name: "invalidUserId",
            userId: "abc",
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
          },
        };
        userController
          .updateUserName(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("updateUserPassword Functionality", function () {
      it("should send a response with user password changed once updated", function (done) {
        const req = {
          body: {
            oldPassword: "tester123",
            newPassword: "tester123",
            userId: "5c0f66b979af55031b34728a",
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
          },
        };
        userController
          .updateUserPassword(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.contains("User password changed");
            done();
          });
      });

      it("should send a response with a invalid userid which does not exist", function (done) {
        const req = {
          body: {
            oldPassword: "OldPassword",
            newPassword: "NewPassword",
            userId: "5c0f66b979af55031b34456a",
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
          },
        };
        userController
          .updateUserPassword(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          body: {
            oldPassword: "OldPassword",
            newPassword: "NewPassword",
            userId: "abc",
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
          },
        };
        userController
          .updateUserPassword(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });

      it("should throw an error with code 500 if the database is empty", function (done) {
        sinon.stub(User, "findById"); // Mocking the findOne method in User.
        User.findById.returns(null); // This will throw an error.

        const req = {
          body: {
            oldPassword: "OldPassword",
            newPassword: "NewPassword",
            userId: "",
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
          },
        };
        userController
          .updateUserPassword(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.contains("User not found.");
            done();
          });

        User.findById.restore();
      });
    });

    describe("updateUserData Functionality", function () {
      it("should return true when the user has been updated", function (done) {
        userController
          .updateUserData("test@test.com", 100, 10, 1)
          .then((res) => {
            expect(res).to.be.equal(true);
            done();
          });
      });

      it("should return false if the user does not exist in the database", function (done) {
        userController
          .updateUserData("userwhodoesnotexist@test.com", 100, 10, 1)
          .then((res) => {
            expect(res).to.be.equal(false);
            done();
          });
      });
    });

    describe("getCarbonInfo Functionality", function () {
      it("should send a response with valid carbon info", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34123a",
          },
        };
        const res = {
          statusCode: 500,
          data: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          send: function (data) {
            this.data = data;
          },
        };
        userController
          .getCarbonInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.data).to.have.property("totalFunded", 0);
            expect(res.data).to.have.property("totalPanelsBought", 0);
            expect(res.data).to.have.property("totalCarbonOffset", 0);
            done();
          });
      });

      it("should return an error if the userId does not exist", function (done) {
        const req = {
          params: {
            userId: "5c0f66b979af55031b34789a",
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
          },
        };
        userController
          .getCarbonInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(404);
            expect(res.message).to.be.equal("User not found.");
            done();
          });
      });

      it("should produce an error if the userId is invalid", function (done) {
        const req = {
          params: {
            userId: "abc",
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
          },
        };
        userController
          .getCarbonInfo(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.message).to.contains("Cast to ObjectId failed");
            done();
          });
      });
    });

    describe("getStatistics Functionality", function () {
      it("should return Total Carbon Info of User and country data", function (done) {
        const res = {
          statusCode: 500,
          data: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.data = data.totalCarbonInfo;
          },
        };
        userController
          .getStatistics({}, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(500);
            expect(res.data).to.have.property("totalPanelsBought");

            done();
          });
      });
    });

    after(function (done) {
      User.deleteMany({})
        .then(() => {
          return mongoose.disconnect();
        })
        .then(() => {
          done();
        });
    });
  });
});
