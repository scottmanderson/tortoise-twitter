const app = require("../server");
const users = require("./users");

const request = require("supertest");
const express = require("express");

describe("register route works", () => {
  test("register page loads", (done) => {
    return request(app).get("/users/register").expect(200, done);
  });
});
