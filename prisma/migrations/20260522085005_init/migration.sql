-- CreateEnum
CREATE TYPE "subjects_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "class" (
    "class_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "room_number" VARCHAR(20),
    "subject_code" VARCHAR(20) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolled_count" INTEGER DEFAULT 0,

    CONSTRAINT "class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "enrolled" (
    "student_code" VARCHAR(20) NOT NULL,
    "class_id" INTEGER NOT NULL,
    "enrollment_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrolled_pkey" PRIMARY KEY ("student_code","class_id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "student_code" VARCHAR(20) NOT NULL,
    "major" VARCHAR(100),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "name" VARCHAR(100) NOT NULL,
    "subject_code" VARCHAR(20) NOT NULL,
    "credit" INTEGER NOT NULL,
    "status" "subjects_status" DEFAULT 'inactive',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("subject_code")
);

-- CreateIndex
CREATE INDEX "class_subject_code_idx" ON "class"("subject_code");

-- CreateIndex
CREATE INDEX "enrolled_class_id_idx" ON "enrolled"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_code_key" ON "students"("student_code");

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "fk_class_subject" FOREIGN KEY ("subject_code") REFERENCES "subjects"("subject_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrolled" ADD CONSTRAINT "fk_enrolled_class" FOREIGN KEY ("class_id") REFERENCES "class"("class_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "enrolled" ADD CONSTRAINT "fk_enrolled_student" FOREIGN KEY ("student_code") REFERENCES "students"("student_code") ON DELETE CASCADE ON UPDATE NO ACTION;
