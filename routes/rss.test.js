const app = require("../server");
const rss = require("./rss");
const connectDB = require("../config/db");
const UserModel = require("../models/User");

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");

beforeAll(async () => {
  const conn = connectDB("test");
  const testUser = new UserModel({
    name: "test_jest_rss",
    trackedHandles: ["aldaily", "reuters", "dan_abramov"],
    email: "test_jest_rss@test.com",
    date: new Date(),
    password: "notarealpasswordhash",
    preferredTimeGMT: "1:00",
  });
});

afterAll(async () => {
  UserModel.deleteOne({ name: "test_jest_rss" });
  mongoose.disconnect();
});

describe("rss route tests", () => {
  test("rss route returns rss feed", (done) => {
    const testUser = UserModel.findOne({
      name: "test_jest_rss",
    });
    request(app).get(`/rss/${testUser._id}`);
    done();
  });
});
