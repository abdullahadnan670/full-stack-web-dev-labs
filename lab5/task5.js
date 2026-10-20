class Student {
  constructor(id, name, courses = []) {
    this.id = id;
    this.name = name;
    this.courses = courses;
  }
}

function calculateGrade(marks) {
  if (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    throw new RangeError(`Marks must be a valid number between 0 and 100. Received: ${marks}`);
  }
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 50) return 'C';
  return 'F';
}

function calculateAverage(courses = []) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return 0;
  }
  const total = courses.reduce((sum, c) => sum + c.marks, 0);
  return Number((total / courses.length).toFixed(2));
}

function calculateGPA(courses = []) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return 0.0;
  }
  const gradePoints = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
    'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'F': 0.0
  };
  const totalPoints = courses.reduce((sum, c) => {
    const letterGrade = calculateGrade(c.marks);
    return sum + gradePoints[letterGrade];
  }, 0);
  return Number((totalPoints / courses.length).toFixed(2));
}

function processTranscriptJSON(jsonString) {
  if (typeof jsonString !== 'string') {
    throw new TypeError('Input transcript data must be a string.');
  }

  let parsedData;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (err) {
    throw new Error(`Malformed JSON string provided: ${err.message}`);
  }

  if (!Array.isArray(parsedData)) {
    throw new TypeError('JSON data must contain an array of student objects.');
  }

  const seenIds = new Set();

  const processedStudents = parsedData.map((record, index) => {
    if (!record || typeof record !== 'object') {
      throw new TypeError(`Record at index ${index} is not an object.`);
    }

    const { id, name, courses } = record;

    if (id === undefined || id === null || id === '') {
      throw new Error(`Student record at index ${index} is missing an ID.`);
    }

    if (seenIds.has(id)) {
      throw new Error(`Duplicate student ID detected: ${id}`);
    }
    seenIds.add(id);

    if (!Array.isArray(courses) || courses.length === 0) {
      throw new TypeError(`Student ID ${id} must have a non-empty courses array.`);
    }

    courses.forEach((course, cIndex) => {
      if (!course || typeof course !== 'object') {
        throw new TypeError(`Invalid course object at index ${cIndex} for student ID ${id}`);
      }
      if (!course.code || typeof course.code !== 'string' || course.code.trim() === '') {
        throw new Error(`Missing course code for course at index ${cIndex} in student ID ${id}`);
      }
      if (typeof course.marks !== 'number' || !Number.isFinite(course.marks)) {
        throw new TypeError(`Marks for course ${course.code} in student ID ${id} must be a number.`);
      }
      if (course.marks < 0 || course.marks > 100) {
        throw new RangeError(`Marks for course ${course.code} in student ID ${id} out of bounds (0-100).`);
      }
    });

    const studentObj = new Student(id, name, courses);
    const average = calculateAverage(courses);
    const gpa = calculateGPA(courses);

    return {
      id: studentObj.id,
      name: studentObj.name,
      courses: studentObj.courses,
      average,
      gpa
    };
  });

  const reportObject = {
    processedCount: processedStudents.length,
    students: processedStudents
  };

  return {
    reportObject,
    reportJSON: JSON.stringify(reportObject, null, 2)
  };
}

const validJSON = `
[
  {
    "id": 101,
    "name": "Ali",
    "courses": [
      { "code": "CS301", "marks": 81 },
      { "code": "CS302", "marks": 74 }
    ]
  },
  {
    "id": 102,
    "name": "Sara",
    "courses": [
      { "code": "CS301", "marks": 92 },
      { "code": "CS302", "marks": 88 }
    ]
  }
]
`;

const malformedJSON = `[ { "id": 101, "name": "Ali", ]`;
const duplicateIdJSON = `
[
  { "id": 101, "name": "Ali", "courses": [{ "code": "CS1", "marks": 50 }] },
  { "id": 101, "name": "Duplicate", "courses": [{ "code": "CS2", "marks": 60 }] }
]
`;
const invalidMarksJSON = `
[
  { "id": 103, "name": "Usman", "courses": [{ "code": "CS101", "marks": 150 }] }
]
`;

function runTest(label, rawJSON) {
  console.log(`\n=== TEST: ${label} ===`);
  try {
    const result = processTranscriptJSON(rawJSON);
    console.dir(result.reportObject, { depth: null });
  } catch (error) {
    console.error(`${error.name}: ${error.message}`);
  } finally {
    console.log('Execution completed.');
  }
}

runTest('Valid JSON Data', validJSON);
runTest('Malformed JSON Structure', malformedJSON);
runTest('Duplicate Student ID', duplicateIdJSON);
runTest('Invalid Course Marks (>100)', invalidMarksJSON);