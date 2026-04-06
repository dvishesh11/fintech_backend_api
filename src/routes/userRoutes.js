const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { updateUserSchema } = require("../validators/userValidator");

router.use(protect); // all routes below require auth

router.get("/", authorize("admin"), getAllUsers);
router.get("/:id", authorize("admin"), getUserById);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;