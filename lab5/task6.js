const database = {
  students: {
    101: { id: 101, name: 'Ali', completedPrereqs: ['CS101', 'CS201'], registeredCourses: [] },
    102: { id: 102, name: 'Sara', completedPrereqs: ['CS101'], registeredCourses: [] },
    103: { id: 103, name: 'Usman', completedPrereqs: ['CS101', 'CS201'], registeredCourses: ['CS401'] }
  },
  courses: {
    'CS401': { code: 'CS401', requiredPrereq: 'CS201', availableSeats: 1 }
  }
};

function loadStudent(studentId, callback) {
  setTimeout(() => {
    const student = database.students[studentId];
    if (!student) {
      return callback(new Error(`Student ID ${studentId} does not exist.`));
    }
    return callback(null, student);
  }, 100);
}

function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = database.courses[courseCode];
    if (!course) {
      return callback(new Error(`Course ${courseCode} does not exist.`));
    }
    if (student.registeredCourses.includes(courseCode)) {
      return callback(new Error(`Student ${student.id} is already registered in ${courseCode}.`));
    }
    if (!student.completedPrereqs.includes(course.requiredPrereq)) {
      return callback(new Error(`Student ${student.id} has not completed prerequisite ${course.requiredPrereq}.`));
    }
    return callback(null, { student, course });
  }, 100);
}

function checkAvailableSeats(context, callback) {
  setTimeout(() => {
    const { course } = context;
    if (course.availableSeats <= 0) {
      return callback(new Error(`Course ${course.code} has no available seats.`));
    }
    return callback(null, context);
  }, 100);
}

function registerCourse(context, callback) {
  setTimeout(() => {
    const { student, course } = context;
    course.availableSeats -= 1;
    student.registeredCourses.push(course.code);
    return callback(null, {
      studentId: student.id,
      course: course.code,
      status: 'REGISTERED'
    });
  }, 100);
}

function registerStudentWorkflow(studentId, courseCode, finalCallback) {
  loadStudent(studentId, (err1, student) => {
    if (err1) return finalCallback(err1);

    checkPrerequisites(student, courseCode, (err2, context) => {
      if (err2) return finalCallback(err2);

      checkAvailableSeats(context, (err3, validContext) => {
        if (err3) return finalCallback(err3);

        registerCourse(validContext, (err4, result) => {
          if (err4) return finalCallback(err4);

          return finalCallback(null, result);
        });
      });
    });
  });
}

registerStudentWorkflow(101, 'CS401', (err, result) => {
  if (err) console.error('Failed:', err.message);
  else console.log('Success:', result);

  registerStudentWorkflow(102, 'CS401', (err2, result2) => {
    if (err2) console.error('Failed:', err2.message);
    else console.log('Success:', result2);

    registerStudentWorkflow(103, 'CS401', (err3, result3) => {
      if (err3) console.error('Failed:', err3.message);
      else console.log('Success:', result3);
    });
  });
});