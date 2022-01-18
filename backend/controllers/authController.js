const User = require("../models/userModel");

const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
  console.log("POST /api/v1/users/signup");
  const { username, password } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      username,
      password: hashPassword,
    });

    req.session.user = newUser;
    res.status(201).json({
      status: "SUCCESS",
      data: {
        user: newUser,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: "FAILED",
    });
  }
};

exports.login = async (req, res) => {
  console.log("POST /api/v1/users");
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "user-not-found",
      });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (isCorrect) {
      req.session.user = user;
      res.status(200).json({
        status: "SUCCESS",
      });
    } else {
      res.status(400).json({
        status: "FAILED",
        message: "incorrect-username-or-password",
      });
    }
  } catch (e) {
    res.status(400).json({
      status: "FAILED",
    });
  }
};
