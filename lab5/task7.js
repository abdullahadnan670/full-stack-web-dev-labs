const db = {
  students: { 101: { id: 101, prereqs: ['CS201'] } },
  courses: { 'CS401': { code: 'CS401', prereq: 'CS201', seats: 5 } }
};

function getStudent(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = db.students[id];
      student ? resolve(student) : reject(new Error(`Student ${id} not found.`));
    }, 50);
  });
}

function getCourse(courseCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = db.courses[courseCode];
      course ? resolve(course) : reject(new Error(`Course ${courseCode} not found.`));
    }, 50);
  });
}

function checkPrerequisites(student, course) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      student.prereqs.includes(course.prereq)
        ? resolve({ student, course })
        : reject(new Error(`Prerequisite ${course.prereq} missing.`));
    }, 50);
  });
}

function checkSeats(context) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      context.course.seats > 0
        ? resolve(context)
        : reject(new Error(`Course ${context.course.code} is full.`));
    }, 50);
  });
}

function registerStudent(context) {
  return new Promise((resolve) => {
    setTimeout(() => {
      context.course.seats -= 1;
      resolve({ studentId: context.student.id, course: context.course.code, status: 'REGISTERED' });
    }, 50);
  });
}

function sendEmail() {
  return new Promise((resolve) => setTimeout(() => resolve('Email Sent'), 30));
}

function sendSMS() {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('SMS Gateway Down')), 40));
}

function writeAuditLog() {
  return new Promise((resolve) => setTimeout(() => resolve('Audit Logged'), 20));
}

function fetchCoursePrimary(code) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Primary Server Timeout')), 100));
}

function fetchCourseSecondary(code) {
  return new Promise((resolve) => setTimeout(() => resolve({ code, server: 'Secondary' }), 150));
}

let currentStudent = null;

getStudent(101)
  .then(student => {
    currentStudent = student;
    return getCourse('CS401');
  })
  .then(course => checkPrerequisites(currentStudent, course))
  .then(context => checkSeats(context))
  .then(context => registerStudent(context))
  .then(registrationResult => {
    console.log('Registration Successful:', registrationResult);
    return Promise.allSettled([
      sendEmail(),
      sendSMS(),
      writeAuditLog()
    ]);
  })
  .then(settledResults => {
    const serviceNames = ['Email', 'SMS', 'Audit'];
    const report = settledResults.map((res, i) => ({
      service: serviceNames[i],
      status: res.status
    }));
    console.dir(report, { depth: null });

    return Promise.any([
      fetchCoursePrimary('CS401'),
      fetchCourseSecondary('CS401')
    ]);
  })
  .then(fastestSuccessfulCourse => {
    console.log('Course Data Fetched Successfully From:', fastestSuccessfulCourse);
  })
  .catch(err => {
    console.error('Workflow Error Captured:', err.message);
  })
  .finally(() => {
    console.log('Finished.');
  });