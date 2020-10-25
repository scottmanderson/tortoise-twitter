const app = require("../server");
const connectDB = require("../config/db");
const users = require("./users");
const UserModel = require("../models/User");

const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");

beforeAll(async () => {
  const conn = connectDB("test");
  const newUser = request(app).post("/users/register").send({
    name: "test_jest_login",
    email: "test_jest_login@test.com",
    password: "abcdefghijk",
    password2: "abcdefghijk",
    trackedHandlesStr: "aldaily, dan_abramov, juliagalef",
    preferredTimeGMT: "6:00",
  });
});

afterAll(async () => {
  UserModel.deleteOne({ name: "test_jest" });
  UserModel.deleteOne({ name: "test_jest_login" });
  mongoose.disconnect();
});

function loginUser() {
  return function (done) {
    app
      .post("/users/login")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        email: "test_jest_login@test.com",
        password: "abcdefghijk",
      });
    done();
  };
}

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

describe("login route works", () => {
  test("login should succeed", (done) => {
    loginUser();
    done();
  });

  test("login page loads", (done) => {
    request(app).get("/users/login").expect(200, done);
  });
});
