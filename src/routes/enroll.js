const express = require("express");
const router = express.Router();

const {
    getAllEnroll,
    createEnroll,
    deleteEnroll,
} = require('../controllers/enrollController');

router.get("/", getAllEnroll);
// router.get("/:subjectCode", getAllClassBySubjectCode);
router.post("/", createEnroll);
// router.put("/:subjectCode", updateSubject);
router.delete("/:student_code/:class_id", deleteEnroll);

module.exports = router;
