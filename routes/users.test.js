const app = require("../server");
const connectDB = require("../config/db");
const users = require("./users");
const UserModel = require("../models/User");

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const request = require("supertest");
const express = require("express");

beforeAll(async () => {
  const conn = connectDB("test");
});

afterAll(async () => {
  UserModel.deleteOne({ name: "test_jest" });
  mongoose.disconnect();
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

describe("login route works", () => {
  test("login page loads", (done) => {
    request(app).get("/users/login").expect(200, done);
  });
});