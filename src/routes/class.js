const express = require("express");
const router = express.Router();

const {
  getAllClass,
  getAllClassBySubjectCode,
  createClass,
  updateClass,
  deleteClass,
} = require("../controllers/classController");

router.get("/", getAllClass);
router.get("/:subjectCode", getAllClassBySubjectCode);
router.post("/", createClass);
router.put("/:classId", updateClass);
router.delete("/:classId", deleteClass);

module.exports = router;
