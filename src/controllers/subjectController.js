const { pool } = require("../config/db");



/**
 * @openapi
 * /subject:
 *    get:
 *      summary: Get all subjects' information
 *      description: Get information of all subjects that are registered in the system. 
 *      tags: [Subjects]
 *      responses:
 *        500: 
 *          description: Error.
 */

const getAllSubjects = async (req, res) => {
  const connection = pool.getConnection();

  try {
    (await connection).beginTransaction();
    const [rows] = await connection.execute("SELECT * FROM subjects");
    (await connection).commit();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};


/**
 * @openapi
 * /subject/{subjectCode}:
 *    get:
 *      summary: Get all subject's information with subject code
 *      description: Get information of subject that are registered in the system with a unique ID code. 
 *      tags: [Subjects]
 *      parameters:
 *        - in: path
 *          name: subjectCode
 *          required: true
 *          schema:
 *            type: integer
 *          description: The unique ID of the subject.
 *      responses:
 *       404:
 *         description: Subject cannot be found.
 *       500:
 *         description: Error.
 */

const getSubjectBySubjectCode = async (req, res) => {
  const connection = pool.getConnection();

  const { subjectCode } = req.params;
  try {
    (await connection).beginTransaction();
    const [rows] = await connection.execute(
      "SELECT * FROM subjects WHERE subject_code = ?",
      [subjectCode],
    );

    if (rows.length === 0) {
      (await connection).rollback();
      return res
        .status(404)
        .json({ success: false, message: "Cannot find Subject" });
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
 * /subject:
 *   post:
 *     summary: Create new subject
 *     description: Registers a new subject with information such as name, subject code, credit.
 *     tags: [Subjects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - subject_code
 *               - credit
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science for Intermediate
 *               subject_code:
 *                 type: string
 *                 example: STU102
 *               credit:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Subject created.
 *       500:
 *         description: Error.
 */

// Need to add CHECKING DUPLICATION
const createSubject = async (req, res) => {
  const connection = pool.getConnection();

  try {
    (await connection).beginTransaction();
    const { name, subject_code, credit } = req.body;
    const [result] = await connection.execute(
      "INSERT INTO subjects (name, subject_code,credit) VALUES (?, ?, ?)",
      [name, subject_code, credit],
    );
    (await connection).commit();
    res.status(201).json({ success: true, message: "Subject created" });
  } catch (error) {
    (await connection).rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

/**
 * @openapi
 * /subject/{subject_code}:
 *   put:
 *     summary: Update subject information
 *     description: Update subject information such as name, room number or capacity.
 *     tags: [Subjects]
 *     parameters:
 *        - in: path
 *          name: subjectCode
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique code of the subject
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
 *                 example: Computer Science for Beginners.
 *               subject_code:
 *                 type: string
 *                 example: STU101
 *               credit:
 *                 type: integer
 *                 example: 20
 *               status:
 *                 type: integer
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       404:
 *         description: Cannot find subject.
 *       500:
 *         description: Error.
 */

const updateSubject = async (req, res) => {
  const connection = pool.getConnection();

  const { subjectCode } = req.params;
  try {
    const { name, subject_code, credit, status } = req.body;

    const [existing] = await connection.execute(
      "SELECT * FROM subjects WHERE subject_code = ?",
      [subjectCode],
    );
    // Check exist
    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find subject" });
    }

    const currentSubject = existing[0];

    const finalName = name !== undefined ? name : currentSubject.name;
    const finalCredit = credit !== undefined ? credit : currentSubject.credit;
    const finalStatus = status !== undefined ? status : currentSubject.status;
    const finalSubjectCode =
      subject_code !== undefined ? subject_code : currentSubject.subject_code;

    const [result] = await connection.execute(
      "UPDATE subjects SET name=?, subject_code=?, credit=?, status=? WHERE subject_code=?",
      [finalName, finalSubjectCode, finalCredit, finalStatus, subjectCode],
    );
    res.json({ success: true, message: "Subject updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    (await connection).release();
  }
};

/**
 * @openapi
 * /subject/{subjectCode}:
 *   delete:
 *     summary: Delete a subject
 *     description: Delete a subject and its' enrollment.
 *     tags: [Subjects]
 *     parameters:
 *        - in: path
 *          name: subjectCode
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique code of the subject
 *     responses:
 *       404:
 *         description: Subject could not be found.
 *       500:
 *         description: Error.
 */

const deleteSubject = async (req, res) => {
  const connection = pool.getConnection();

  const { subjectCode } = req.params;
  try {
    const [result] = await connection.execute(
      "DELETE FROM subjects WHERE subject_code =?",
      [subjectCode],
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllSubjects,
  getSubjectBySubjectCode,
  createSubject,
  updateSubject,
  deleteSubject,
};
