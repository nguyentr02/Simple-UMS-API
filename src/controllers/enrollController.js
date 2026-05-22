const { prisma } = require("../database");

/**
 * @openapi
 * /enroll:
 *   get:
 *     summary: Get enrollment information
 *     description: Get information of every enrollment from students.
 *     tags: [Enrollments]
 */
const getAllEnroll = async (req, res) => {
  try {
    const enrollments = await prisma.enrolled.findMany({
      include: {
        students: { select: { name: true } },
        SchoolClass: { select: { subject_code: true } },
      },
    });
    const data = enrollments.map((e) => ({
      student_name: e.students.name,
      student_code: e.student_code,
      class_id: e.class_id,
      subject_code: e.SchoolClass.subject_code,
      enrollment_date: e.enrollment_date,
    }));
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
  try {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { class_id: Number(class_id) },
    });
    if (!schoolClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    if (schoolClass.capacity <= schoolClass.enrolled_count) {
      return res
        .status(400)
        .json({ success: false, message: "Class is full already" });
    }

    await prisma.$transaction([
      prisma.enrolled.create({
        data: { student_code, class_id: Number(class_id) },
      }),
      prisma.schoolClass.update({
        where: { class_id: Number(class_id) },
        data: { enrolled_count: { increment: 1 } },
      }),
    ]);

    res
      .status(201)
      .json({
        success: true,
        message: "Student successfully enrolled in the class.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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
 *       200:
 *         description: Enrollment updated successfully.
 *       400:
 *         description: Class has reached maximum capacity.
 *       404:
 *         description: Cannot find enrollment or target class.
 */
const updateEnroll = async (req, res) => {
  const { student_code, class_id } = req.params;
  const { newClassId } = req.body;
  try {
    const existing = await prisma.enrolled.findUnique({
      where: {
        student_code_class_id: { student_code, class_id: Number(class_id) },
      },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find enrollment" });
    }

    const newClass = await prisma.schoolClass.findUnique({
      where: { class_id: Number(newClassId) },
    });
    if (!newClass) {
      return res
        .status(404)
        .json({ success: false, message: "Cannot find targeted class" });
    }
    if (newClass.capacity <= newClass.enrolled_count) {
      return res
        .status(400)
        .json({ success: false, message: "Class is full already" });
    }

    await prisma.$transaction([
      prisma.enrolled.delete({
        where: {
          student_code_class_id: { student_code, class_id: Number(class_id) },
        },
      }),
      prisma.enrolled.create({
        data: { student_code, class_id: Number(newClassId) },
      }),
      prisma.schoolClass.update({
        where: { class_id: Number(class_id) },
        data: { enrolled_count: { decrement: 1 } },
      }),
      prisma.schoolClass.update({
        where: { class_id: Number(newClassId) },
        data: { enrolled_count: { increment: 1 } },
      }),
    ]);

    res.status(200).json({ success: true, message: "Enrollment updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  try {
    const existing = await prisma.enrolled.findUnique({
      where: {
        student_code_class_id: { student_code, class_id: Number(class_id) },
      },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment could not be found" });
    }

    await prisma.$transaction([
      prisma.enrolled.delete({
        where: {
          student_code_class_id: { student_code, class_id: Number(class_id) },
        },
      }),
      prisma.schoolClass.update({
        where: { class_id: Number(class_id) },
        data: { enrolled_count: { decrement: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, message: "Enrollment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllEnroll,
  createEnroll,
  updateEnroll,
  deleteEnroll,
};
