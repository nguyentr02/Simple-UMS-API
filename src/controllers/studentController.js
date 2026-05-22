const { prisma } = require("../database");
const { validationResult } = require("express-validator");

/**
 * @openapi
 * /student:
 *    get:
 *      summary: Get all students' information
 *      description: Get information of all students that are registered in the system.
 *      tags: [Students]
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.students.findMany();
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /student/{id}:
 *    get:
 *      summary: Get student by ID
 *      description: Get information of a student by their unique ID.
 *      tags: [Students]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the student.
 */
const getStudentByID = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const student = await prisma.students.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /student:
 *   post:
 *     summary: Create new student
 *     description: Registers a new student with information such as name, student code, major and phone.
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - student_code
 *               - email
 *               - major
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Wick
 *               student_code:
 *                 type: string
 *                 example: STU102
 *               email:
 *                 type: string
 *                 example: johnwick@dau.edu.vn
 *               major:
 *                 type: string
 *                 example: Computer Science
 *               phone:
 *                 type: string
 *                 example: 0932432123
 *     responses:
 *       201:
 *         description: Student created.
 *       400:
 *         description: Validation failed.
 *       500:
 *         description: Error.
 */
const createStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, email, student_code, major, phone } = req.body;
  try {
    const student = await prisma.students.create({
      data: { name, email, student_code, major, phone },
    });
    res.status(201).json({ success: true, message: "Student created", id: student.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /student/{id}:
 *   put:
 *     summary: Update student information
 *     description: Update student information such as name, email, major or phone.
 *     tags: [Students]
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the student
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Wick
 *               email:
 *                 type: string
 *                 example: johnwick@dau.edu.vn
 *               major:
 *                 type: string
 *                 example: Computer Science
 *               phone:
 *                 type: string
 *                 example: 0932432123
 *     responses:
 *       201:
 *         description: Student updated.
 *       404:
 *         description: Student not found.
 *       500:
 *         description: Error.
 */
const updateStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { name, email, major, phone } = req.body;
  try {
    const existing = await prisma.students.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    await prisma.students.update({
      where: { id: Number(req.params.id) },
      data: {
        name:  name  ?? existing.name,
        email: email ?? existing.email,
        major: major ?? existing.major,
        phone: phone ?? existing.phone,
      },
    });
    res.json({ success: true, message: "Student updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /student/{id}:
 *   delete:
 *     summary: Delete a student
 *     description: Delete a student and their information.
 *     tags: [Students]
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the student
 *     responses:
 *       400:
 *         description: Validation failed.
 *       404:
 *         description: Student could not be found.
 *       500:
 *         description: Error.
 */
const deleteStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const existing = await prisma.students.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    await prisma.students.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
};