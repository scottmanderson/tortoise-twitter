const app = require("../server");
const connectDB = require("../config/db");
const users = require("./users");
const UserModel = require("../models/User");

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");

beforeAll(async () => {
  const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI + "/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
});

afterAll(async () => {
  UserModel.deleteOne({ name: "test_jest" });
});

describe("register route works", () => {
  test("register page loads", (done) => {
    request(app).get("/users/register").expect(200, done);
  });
  test("register form post method", (done) => {
    const newUser = request(app).post("/users/register").send({
      name: "test_jest",
      email: "test_jest@test.com",
      password: "abcdefgh",
      password2: "abcdefgh",
      trackedHandlesStr: "aldaily, dan_abramov, juliagalef",
      preferredTimeGMT: "22:00",
    });
    query = UserModel.findOne({ name: "test_jest" });
    expect(query).toBeTruthy();

    done();
  });
});
