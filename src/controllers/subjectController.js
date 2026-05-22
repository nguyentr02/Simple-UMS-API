const { prisma } = require("../database");

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
  try {
    const subjects = await prisma.subjects.findMany();
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /subject/{subjectCode}:
 *    get:
 *      summary: Get subject by subject code
 *      description: Get information of subject with a unique ID code.
 *      tags: [Subjects]
 *      parameters:
 *        - in: path
 *          name: subjectCode
 *          required: true
 *          schema:
 *            type: string
 *          description: The unique ID of the subject.
 *      responses:
 *       404:
 *         description: Subject cannot be found.
 *       500:
 *         description: Error.
 */
const getSubjectBySubjectCode = async (req, res) => {
  const { subjectCode } = req.params;
  try {
    const subject = await prisma.subjects.findUnique({
      where: { subject_code: subjectCode },
    });
    if (!subject) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find Subject" });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
const createSubject = async (req, res) => {
  const { name, subject_code, credit } = req.body;
  try {
    await prisma.subjects.create({
      data: { name, subject_code, credit },
    });
    res.status(201).json({ success: true, message: "Subject created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /subject/{subject_code}:
 *   put:
 *     summary: Update subject information
 *     description: Update subject information such as name, credit or status.
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
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       404:
 *         description: Cannot find subject.
 *       500:
 *         description: Error.
 */
const updateSubject = async (req, res) => {
  const { subjectCode } = req.params;
  const { name, subject_code, credit, status } = req.body;
  try {
    const existing = await prisma.subjects.findUnique({
      where: { subject_code: subjectCode },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find subject" });
    }
    await prisma.subjects.update({
      where: { subject_code: subjectCode },
      data: {
        name: name ?? existing.name,
        subject_code: subject_code ?? existing.subject_code,
        credit: credit ?? existing.credit,
        status: status ?? existing.status,
      },
    });
    res.json({ success: true, message: "Subject updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /subject/{subjectCode}:
 *   delete:
 *     summary: Delete a subject
 *     description: Delete a subject and its enrollments.
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
  const { subjectCode } = req.params;
  try {
    const existing = await prisma.subjects.findUnique({
      where: { subject_code: subjectCode },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });
    }
    await prisma.subjects.delete({ where: { subject_code: subjectCode } });
    res.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectBySubjectCode,
  createSubject,
  updateSubject,
  deleteSubject,
};
