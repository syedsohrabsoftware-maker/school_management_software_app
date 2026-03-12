import {
  mysqlTable, int, varchar, boolean, tinyint,
  decimal, text, date, datetime, timestamp, mysqlEnum, time,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// ══════════════════════════════════════════════════════════════
//  1. SCHOOLS
// ══════════════════════════════════════════════════════════════
export const schools = mysqlTable("schools", {
  id:             int("id").autoincrement().primaryKey(),
  schoolCode:     varchar("school_code",   { length: 50  }),
  schoolName:     varchar("school_name",   { length: 255 }),
  address:        text("address"),
  email:          varchar("email",         { length: 100 }),
  password:       varchar("password",      { length: 255 }),
  phone:          varchar("phone",         { length: 20  }),
  logo:           varchar("logo",          { length: 255 }),
  planStartDate:  date("plan_start_date"),
  planExpiryDate: date("plan_expiry_date"),
  isActive:       tinyint("is_active").default(1),
  createdAt:      datetime("created_at").default(sql`current_timestamp()`),
  lastLogin:      datetime("last_login"),
  resetToken:     varchar("reset_token",   { length: 255 }),
  resetExpiry:    datetime("reset_expiry"),
  idCardStatus:   int("id_card_status").default(0),
  isPro:          tinyint("is_pro").default(0),
});

// ══════════════════════════════════════════════════════════════
//  2. SESSIONS
// ══════════════════════════════════════════════════════════════
export const sessions = mysqlTable("sessions", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id"),
  sessionYear: varchar("session_year", { length: 20 }),
  isActive:    tinyint("is_active").default(1),
  createdAt:   datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  3. CLASSES
// ══════════════════════════════════════════════════════════════
export const classes = mysqlTable("classes", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id"),
  className: varchar("class_name", { length: 50 }),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  4. SECTIONS
// ══════════════════════════════════════════════════════════════
export const sections = mysqlTable("sections", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id"),
  classId:     int("class_id"),
  sectionName: varchar("section_name", { length: 50 }),
  createdAt:   datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  5. SUBJECTS
// ══════════════════════════════════════════════════════════════
export const subjects = mysqlTable("subjects", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id").notNull(),
  subjectName: varchar("subject_name", { length: 100 }).notNull(),
  createdAt:   datetime("created_at").default(sql`current_timestamp()`),
  isActive:    tinyint("is_active").default(1),
});

// ══════════════════════════════════════════════════════════════
//  6. CLASS SUBJECTS
// ══════════════════════════════════════════════════════════════
export const classSubjects = mysqlTable("class_subjects", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  classId:   int("class_id").notNull(),
  sectionId: int("section_id"),
  subjectId: int("subject_id").notNull(),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  7. STUDENTS
// ══════════════════════════════════════════════════════════════
export const students = mysqlTable("students", {
  id:                int("id").autoincrement().primaryKey(),
  schoolId:          int("school_id"),
  admissionNo:       varchar("admission_no",      { length: 50  }),
  folioNo:           varchar("folio_no",           { length: 255 }),
  classId:           int("class_id"),
  sectionId:         int("section_id"),
  rollNo:            varchar("roll_no",            { length: 20  }),
  admissionDate:     date("admission_date"),
  name:              varchar("name",               { length: 100 }),
  gender:            mysqlEnum("gender", ["Male", "Female", "Other"]),
  dob:               date("dob"),
  bloodGroup:        varchar("blood_group",        { length: 5   }),
  religion:          varchar("religion",           { length: 50  }),
  caste:             varchar("caste",              { length: 50  }),
  nationality:       varchar("nationality",        { length: 50  }),
  mobile:            varchar("mobile",             { length: 15  }),
  email:             varchar("email",              { length: 100 }),
  address:           text("address"),
  city:              varchar("city",               { length: 100 }),
  state:             varchar("state",              { length: 100 }),
  pincode:           varchar("pincode",            { length: 10  }),
  fatherName:        varchar("father_name",        { length: 100 }),
  fatherOccupation:  varchar("father_occupation",  { length: 100 }),
  motherName:        varchar("mother_name",        { length: 100 }),
  parentContact:     varchar("parent_contact",     { length: 15  }),
  guardianName:      varchar("guardian_name",      { length: 100 }),
  guardianRelation:  varchar("guardian_relation",  { length: 50  }),
  guardianContact:   varchar("guardian_contact",   { length: 15  }),
  medicalNotes:      text("medical_notes"),
  photo:             varchar("photo",              { length: 255 }),
  birthCertificate:  varchar("birth_certificate",  { length: 255 }),
  aadhaarNo:         varchar("aadhaar_no",         { length: 20  }),
  srn:               varchar("srn",                { length: 50  }),
  pen:               varchar("pen",                { length: 50  }),
  apaarId:           varchar("apaar_id",           { length: 50  }),
  tcFile:            varchar("tc_file",            { length: 255 }),
  marksheetFile:     varchar("marksheet_file",     { length: 255 }),
  status:            mysqlEnum("status", ["Active", "Inactive"]).default("Active"),
  sessionId:         int("session_id"),
  createdAt:         datetime("created_at").default(sql`current_timestamp()`),
  updatedAt:         datetime("updated_at").default(sql`current_timestamp()`),
  isMainStudent:     tinyint("is_main_student").default(0),
  mainStudentId:     int("main_student_id"),
  isPromoted:        tinyint("is_promoted").default(0),
});

// ══════════════════════════════════════════════════════════════
//  8. STUDENT SIBLINGS
// ══════════════════════════════════════════════════════════════
export const studentSiblings = mysqlTable("student_siblings", {
  id:             int("id").autoincrement().primaryKey(),
  schoolId:       int("school_id").notNull(),
  folioNo:        varchar("folio_no",         { length: 50 }).notNull(),
  studentId:      int("student_id").notNull(),
  relationToMain: varchar("relation_to_main", { length: 50 }),
});

// ══════════════════════════════════════════════════════════════
//  9. STUDENT SUBJECTS
// ══════════════════════════════════════════════════════════════
export const studentSubjects = mysqlTable("student_subjects", {
  id:        int("id").autoincrement().primaryKey(),
  studentId: int("student_id").notNull(),
  subjectId: int("subject_id").notNull(),
  sessionId: int("session_id"),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
  schoolId:  int("school_id"),
});

// ══════════════════════════════════════════════════════════════
//  10. STUDENT RESULTS
// ══════════════════════════════════════════════════════════════
export const studentResults = mysqlTable("student_results", {
  id:             int("id").autoincrement().primaryKey(),
  studentId:      int("student_id").notNull(),
  subjectId:      int("subject_id").notNull(),
  maxMarks:       int("max_marks").notNull(),
  theoryMarks:    int("theory_marks").notNull(),
  practicalMarks: int("practical_marks").notNull(),
  totalMarks:     int("total_marks").notNull(),
  examType:       varchar("exam_type", { length: 50 }),
  schoolId:       int("school_id").notNull(),
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  11. STUDENT LEARNING STATS
// ══════════════════════════════════════════════════════════════
export const studentLearningStats = mysqlTable("student_learning_stats", {
  studentId:    int("student_id").primaryKey(),
  totalPoints:  int("total_points").default(0),
  currentLevel: int("current_level").default(1),
  lastUpdated:  timestamp("last_updated").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  12. STUDENTS NOTIFICATION
// ══════════════════════════════════════════════════════════════
export const studentsNotification = mysqlTable("students_notification", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  title:     varchar("title",   { length: 255 }).notNull(),
  message:   text("message").notNull(),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  13. TEACHERS
// ══════════════════════════════════════════════════════════════
export const teachers = mysqlTable("teachers", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  name:      varchar("name",     { length: 100 }).notNull(),
  email:     varchar("email",    { length: 100 }).notNull(),
  phone:     varchar("phone",    { length: 20  }),
  address:   text("address"),
  gender:    mysqlEnum("gender", ["Male", "Female", "Other"]).default("Male"),
  photo:     varchar("photo",    { length: 255 }),
  subject:   varchar("subject",  { length: 100 }),
  password:  varchar("password", { length: 255 }).notNull(),
  isActive:  tinyint("is_active").default(1),
  role:      varchar("role",     { length: 20  }).default("teacher"),
  status:    tinyint("status").default(1),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
  updatedAt: datetime("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  14. TEACHER CLASS ASSIGNMENTS
// ══════════════════════════════════════════════════════════════
export const teacherClassAssignments = mysqlTable("teacher_class_assignments", {
  id:         int("id").autoincrement().primaryKey(),
  teacherId:  int("teacher_id"),
  sessionId:  int("session_id"),
  classId:    int("class_id"),
  sectionId:  int("section_id"),
  schoolId:   int("school_id"),
  assignedBy: int("assigned_by"),
  active:     tinyint("active").default(1),
  remarks:    varchar("remarks", { length: 255 }),
  createdAt:  datetime("created_at").default(sql`current_timestamp()`),
  updatedAt:  datetime("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  15. USERS  (admin / teacher / accountant / clerk)
//  ✅ SQL se exact: role enum('admin','teacher','accountant','clerk')
// ══════════════════════════════════════════════════════════════
export const users = mysqlTable("users", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id"),
  name:      varchar("name",     { length: 100 }),
  email:     varchar("email",    { length: 100 }),
  password:  varchar("password", { length: 255 }),
  role:      mysqlEnum("role", ["admin", "teacher", "accountant", "clerk"]),
  isActive:  tinyint("is_active").default(1),
  lastLogin: datetime("last_login"),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  16. USER LOGINS
// ══════════════════════════════════════════════════════════════
export const userLogins = mysqlTable("user_logins", {
  id:         int("id").autoincrement().primaryKey(),
  schoolId:   int("school_id").notNull(),
  userId:     int("user_id").notNull(),
  role:       mysqlEnum("role", ["admin", "teacher", "accountant"]).notNull(),
  loginTime:  datetime("login_time").notNull(),
  logoutTime: datetime("logout_time"),
  ipAddress:  varchar("ip_address", { length: 45  }).notNull(),
  userAgent:  text("user_agent"),
  sessionId:  varchar("session_id", { length: 128 }),
});

// ══════════════════════════════════════════════════════════════
//  17. USER PERMISSIONS
// ══════════════════════════════════════════════════════════════
export const userPermissions = mysqlTable("user_permissions", {
  id:        int("id").autoincrement().primaryKey(),
  userId:    int("user_id").notNull(),
  pageKey:   varchar("page_key",  { length: 100 }).notNull(),
  isAllowed: tinyint("is_allowed").default(1),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
  updatedAt: datetime("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  18. SCHOOL PERMISSIONS
// ══════════════════════════════════════════════════════════════
export const schoolPermissions = mysqlTable("school_permissions", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  pageKey:   varchar("page_key",  { length: 100 }).notNull(),
  isAllowed: tinyint("is_allowed").default(1),
  createdAt: datetime("created_at").default(sql`current_timestamp()`),
  updatedAt: datetime("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
export const attendance = mysqlTable("attendance", {
  id:             int("id").autoincrement().primaryKey(),
  studentId:      int("student_id").notNull(),
  classId:        int("class_id").notNull(),
  sectionId:      int("section_id").notNull(),
  teacherId:      int("teacher_id").notNull(),
  schoolId:       int("school_id").notNull(),
  attendanceDate: date("attendance_date").notNull(),
  status:         mysqlEnum("status", ["Present", "Absent", "Leave", "Late"]).notNull(), // Maine 'Late' bhi add kar diya hai agar dashboard mein use karna ho
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt:      timestamp("updated_at").default(sql`current_timestamp()`),
}, (table) => {
  return {
    // 🔥 Sabse Zaroori Line: Ye batata hai ki ek student ki ek date par ek hi entry hogi
    // Iske bina onConflictDoUpdate build fail kar deta hai
    studentDateIdx: uniqueIndex("student_date_idx").on(table.studentId, table.attendanceDate),
  };
});

// ══════════════════════════════════════════════════════════════
//  20. EMPLOYEE ATTENDANCE
// ══════════════════════════════════════════════════════════════
export const employeeAttendance = mysqlTable("employee_attendance", {
  id:             int("id").autoincrement().primaryKey(),
  schoolId:       int("school_id").notNull(),
  employeeId:     int("employee_id").notNull(),
  attendanceDate: date("attendance_date").notNull(),
  status:         mysqlEnum("status", ["Present", "Absent", "Leave"]).notNull(),
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  21. FEE DETAILS
// ══════════════════════════════════════════════════════════════
export const feeDetails = mysqlTable("fee_details", {
  id:              int("id").autoincrement().primaryKey(),
  studentId:       int("student_id").notNull(),
  schoolId:        int("school_id").notNull(),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }),
  admissionFee:    decimal("admission_fee",    { precision: 10, scale: 2 }),
  annualCharge:    decimal("annual_charge",    { precision: 10, scale: 2 }),
  tuitionFee:      decimal("tuition_fee",      { precision: 10, scale: 2 }),
  otherFee:        decimal("other_fee",        { precision: 10, scale: 2 }),
  grandTotal:      decimal("grand_total",      { precision: 10, scale: 2 }),
  dueDate:         date("due_date"),
  createdAt:       timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  22. OLD FEE DETAILS
// ══════════════════════════════════════════════════════════════
export const oldFeeDetails = mysqlTable("old_fee_details", {
  id:              int("id").autoincrement().primaryKey(),
  studentId:       int("student_id").notNull(),
  schoolId:        int("school_id").notNull(),
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).default("0"),
  admissionFee:    decimal("admission_fee",    { precision: 10, scale: 2 }).default("0"),
  annualCharge:    decimal("annual_charge",    { precision: 10, scale: 2 }).default("0"),
  tuitionFee:      decimal("tuition_fee",      { precision: 10, scale: 2 }).default("0"),
  otherFee:        decimal("other_fee",        { precision: 10, scale: 2 }).default("0"),
  grandTotal:      decimal("grand_total",      { precision: 10, scale: 2 }).default("0"),
  dueDate:         date("due_date"),
  createdAt:       timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt:       timestamp("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  23. MONTHLY FEES
// ══════════════════════════════════════════════════════════════
export const monthlyFees = mysqlTable("monthly_fees", {
  id:            int("id").autoincrement().primaryKey(),
  studentId:     int("student_id").notNull(),
  schoolId:      int("school_id").notNull(),
  teacherId:     int("teacher_id"),
  slipNo:        varchar("slip_no",       { length: 100 }).notNull(),
  folioNo:       varchar("folio_no",      { length: 50  }).notNull(),
  feeMonth:      varchar("fee_month",     { length: 20  }).notNull(),
  feeYear:       int("fee_year").notNull(),
  paidAmount:    decimal("paid_amount",   { precision: 10, scale: 2 }).notNull(),
  paymentDate:   date("payment_date").notNull(),
  reminderDate:  date("reminder_date"),
  paymentMethod: varchar("payment_method",{ length: 50  }).notNull(),
  remarks:       text("remarks"),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt:     timestamp("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  24. OLD FEE PAYMENTS
// ══════════════════════════════════════════════════════════════
export const oldFeePayments = mysqlTable("old_fee_payments", {
  id:            int("id").autoincrement().primaryKey(),
  studentId:     int("student_id").notNull(),
  schoolId:      int("school_id").notNull(),
  teacherId:     int("teacher_id"),
  slipNo:        varchar("slip_no",       { length: 50  }).notNull(),
  folioNo:       varchar("folio_no",      { length: 255 }),
  feeMonth:      varchar("fee_month",     { length: 20  }).notNull(),
  feeYear:       int("fee_year").notNull(),
  paidAmount:    decimal("paid_amount",   { precision: 10, scale: 2 }).notNull(),
  paymentDate:   date("payment_date").notNull(),
  paymentMethod: varchar("payment_method",{ length: 50  }),
  remarks:       text("remarks"),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt:     timestamp("updated_at").default(sql`current_timestamp()`),
  enteredBy:     int("entered_by"),
  reminderDate:  date("reminder_date"),
});

// ══════════════════════════════════════════════════════════════
//  25. OLD STUDENTS  (passout/alumni)
// ══════════════════════════════════════════════════════════════
export const oldStudents = mysqlTable("old_students", {
  id:            int("id").autoincrement().primaryKey(),
  schoolId:      int("school_id").notNull(),
  sessionYear:   varchar("session_year",  { length: 20  }),
  studentName:   varchar("student_name",  { length: 100 }).notNull(),
  mobile:        varchar("mobile",        { length: 15  }),
  fatherName:    varchar("father_name",   { length: 100 }),
  address:       text("address"),
  status:        varchar("status",        { length: 50  }),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
  className:     varchar("class_name",    { length: 50  }),
  sectionName:   varchar("section_name",  { length: 50  }),
  slipNo:        varchar("slip_no",       { length: 50  }).notNull(),
  feeMonth:      varchar("fee_month",     { length: 20  }),
  feeYear:       int("fee_year"),
  receivedAmount: decimal("received_amount", { precision: 10, scale: 2 }),
  paymentDate:   date("payment_date"),
  paymentMethod: varchar("payment_method",{ length: 50  }),
  remarks:       text("remarks"),
});

// ══════════════════════════════════════════════════════════════
//  26. INCOMES
// ══════════════════════════════════════════════════════════════
export const incomes = mysqlTable("incomes", {
  id:           int("id").autoincrement().primaryKey(),
  schoolId:     int("school_id").notNull(),
  incomeDate:   date("income_date").notNull(),
  incomeHeadId: int("income_head_id").notNull(),
  incomeName:   varchar("income_name",  { length: 255 }).notNull(),
  amount:       decimal("amount",       { precision: 10, scale: 2 }).notNull(),
  source:       varchar("source",       { length: 255 }).notNull(),
  paymentMode:  varchar("payment_mode", { length: 50  }).notNull(),
  detail:       text("detail"),
  createdAt:    timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  27. INCOME HEADS
// ══════════════════════════════════════════════════════════════
export const incomeHeads = mysqlTable("income_heads", {
  id:             int("id").autoincrement().primaryKey(),
  schoolId:       int("school_id").notNull(),
  incomeHeadName: varchar("income_head_name", { length: 255 }).notNull(),
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  28. EXPENSES
// ══════════════════════════════════════════════════════════════
export const expenses = mysqlTable("expenses", {
  id:            int("id").autoincrement().primaryKey(),
  schoolId:      int("school_id").notNull(),
  expenseDate:   date("expense_date").notNull(),
  expenseHeadId: int("expense_head_id").notNull(),
  expenseName:   varchar("expense_name", { length: 255 }).notNull(),
  amount:        decimal("amount",       { precision: 12, scale: 2 }).notNull(),
  vendorId:      int("vendor_id").notNull(),
  paymentMode:   varchar("payment_mode", { length: 50  }).notNull(),
  detail:        text("detail"),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  29. EXPENSE HEADS
// ══════════════════════════════════════════════════════════════
export const expenseHeads = mysqlTable("expense_heads", {
  id:              int("id").autoincrement().primaryKey(),
  schoolId:        int("school_id").notNull(),
  expenseHeadName: varchar("expense_head_name", { length: 255 }).notNull(),
  description:     text("description"),
  createdAt:       timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  30. VENDORS
// ══════════════════════════════════════════════════════════════
export const vendors = mysqlTable("vendors", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  name:      varchar("name",    { length: 100 }).notNull(),
  mobile:    varchar("mobile",  { length: 20  }),
  email:     varchar("email",   { length: 100 }),
  address:   text("address"),
  remark:    varchar("remark",  { length: 255 }),
  createdAt: timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt: timestamp("updated_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  31. EMPLOYEES
// ══════════════════════════════════════════════════════════════
export const employees = mysqlTable("employees", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id"),
  name:        varchar("name",        { length: 100 }),
  email:       varchar("email",       { length: 100 }),
  phone:       varchar("phone",       { length: 20  }),
  gender:      mysqlEnum("gender", ["Male", "Female", "Other"]),
  address:     text("address"),
  designation: varchar("designation", { length: 100 }),
  department:  varchar("department",  { length: 100 }),
  joinDate:    date("join_date"),
  photo:       varchar("photo",       { length: 255 }),
  salary:      decimal("salary",      { precision: 10, scale: 2 }),
  status:      tinyint("status").default(1),
  createdAt:   timestamp("created_at").default(sql`current_timestamp()`),
  isDeleted:   tinyint("is_deleted").default(0),
  deletedAt:   datetime("deleted_at"),
});

// ══════════════════════════════════════════════════════════════
//  32. EXAMS
// ══════════════════════════════════════════════════════════════
export const exams = mysqlTable("exams", {
  id:         int("id").autoincrement().primaryKey(),
  schoolId:   int("school_id").notNull(),
  classId:    int("class_id").notNull(),
  sectionId:  int("section_id").notNull(),
  examName:   varchar("exam_name",   { length: 100 }).notNull(),
  examCenter: varchar("exam_center", { length: 255 }),
  sessionId:  int("session_id"),
  createdAt:  timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  33. EXAM DATESHEET
// ══════════════════════════════════════════════════════════════
export const examDatesheet = mysqlTable("exam_datesheet", {
  id:            int("id").autoincrement().primaryKey(),
  schoolId:      int("school_id").notNull(),
  examId:        int("exam_id").notNull(),
  subjectId:     int("subject_id"),
  subjectName:   varchar("subject_name",   { length: 100 }).notNull(),
  examDate:      date("exam_date").notNull(),
  examStartTime: time("exam_start_time"),
  examEndTime:   time("exam_end_time"),
  roomNo:        varchar("room_no",        { length: 50  }),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
  classId:       int("class_id"),
  sectionId:     int("section_id"),
});

// ══════════════════════════════════════════════════════════════
//  34. EXAM SCHEDULE
// ══════════════════════════════════════════════════════════════
export const examSchedule = mysqlTable("exam_schedule", {
  id:            int("id").autoincrement().primaryKey(),
  examId:        int("exam_id").notNull(),
  subjectName:   varchar("subject_name",   { length: 255 }).notNull(),
  examDate:      date("exam_date").notNull(),
  examStartTime: time("exam_start_time").notNull(),
  examEndTime:   time("exam_end_time").notNull(),
  roomNo:        varchar("room_no",        { length: 50  }).notNull(),
  createdAt:     timestamp("created_at").default(sql`current_timestamp()`),
  classId:       int("class_id").notNull(),
  sectionId:     int("section_id").notNull(),
});

// ══════════════════════════════════════════════════════════════
//  35. ADMISSION ENQUIRIES
// ══════════════════════════════════════════════════════════════
export const admissionEnquiries = mysqlTable("admission_enquiries", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id").notNull(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  gender:      varchar("gender",       { length: 10  }),
  dob:         date("dob"),
  sessionId:   int("session_id"),
  classId:     int("class_id"),
  fatherName:  varchar("father_name",  { length: 255 }),
  motherName:  varchar("mother_name",  { length: 255 }),
  mobile:      varchar("mobile",       { length: 20  }),
  email:       varchar("email",        { length: 100 }),
  address:     text("address"),
  createdAt:   timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  36. ADMISSION NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
export const admissionNotifications = mysqlTable("admission_notifications", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id").notNull(),
  studentName: varchar("student_name", { length: 255 }).notNull(),
  className:   varchar("class_name",   { length: 255 }).notNull(),
  sectionName: varchar("section_name", { length: 255 }).notNull(),
  admittedBy:  varchar("admitted_by",  { length: 100 }),
  createdAt:   timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  37. REMINDER NOTIFICATIONS  (active students fee)
// ══════════════════════════════════════════════════════════════
export const reminderNotifications = mysqlTable("reminder_notifications", {
  id:           int("id").autoincrement().primaryKey(),
  teacherId:    int("teacher_id").notNull(),
  studentId:    int("student_id").notNull(),
  schoolId:     int("school_id"),
  message:      text("message").notNull(),
  reminderDate: date("reminder_date").notNull(),
  isRead:       tinyint("is_read").default(0),
  createdAt:    datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  38. REMINDER NOTIFICATION OLD FEE  (passout students)
// ══════════════════════════════════════════════════════════════
export const reminderNotificationOldfee = mysqlTable("reminder_notification_oldfee", {
  id:           int("id").autoincrement().primaryKey(),
  teacherId:    int("teacher_id").notNull(),
  studentId:    int("student_id").notNull(),
  schoolId:     int("school_id").notNull(),
  message:      varchar("message",      { length: 255 }).notNull(),
  reminderDate: date("reminder_date").notNull(),
  isRead:       tinyint("is_read").default(0),
  createdAt:    datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  39. HOLIDAYS
// ══════════════════════════════════════════════════════════════
export const holidays = mysqlTable("holidays", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id").notNull(),
  holidayDate: date("holiday_date").notNull(),
  description: varchar("description", { length: 255 }),
  title:       varchar("title",       { length: 255 }).notNull(),
});

// ══════════════════════════════════════════════════════════════
//  40. GATE PASSES
// ══════════════════════════════════════════════════════════════
export const gatePasses = mysqlTable("gate_passes", {
  id:           int("id").autoincrement().primaryKey(),
  schoolId:     int("school_id").notNull(),
  passType:     mysqlEnum("pass_type", ["employee", "visitor", "student"]).notNull(),
  visitorName:  varchar("visitor_name",  { length: 100 }),
  employeeName: varchar("employee_name", { length: 100 }),
  reason:       text("reason"),
  entryTime:    datetime("entry_time"),
  exitTime:     datetime("exit_time"),
  createdAt:    timestamp("created_at").default(sql`current_timestamp()`),
  updatedAt:    timestamp("updated_at").default(sql`current_timestamp()`),
  studentName:  varchar("student_name",  { length: 255 }),
  fatherName:   varchar("father_name",   { length: 255 }),
  mobileNo:     varchar("mobile_no",     { length: 20  }),
  class:        varchar("class",         { length: 50  }),
  section:      varchar("section",       { length: 50  }),
  passNo:       varchar("pass_no",       { length: 50  }),
  whoIsToMeet:  varchar("who_is_to_meet",{ length: 255 }),
});

// ══════════════════════════════════════════════════════════════
//  41. GENERAL ENQUIRIES
// ══════════════════════════════════════════════════════════════
export const generalEnquiries = mysqlTable("general_enquiries", {
  id:         int("id").autoincrement().primaryKey(),
  name:       varchar("name",       { length: 255 }).notNull(),
  email:      varchar("email",      { length: 255 }).notNull(),
  message:    text("message").notNull(),
  createdAt:  timestamp("created_at").default(sql`current_timestamp()`),
  mobile:     varchar("mobile",     { length: 15  }).notNull(),
  schoolCode: varchar("school_code",{ length: 100 }),
});

// ══════════════════════════════════════════════════════════════
//  42. BANK ACCOUNTS
// ══════════════════════════════════════════════════════════════
export const bankAccounts = mysqlTable("bank_accounts", {
  id:                int("id").autoincrement().primaryKey(),
  schoolId:          int("school_id").notNull(),
  accountHolderName: varchar("account_holder_name", { length: 100 }),
  accountNumber:     varchar("account_number",      { length: 30  }),
  bankName:          varchar("bank_name",           { length: 100 }),
  ifscCode:          varchar("ifsc_code",           { length: 20  }),
  branchName:        varchar("branch_name",         { length: 100 }),
  remark:            text("remark"),
  createdAt:         datetime("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  43. SIGNATURES
// ══════════════════════════════════════════════════════════════
export const signatures = mysqlTable("signatures", {
  id:       int("id").autoincrement().primaryKey(),
  schoolId: int("school_id").notNull(),
  role:     varchar("role",  { length: 50  }).notNull(),
  name:     varchar("name",  { length: 100 }).notNull(),
  image:    varchar("image", { length: 255 }),
});

// ══════════════════════════════════════════════════════════════
//  44. TRANSFER CERTIFICATES
// ══════════════════════════════════════════════════════════════
export const transferCertificates = mysqlTable("transfer_certificates", {
  id:        int("id").autoincrement().primaryKey(),
  schoolId:  int("school_id").notNull(),
  studentId: int("student_id").notNull(),
  tcNumber:  varchar("tc_number", { length: 50  }),
  reason:    varchar("reason",    { length: 255 }),
  remarks:   varchar("remarks",   { length: 255 }),
  issueDate: date("issue_date"),
  createdAt: timestamp("created_at").default(sql`current_timestamp()`),
  createdBy: int("created_by"),
  status:    tinyint("status").default(1),
});

// ══════════════════════════════════════════════════════════════
//  45. TODOS
// ══════════════════════════════════════════════════════════════
export const todos = mysqlTable("todos", {
  id:             int("id").autoincrement().primaryKey(),
  task:           varchar("task",           { length: 255 }).notNull(),
  isDone:         tinyint("is_done").default(0),
  priority:       mysqlEnum("priority", ["Low", "Medium", "High"]).default("Low"),
  dueDate:        date("due_date"),
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
  schoolId:       int("school_id").notNull(),
  studentName:    varchar("student_name",   { length: 255 }).default(""),
  studentFather:  varchar("student_father", { length: 255 }).default(""),
  studentMobile:  varchar("student_mobile", { length: 100 }).default(""),
  studentAddress: text("student_address"),
  remarks:        text("remarks"),
  dueTime:        time("due_time"),
});

// ══════════════════════════════════════════════════════════════
//  46. SCHOOL TASKS NEW
// ══════════════════════════════════════════════════════════════
export const schoolTasksNew = mysqlTable("school_tasks_new", {
  id:          int("id").autoincrement().primaryKey(),
  schoolId:    int("school_id").notNull(),
  acNo:        varchar("ac_no",       { length: 50  }),
  studentName: varchar("student_name",{ length: 100 }),
  fatherName:  varchar("father_name", { length: 100 }),
  address:     text("address"),
  className:   varchar("class_name",  { length: 50  }),
  mobileNo:    varchar("mobile_no",   { length: 20  }),
  remark:      text("remark"),
  remark1:     text("remark1"),
  remark3:     text("remark3"),
  taskDateTime: datetime("task_date_time"),
  isDone:      tinyint("is_done").default(0),
  createdAt:   timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  47. PAYMENTS  (school subscription payments)
// ══════════════════════════════════════════════════════════════
export const payments = mysqlTable("payments", {
  id:            int("id").autoincrement().primaryKey(),
  schoolId:      int("school_id").notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull(),
  expiryDate:    date("expiry_date"),
  paymentDate:   datetime("payment_date").notNull(),
});

// ══════════════════════════════════════════════════════════════
//  48. SUBSCRIPTION PLANS
// ══════════════════════════════════════════════════════════════
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id:             int("id").autoincrement().primaryKey(),
  name:           varchar("name",     { length: 255 }).notNull(),
  price:          decimal("price",    { precision: 10, scale: 2 }).notNull(),
  durationMonths: int("duration_months").notNull(),
  features:       text("features"),
  status:         mysqlEnum("status", ["active", "inactive"]).default("active"),
  createdAt:      timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  49. SUPER ADMINS
// ══════════════════════════════════════════════════════════════
export const superAdmins = mysqlTable("super_admins", {
  id:        int("id").autoincrement().primaryKey(),
  name:      varchar("name",     { length: 100 }),
  email:     varchar("email",    { length: 100 }),
  password:  varchar("password", { length: 255 }),
  createdAt: timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  50. PASSWORD RESETS
// ══════════════════════════════════════════════════════════════
export const passwordResets = mysqlTable("password_resets", {
  id:        int("id").autoincrement().primaryKey(),
  email:     varchar("email",    { length: 255 }).notNull(),
  otp:       varchar("otp",      { length: 6   }).notNull(),
  expireAt:  datetime("expire_at").notNull(),
  createdAt: timestamp("created_at").default(sql`current_timestamp()`),
});

// ══════════════════════════════════════════════════════════════
//  RELATIONS
// ══════════════════════════════════════════════════════════════

export const schoolsRelations = relations(schools, ({ many }) => ({
  sessions:    many(sessions),
  classes:     many(classes),
  teachers:    many(teachers),
  students:    many(students),
  users:       many(users),
  bankAccounts: many(bankAccounts),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  school:   one(schools, { fields: [sessions.schoolId], references: [schools.id] }),
  students: many(students),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school:   one(schools,  { fields: [classes.schoolId], references: [schools.id] }),
  sections: many(sections),
  students: many(students),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class:    one(classes, { fields: [sections.classId],  references: [classes.id] }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school:       one(schools,  { fields: [students.schoolId],  references: [schools.id]  }),
  session:      one(sessions, { fields: [students.sessionId], references: [sessions.id] }),
  class:        one(classes,  { fields: [students.classId],   references: [classes.id]  }),
  section:      one(sections, { fields: [students.sectionId], references: [sections.id] }),
  feeDetails:   many(feeDetails),
  monthlyFees:  many(monthlyFees),
  attendance:   many(attendance),
  results:      many(studentResults),
  siblings:     many(studentSiblings),
}));

export const studentSiblingsRelations = relations(studentSiblings, ({ one }) => ({
  school:  one(schools,  { fields: [studentSiblings.schoolId],  references: [schools.id]  }),
  student: one(students, { fields: [studentSiblings.studentId], references: [students.id] }),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  school:      one(schools, { fields: [teachers.schoolId], references: [schools.id] }),
  assignments: many(teacherClassAssignments),
}));

export const teacherClassAssignmentsRelations = relations(teacherClassAssignments, ({ one }) => ({
  teacher:  one(teachers,  { fields: [teacherClassAssignments.teacherId],  references: [teachers.id]  }),
  school:   one(schools,   { fields: [teacherClassAssignments.schoolId],   references: [schools.id]   }),
  class:    one(classes,   { fields: [teacherClassAssignments.classId],    references: [classes.id]   }),
  section:  one(sections,  { fields: [teacherClassAssignments.sectionId],  references: [sections.id]  }),
  session:  one(sessions,  { fields: [teacherClassAssignments.sessionId],  references: [sessions.id]  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  school: one(schools, { fields: [users.schoolId], references: [schools.id] }),
}));

export const feeDetailsRelations = relations(feeDetails, ({ one }) => ({
  student: one(students, { fields: [feeDetails.studentId], references: [students.id] }),
  school:  one(schools,  { fields: [feeDetails.schoolId],  references: [schools.id]  }),
}));

export const monthlyFeesRelations = relations(monthlyFees, ({ one }) => ({
  student: one(students, { fields: [monthlyFees.studentId], references: [students.id] }),
  school:  one(schools,  { fields: [monthlyFees.schoolId],  references: [schools.id]  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  teacher: one(teachers, { fields: [attendance.teacherId], references: [teachers.id] }),
  school:  one(schools,  { fields: [attendance.schoolId],  references: [schools.id]  }),
}));

export const studentResultsRelations = relations(studentResults, ({ one }) => ({
  student: one(students, { fields: [studentResults.studentId], references: [students.id] }),
  subject: one(subjects, { fields: [studentResults.subjectId], references: [subjects.id] }),
  school:  one(schools,  { fields: [studentResults.schoolId],  references: [schools.id]  }),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  school:  one(schools, { fields: [subjects.schoolId], references: [schools.id] }),
  results: many(studentResults),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  school:      one(schools,      { fields: [expenses.schoolId],      references: [schools.id]      }),
  expenseHead: one(expenseHeads, { fields: [expenses.expenseHeadId], references: [expenseHeads.id] }),
  vendor:      one(vendors,      { fields: [expenses.vendorId],      references: [vendors.id]      }),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
  school:     one(schools,     { fields: [incomes.schoolId],     references: [schools.id]     }),
  incomeHead: one(incomeHeads, { fields: [incomes.incomeHeadId], references: [incomeHeads.id] }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  school: one(schools, { fields: [vendors.schoolId], references: [schools.id] }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  school:     one(schools, { fields: [employees.schoolId], references: [schools.id] }),
  attendance: many(employeeAttendance),
}));

export const employeeAttendanceRelations = relations(employeeAttendance, ({ one }) => ({
  employee: one(employees, { fields: [employeeAttendance.employeeId], references: [employees.id] }),
  school:   one(schools,   { fields: [employeeAttendance.schoolId],   references: [schools.id]   }),
}));

export const reminderNotificationsRelations = relations(reminderNotifications, ({ one }) => ({
  student: one(students, { fields: [reminderNotifications.studentId], references: [students.id] }),
  teacher: one(teachers, { fields: [reminderNotifications.teacherId], references: [teachers.id] }),
  school:  one(schools,  { fields: [reminderNotifications.schoolId],  references: [schools.id]  }),
}));

export const reminderNotificationOldfeeRelations = relations(reminderNotificationOldfee, ({ one }) => ({
  student: one(students, { fields: [reminderNotificationOldfee.studentId], references: [students.id] }),
  teacher: one(teachers, { fields: [reminderNotificationOldfee.teacherId], references: [teachers.id] }),
  school:  one(schools,  { fields: [reminderNotificationOldfee.schoolId],  references: [schools.id]  }),
}));

export const transferCertificatesRelations = relations(transferCertificates, ({ one }) => ({
  student: one(students, { fields: [transferCertificates.studentId], references: [students.id] }),
  school:  one(schools,  { fields: [transferCertificates.schoolId],  references: [schools.id]  }),
}));

export const examsRelations = relations(exams, ({ one, many }) => ({
  school:    one(schools,   { fields: [exams.schoolId],  references: [schools.id]   }),
  class:     one(classes,   { fields: [exams.classId],   references: [classes.id]   }),
  section:   one(sections,  { fields: [exams.sectionId], references: [sections.id]  }),
  datesheet: many(examDatesheet),
}));

export const examDatesheetRelations = relations(examDatesheet, ({ one }) => ({
  exam:    one(exams,    { fields: [examDatesheet.examId],    references: [exams.id]    }),
  subject: one(subjects, { fields: [examDatesheet.subjectId], references: [subjects.id] }),
}));