const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blackList.model")
const accountModel = require("../models/account.model")
const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model") // if exists
/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(422).json({
        message: "User already exists with email.",
        status: "failed"
      });
    }

    // ✅ Create user
    const user = await userModel.create({
      email,
      password,
      name
    });

    // ✅ Create account
    const account = await accountModel.create({
      user: user._id,
      status: "ACTIVE",
      currency: "INR"
    });

    // ✅ Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    user.sessions.push({ token });
    await user.save();

    res.cookie("token", token);

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        systemUser: user.systemUser
      },
      token
    });

    await emailService.sendRegistrationEmail(user.email, user.name);

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).json({
      message: "Registration failed"
    });
  }
}
/**
 * - User Login Controller
 * - POST /api/auth/login
  */

async function userLoginController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password +systemUser");

  if (!user) {
    return res.status(401).json({
      message: "Email or password is INVALID"
    });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email or password is INVALID"
    });
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "3d" }
  );

  // ✅ ADD THIS
  user.sessions.push({ token });
  await user.save();

  res.cookie("token", token);

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      systemUser: user.systemUser
    },
    token
  });
}


/**
 * - User Logout Controller
 * - POST /api/auth/logout
  */
async function userLogoutController(req, res) {
  try {
    const token =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    // ✅ If no token → just exit
    if (!token) {
      return res.status(200).json({
        message: "User logged out successfully"
      });
    }

    // ✅ If req.user not available → decode manually
    let userId = req.user?._id;

    if (!userId) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        // token invalid → still allow logout
      }
    }

    // ✅ Remove session if user found
    if (userId) {
      const user = await userModel.findById(userId);

      if (user) {
        user.sessions = user.sessions.filter(
          (session) => session.token !== token
        );
        await user.save();
      }
    }

    // ✅ blacklist token
    await tokenBlackListModel.create({ token });

    res.clearCookie("token");

    return res.status(200).json({
      message: "User logged out successfully"
    });

  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      message: "Logout failed"
    });
  }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}