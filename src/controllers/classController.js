const { prisma } = require("../database");

/**
 * @openapi
 * /class:
 *   get:
 *     summary: Get class information
 *     description: Get information of all classes.
 *     tags: [Classes]
 */
const getAllClass = async (req, res) => {
  try {
    const classes = await prisma.schoolClass.findMany();
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  const { subjectCode } = req.params;
  try {
    const classes = await prisma.schoolClass.findMany({
      where: { subject_code: subjectCode },
    });
    if (classes.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find class" });
    }
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /class:
 *   post:
 *     summary: Create class
 *     description: Registers a new class that matches with an existing subject.
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
 *                 example: COS101
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
const createClass = async (req, res) => {
  const { name, subject_code, room_number, capacity } = req.body;
  try {
    await prisma.schoolClass.create({
      data: { name, subject_code, room_number, capacity },
    });
    res.status(201).json({ success: true, message: "Class created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /class/{classId}:
 *   put:
 *     summary: Update class information
 *     description: Update class information such as name, room number or capacity.
 *     tags: [Classes]
 *     parameters:
 *        - in: path
 *          name: classId
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
 *                 example: COS101
 *               room_number:
 *                 type: string
 *                 example: LAB 202
 *               capacity:
 *                 type: integer
 *                 example: 32
 *     responses:
 *       200:
 *         description: Class updated successfully.
 *       404:
 *         description: Cannot find class.
 */
const updateClass = async (req, res) => {
  const { classId } = req.params;
  const { name, subject_code, room_number, capacity } = req.body;
  try {
    const existing = await prisma.schoolClass.findUnique({
      where: { class_id: Number(classId) },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find class" });
    }
    await prisma.schoolClass.update({
      where: { class_id: Number(classId) },
      data: {
        name: name ?? existing.name,
        subject_code: subject_code ?? existing.subject_code,
        room_number: room_number ?? existing.room_number,
        capacity: capacity ?? existing.capacity,
      },
    });
    res.json({ success: true, message: "Class updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @openapi
 * /class/{classId}:
 *   delete:
 *     summary: Delete a class
 *     description: Delete a class and its enrollments.
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
  const { classId } = req.params;
  try {
    const existing = await prisma.schoolClass.findUnique({
      where: { class_id: Number(classId) },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    await prisma.schoolClass.delete({ where: { class_id: Number(classId) } });
    res.json({ success: true, message: "Class deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllClass,
  getAllClassBySubjectCode,
  createClass,
  updateClass,
  deleteClass,
};
