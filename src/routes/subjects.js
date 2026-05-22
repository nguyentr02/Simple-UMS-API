const express = require('express');
const router = express.Router();

const {
    getAllSubjects,
    getSubjectBySubjectCode,
    createSubject,
    updateSubject,
    deleteSubject,
} = require('../controllers/subjectController')

router.get('/', getAllSubjects);
router.get('/:subjectCode', getSubjectBySubjectCode);
router.post('/', createSubject);
router.put('/:subjectCode', updateSubject);
router.delete('/:subjectCode', deleteSubject);

module.exports = router;