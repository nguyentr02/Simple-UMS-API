const { pool } = require("../config/db");
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
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM students");
    (await connection).commit();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    (await connection).release();
  }
};

/**
 * @openapi
 * /student/{id}:
 *    get:
 *      summary: Get all students' information
 *      description: Get information of all students that are registered in the system. 
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
  const connection = pool.getConnection();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    (await connection).beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM students WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      (await connection).rollback();
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    (await connection).commit();
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    (await connection).release();
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
 *                 type: email
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
  const connection = await pool.getConnection();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    (await connection).beginTransaction();
    const { name, email, student_code, major, phone } = req.body;
    const [result] = await connection.execute(
      "INSERT INTO students (name, email, student_code, major, phone) VALUES (?, ?, ?, ?, ?)",
      [name, email, student_code, major, phone],
    );
    (await connection).commit();
    res
      .status(201)
      .json({ success: true, message: "Student created", id: result.insertId });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    (await connection).release();
  }
};

/**
 * @openapi
 * /student/{id}:
 *   put:
 *     summary: Update student information
 *     description: Update student information such as name, room number or capacity.
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
 *                 type: email
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
  const connection = pool.getConnection();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    await connection.beginTransaction();
    const { name, email, major, phone } = req.body;
    const [result] = await connection.execute(
      "UPDATE students SET name=?, email=?, major=?, phone=? WHERE id=?",
      [name, email, major, phone, req.params.id],
    );
    if (result.affectedRows === 0) {
      (await connection).rollback();
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    await connection.commit();
    res.json({ success: true, message: "Student updated!" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /student/{id}:
 *   delete:
 *     summary: Delete a student
 *     description: Delete a student and his information.
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
  const connection = pool.getConnection();

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    (await connection).beginTransaction();
    const [result] = await connection.execute("DELETE FROM students WHERE id =?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      (await connection).rollback();
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    (await connection).commit();
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllStudents,
  getStudentByID,
  createStudent,
  updateStudent,
  deleteStudent,
};
