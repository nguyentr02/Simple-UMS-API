const { pool } = require("../config/db");

/**
 * @openapi
 * /enroll:
 *   get:
 *     summary: Get enrollment information
 *     description: Get information of every enrollment from students.
 *     tags: [Enrollments]
 */

const getAllEnroll = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(`
        SELECT 
            s.name AS student_name,
            e.student_code, 
            e.class_id,
            c.subject_code, 
            e.enrollment_date
        FROM enrolled e
        JOIN students s ON e.student_code = s.student_code
        JOIN class c ON e.class_id = c.class_id;
        `);
    await connection.commit();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// Enroll student to a class

/**
 * @openapi
 * /enroll:
 *   post:
 *     summary: Enroll a student into a class
 *     description: Registers a student code to a specific class ID after verifying capacities.
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_code
 *               - class_id
 *             properties:
 *               student_code:
 *                 type: string
 *                 example: "STU101"
 *               class_id:
 *                 type: integer
 *                 example: 1001
 *     responses:
 *       201:
 *         description: Student successfully enrolled in the class.
 *       400:
 *         description: Class has reached maximum capacity.
 *       404:
 *         description: Class not found.
 */

const createEnroll = async (req, res) => {
  const { student_code, class_id } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [classRows] = await connection.execute(
      "SELECT capacity, enrolled_count FROM class WHERE class_id = ? FOR UPDATE",
      [class_id],
    );
    // Check if class exist
    if (classRows.length === 0) {
      await connection.rollback();
      res.status(404).json({ success: false, message: "Class not found" });
    }

    const { capacity, enrollCount } = classRows[0];

    // Check if class has remaining capcity
    if (capacity <= enrollCount) {
      await connection.rollback();
      res
        .status(400)
        .json({ success: false, message: "Class is full already" });
    }

    const [result] = await connection.execute(
      "INSERT INTO enrolled (student_code, class_id) VALUES (?, ?)",
      [student_code, class_id],
    );

    // UPDATE new enrolled_count of class in class table
    const [updateEnrollCountinClass] = await connection.execute(
      "UPDATE class SET enrolled_count = enrolled_count + 1 WHERE class_id=?",
      [class_id],
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Student successfully enrolled in the class.",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// 4 things to do with changing class:
// Check if targeted enrollment exists - DONE
// Check whether this student has already enrolled in the new class - DONE (by Dtb)
// Check capacity of new class before enroll - DONE
// Dec enrolled_count of old class - DONE
// Inc enrolled_count of new class - DONE

/**
 * @openapi
 * /enroll/{student_code}/{class_id}:
 *   patch:
 *     summary: Update student enrollment
 *     description: Change enrollment of a student from a class to another class.
 *     tags: [Enrollments]
 *     parameters:
 *        - in: path
 *          name: student_code
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique ID of the student
 *        - in: path
 *          name: class_id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the class
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newClassId
 *             properties:
 *               newClassId:
 *                 type: integer
 *                 example: 1001
 *     responses:
 *       201:
 *         description: Enrollment updated successfully.
 *       400:
 *         description: Class has reached maximum capacity.
 *       403:
 *         description: Cannot find target class.
 *       404:
 *         description: Cannot find enrollment.
 */

const updateEnroll = async (req, res) => {
  const { student_code, class_id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const { newClassId } = req.body;

    // Check if targeted enrollment exists
    const [targetedExisting] = await connection.execute(
      "SELECT * FROM enrolled WHERE student_code = ? AND class_id = ?",
      [student_code, class_id],
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Cannot find enrollment" });
    }

    const [checkCapacityOfNewClass] = await connection.execute(
      "SELECT capacity, enrolled_count FROM class WHERE class_id =?",
      [newClassId],
    );

    if (checkCapacityOfNewClass.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Cannot find targeted class" });
    }

    const { capacity, enrollCount } = checkCapacityOfNewClass[0];

    if (capacity <= enrollCount) {
      await connection.rollback();
      res
        .status(400)
        .json({ success: false, message: "Class is full already" });
    }

    const [incEnrollCountinClass] = await connection.execute(
      `UPDATE class SET enrolled_count = enrolled_count + 1 WHERE class_id = ?`,
      [newClassId],
    );

    const [decEnrollCountinClass] = await connection.execute(
      `UPDATE class SET enrolled_count = enrolled_count - 1 WHERE class_id = ?`,
      [class_id],
    );

    await connection.commit();
    res.status(200).json({ success: true, message: "Enrollment updated" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /enroll/{student_code}/{class_id}:
 *   delete:
 *     summary: Delete enrollment of a student
 *     description: Unregister a student from a specific class.
 *     tags: [Enrollments]
 *     parameters:
 *        - in: path
 *          name: student_code
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique ID of the student
 *        - in: path
 *          name: class_id
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the class
 *     responses:
 *       201:
 *         description: Enrollment deleted.
 *       404:
 *         description: Enrollment could not be found.
 *       500:
 *         description: Error.
 */

const deleteEnroll = async (req, res) => {
  const { student_code, class_id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      "DELETE FROM enrolled WHERE student_code = ? AND class_id = ?",
      [student_code, class_id],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Enrollment could not be found" });
    }

    const [decEnrollCountinClass] = await connection.execute(
      `UPDATE class SET enrolled_count = enrolled_count - 1 WHERE class_id = ?`,
      [class_id],
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Enrollment deleted" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllEnroll,
  createEnroll,
  deleteEnroll,
};
