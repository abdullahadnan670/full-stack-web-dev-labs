function getGradeDetails(marks) {
  if (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0 || marks > 100) {
    return { grade: 'INVALID', status: 'INVALID', gradePoints: 0.0 };
  }
  if (marks >= 85) return { grade: 'A', status: 'Pass', gradePoints: 4.0 };
  if (marks >= 80) return { grade: 'A-', status: 'Pass', gradePoints: 3.7 };
  if (marks >= 75) return { grade: 'B+', status: 'Pass', gradePoints: 3.3 };
  if (marks >= 70) return { grade: 'B', status: 'Pass', gradePoints: 3.0 };
  if (marks >= 65) return { grade: 'B-', status: 'Pass', gradePoints: 2.7 };
  if (marks >= 60) return { grade: 'C+', status: 'Pass', gradePoints: 2.3 };
  if (marks >= 50) return { grade: 'C', status: 'Pass', gradePoints: 2.0 };
  return { grade: 'F', status: 'Fail', gradePoints: 0.0 };
}

function processResults(results = []) {
  return results.map(student => {
    const details = getGradeDetails(student.marks);
    return {
      ...student,
      grade: details.grade,
      status: details.status,
      gradePoints: details.gradePoints
    };
  });
}

function getRankedMeritList(processedResults = []) {
  return [...processedResults].sort((a, b) => {
    if (b.marks !== a.marks) {
      return b.marks - a.marks;
    }
    return a.name.localeCompare(b.name);
  });
}

function getDepartmentStats(processedResults = []) {
  const rawStats = processedResults.reduce((acc, student) => {
    const dept = student.department || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = {
        students: 0,
        totalMarks: 0,
        highest: student.marks,
        passed: 0
      };
    }

    acc[dept].students += 1;
    acc[dept].totalMarks += student.marks;
    if (student.marks > acc[dept].highest) {
      acc[dept].highest = student.marks;
    }
    if (student.status === 'Pass') {
      acc[dept].passed += 1;
    }

    return acc;
  }, {});

  const formattedStats = {};
  Object.keys(rawStats).forEach(dept => {
    const stat = rawStats[dept];
    formattedStats[dept] = {
      students: stat.students,
      average: Number((stat.totalMarks / stat.students).toFixed(2)),
      highest: stat.highest,
      passed: stat.passed
    };
  });

  return formattedStats;
}

function runAcademicQueries(processedResults = []) {
  const firstStudentAbove85 = processedResults.find(student => student.marks > 85);
  const indexOfFirstFailed = processedResults.findIndex(student => student.status === 'Fail');
  const hasFailedStudent = processedResults.some(student => student.status === 'Fail');
  const areAllMarksValid = processedResults.every(
    student => typeof student.marks === 'number' && student.marks >= 0 && student.marks <= 100
  );

  const totalMarks = processedResults.reduce((sum, s) => sum + s.marks, 0);
  const overallAverage = processedResults.length > 0 ? totalMarks / processedResults.length : 0;

  const aboveAverageStudents = processedResults.filter(student => student.marks > overallAverage);

  const ranked = getRankedMeritList(processedResults);
  const topThreeStudentNames = ranked.slice(0, 3).map(student => student.name);

  return {
    firstStudentAbove85: firstStudentAbove85 || null,
    indexOfFirstFailed,
    hasFailedStudent,
    areAllMarksValid,
    overallAverage: Number(overallAverage.toFixed(2)),
    aboveAverageStudents,
    topThreeStudentNames
  };
}

// Data execution
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

const processed = processResults(results);
const rankedMeritList = getRankedMeritList(processed);
const departmentStats = getDepartmentStats(processed);
const queries = runAcademicQueries(processed);

console.dir(processed, { depth: null });
console.dir(rankedMeritList, { depth: null });
console.dir(departmentStats, { depth: null });
console.dir(queries, { depth: null });