const app = require("../server");
const users = require("./users");

const request = require("supertest");
const express = require("express");

// unauthenticated
describe("index/dashboard routes operating correctly", () => {
  test("index route works", async (done) => {
    request(app).get("/").expect(200, done);
  });
});
