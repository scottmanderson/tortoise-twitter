const express = require("express");
const router = express.Router();

const {
  ensureAuth,
  ensureGuest,
  forwardAuthenticated,
} = require("../middleware/auth");

const UserModel = require("../models/User");

router.get("/", ensureAuth, async (req, res) => {
  try {
    let trackedHandles = req.user.trackedHandles;
    res.render("handles", {
      layout: "handles",
      name: req.user.name,
      trackedHandles,
    });
  } catch (err) {
    console.error(err);
  }
});

router.put("/add", ensureAuth, async (req, res) => {
  console.log("put request on /handles");
  const { addHandle } = req.body;
  let errors = [];

  if (!addHandle) {
    errors.push({
      msg: "No handle to add",
    });
  }

  if (req.user.trackedHandles.includes(addHandle)) {
    errors.push({
      msg: "Handle Already Added",
    });
  }

  if (errors.length > 0) {
    res.redirect("/handles");
  } else {
    let updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.user.id },
      { trackedHandles: req.user.trackedHandles.concat(addHandle).sort() }
    );
    res.redirect("/handles");
  }
});

router.put("/remove", ensureAuth, async (req, res) => {
  const { removeHandle } = req.body;
  let errors = [];

  if (!removeHandle) {
    error.push({
      msg: "No handle to remove",
    });
  }

  if (errors.length > 0) {
    res.redirect("/");
  } else {
    let updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.user.id },
      {
        trackedHandles: req.user.trackedHandles
          .filter((element) => element != removeHandle)
          .sort(),
      }
    );
    res.redirect("/handles");
  }
});

module.exports = router;
