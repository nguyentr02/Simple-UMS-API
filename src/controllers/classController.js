const { pool } = require("../config/db");

/**
 * @openapi
 * /class:
 *   get:
 *     summary: Get class information
 *     description: Get information of all classes.
 *     tags: [Classes]
 */


const getAllClass = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM class");
    await connection.commit();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /class/{subjectCode}:
 *   get:
 *     summary: Get class information using subject code
 *     description: Get information of all classes that have matched target subject code.
 *     tags: [Classes]
 *     parameters:
 *        - in: path
 *          name: subjectCode
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique ID of the subject of that class.
 */

const getAllClassBySubjectCode = async (req, res) => {
  const connection = await pool.getConnection();

  const { subjectCode } = req.params;
  try {
    await (await connection).beginTransaction();
    const [rows] = await connection.execute(
      "SELECT * FROM class WHERE subject_code = ?",
      [subjectCode],
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Cannot find class" });
    }
    await connection.commit();
    res.json({ success: true, data: rows });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /class:
 *   post:
 *     summary: Create class
 *     description: Registers a new class that match with an existent subject.
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject_code
 *               - room_number
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science for Beginner
 *               subject_code:
 *                 type: string
 *                 example: STU102
 *               room_number:
 *                 type: string
 *                 example: LAB 202
 *               capacity:
 *                 type: integer
 *                 example: 32
 *     responses:
 *       201:
 *         description: Class created.
 *       500:
 *         description: Error.
 */

// Need to add CHECKING DUPLICATION
const createClass = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const { name, subject_code, room_number, capacity } = req.body;
    const [result] = await connection.execute(
      "INSERT INTO class (name, subject_code,room_number, capacity) VALUES (?, ?, ?, ?)",
      [name, subject_code, room_number, capacity],
    );
    await connection.commit();
    res.status(201).json({ success: true, message: "Class created" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /class/{student_code}/{class_id}:
 *   put:
 *     summary: Update class information
 *     description: Update class information such as name, room number or capacity.
 *     tags: [Classes]
 *     parameters:
 *        - in: path
 *          name: class_id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the class
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science for Beginners.
 *               subject_code:
 *                 type: string
 *                 example: STU101
 *               room_number:
 *                 type: string
 *                 example: LAB 202
 *               capacity:
 *                 type: integer
 *                 example: 32
 *     responses:
 *       201:
 *         description: Enrollment updated successfully.
 *       404:
 *         description: Cannot find class.
 */

const updateClass = async (req, res) => {
  const connection = pool.getConnection();

  const { classId } = req.params;
  try {
    await connection.beginTransaction();
    const { name, subject_code, room_number, capacity } = req.body;

    const [existing] = await connection.execute(
      "SELECT * FROM class WHERE class_id = ?",
      [classId],
    );
    // Check exist
    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Cannot find class" });
    }

    const currentClass = existing[0];

    const finalName = name !== undefined ? name : currentClass.name;
    const finalCapacity =
      capacity !== undefined ? capacity : currentClass.capacity;
    const finalRoomNumber =
      room_number !== undefined ? room_number : currentClass.room_number;
    const finalSubjectCode =
      subject_code !== undefined ? subject_code : currentClass.subject_code;

    const [result] = await connection.execute(
      "UPDATE class SET name=?, subject_code=?, capacity=?, room_number=?, WHERE class_id=?",
      [finalName, finalSubjectCode, finalCapacity, finalRoomNumber, classId],
    );
    await connection.commit();
    res.json({ success: true, message: "Class updated!" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await connection.release();
  }
};

/**
 * @openapi
 * /class/{classId}:
 *   delete:
 *     summary: Delete a class
 *     description: Delete a class and its' enrollment.
 *     tags: [Classes]
 *     parameters:
 *        - in: path
 *          name: classId
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the class
 *     responses:
 *       404:
 *         description: Class could not be found.
 *       500:
 *         description: Error.
 */

const deleteClass = async (req, res) => {
  const connection = pool.getConnection();

  const { classId } = req.params;
  try {
    await connection.beginTransaction;
    const [result] = await connection.execute(
      "DELETE FROM class WHERE class_id =?",
      [classId],
    );
    if (result.affectedRows === 0) {
      (await connection).rollback();
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    (await connection).commit;
    res.json({ success: true, message: "Class deleted" });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    (await connection).release();
  }
};

module.exports = {
  getAllClass,
  getAllClassBySubjectCode,
  createClass,
  updateClass,
  deleteClass,
};
