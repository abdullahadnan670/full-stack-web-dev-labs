function fakeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const signal = options.signal;

    if (signal?.aborted) {
      return reject(new DOMException('The operation was aborted.', 'AbortError'));
    }

    const timer = setTimeout(() => {
      if (url.includes('/timeout')) return;
      if (url.includes('/network-fail')) {
        return reject(new TypeError('Failed to fetch (Network Error)'));
      }
      if (url.includes('/404')) {
        return resolve({ ok: false, status: 404, statusText: 'Not Found' });
      }
      if (url.includes('/500')) {
        return resolve({ ok: false, status: 500, statusText: 'Internal Server Error' });
      }
      if (url.includes('/invalid-json')) {
        return resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new SyntaxError('Unexpected token in JSON'))
        });
      }

      let data = [];
      if (url.includes('/users')) {
        data = [
          { id: 1, name: 'Ali', dept: 'CS' },
          { id: 2, name: 'Sara', dept: 'SE' },
          { id: 3, name: 'Usman', dept: 'CS' }
        ];
      } else if (url.includes('/courses')) {
        data = [
          { code: 'CS101', name: 'Intro to CS' },
          { code: 'SE201', name: 'Software Eng' }
        ];
      } else if (url.includes('/results')) {
        data = [
          { userId: 1, marks: 85 },
          { userId: 2, marks: 42 },
          { userId: 3, marks: 78 }
        ];
      }

      return resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data)
      });
    }, 100);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      });
    }
  });
}

async function getJSON(url, fetchImpl = fakeFetch, options = {}) {
  const response = await fetchImpl(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

async function fetchWithTimeout(url, milliseconds, fetchImpl = fakeFetch) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), milliseconds);

  try {
    return await getJSON(url, fetchImpl, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request Timeout: ${url} exceeded ${milliseconds}ms limit.`);
    }
    throw error;
  } finally {
    clearTimeout(timerId);
  }
}

async function loadDashboard() {
  try {
    const [users, courses, results] = await Promise.all([
      getJSON('https://api.campus.edu/users'),
      getJSON('https://api.campus.edu/courses'),
      getJSON('https://api.campus.edu/results')
    ]);

    const totalStudents = users.length;
    const totalCourses = courses.length;

    const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
    const overallAverageMarks = Number((totalMarks / results.length).toFixed(2));

    const failedStudentsCount = results.filter(r => r.marks < 50).length;

    const highestResult = results.reduce((max, curr) => curr.marks > max.marks ? curr : max, results[0]);
    const topUser = users.find(u => u.id === highestResult.userId);

    const deptStats = users.reduce((acc, user) => {
      const userResult = results.find(r => r.userId === user.id);
      if (!acc[user.dept]) {
        acc[user.dept] = { total: 0, sumMarks: 0 };
      }
      acc[user.dept].total += 1;
      if (userResult) acc[user.dept].sumMarks += userResult.marks;
      return acc;
    }, {});

    const departmentWiseStats = {};
    Object.keys(deptStats).forEach(dept => {
      departmentWiseStats[dept] = {
        studentCount: deptStats[dept].total,
        averageMarks: Number((deptStats[dept].sumMarks / deptStats[dept].total).toFixed(2))
      };
    });

    console.dir({
      totalStudents,
      totalCourses,
      overallAverageMarks,
      highestPerformingStudent: `${topUser.name} (${highestResult.marks} marks)`,
      failedStudentsCount,
      departmentWiseStats
    }, { depth: null });

  } catch (error) {
    console.error('Dashboard Load Error:', error.message);
  }
}

async function runTests() {
  await loadDashboard();

  try {
    await fetchWithTimeout('https://api.campus.edu/timeout', 50);
  } catch (err) {
    console.error('Caught Expected Fault:', err.message);
  }

  try {
    await getJSON('https://api.campus.edu/404');
  } catch (err) {
    console.error('Caught Expected Fault:', err.message);
  }

  try {
    await getJSON('https://api.campus.edu/invalid-json');
  } catch (err) {
    console.error('Caught Expected Fault:', err.message);
  }
}

runTests();