const express = require("express");
const router = express.Router();
const {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const {
  createStudentRules,
  updateStudentRules,
  idParamRule,
} = require("../middleware/studentValidator");

router.get("/", getAllStudents);
router.get("/:id", idParamRule, getStudentByID);
router.post("/", createStudentRules, createStudent);
router.put("/:id", updateStudentRules, updateStudent);
router.delete("/:id", idParamRule, deleteStudent);

module.exports = router;
