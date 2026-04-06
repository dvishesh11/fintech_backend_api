const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, "Email already registered"));
    }

    const user = await User.create({ name, email, password });
    const token = user.generateAccessToken();

    res.status(201).json(
      new ApiResponse(201, { user, token }, "Registration successful")
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, "Invalid email or password"));
    }

    if (!user.isActive) {
      return next(new ApiError(403, "Account deactivated. Contact support."));
    }

    const token = user.generateAccessToken();

    res.status(200).json(
      new ApiResponse(200, { user, token }, "Login successful")
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(new ApiResponse(200, { user }));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };