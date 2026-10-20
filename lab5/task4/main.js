class Person {
  constructor(name, email) {
    this.name = name ?? 'Unknown';
    this.email = email ?? 'N/A';
  }

  introduce() {
    return `Hi, I am ${this.name} (${this.email}).`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    this.rollNo = rollNo ?? 'N/A';
    this.marks = typeof marks === 'number' && Number.isFinite(marks) ? marks : 0;
  }

  introduce() {
    return `${super.introduce()} I am a student with Roll No: ${this.rollNo}.`;
  }

  getResult() {
    return this.marks >= 50 ? 'Pass' : 'Fail';
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId ?? 'N/A';
    this.department = department ?? 'General';
  }

  introduce() {
    return `${super.introduce()} I am a faculty member in ${this.department} (ID: ${this.employeeId}).`;
  }
}

// ---------------- POLYMORPHISM DEMONSTRATION ----------------

const users = [
  new Student('Sara Khan', 'sara@univ.edu', 'BSCS-01', 88),
  new FacultyMember('Dr. Tariq', 'tariq@univ.edu', 'EMP-501', 'Computer Science'),
  new Student('Usman Ali', 'usman@univ.edu', 'BSSE-12', 45),
  new FacultyMember('Prof. Ayesha', 'ayesha@univ.edu', 'EMP-204', 'Software Engineering')
];

console.log('--- USER INTRODUCTIONS (POLYMORPHISM) ---');
users.forEach(user => console.log(user.introduce()));

// ---------------- CALL(), BIND(), AND DETACHED METHODS ----------------

const guest = {
  name: 'Dr. Ahmed',
  email: 'ahmed@example.com'
};

const sampleStudent = users[0];

console.log('\n--- CALL() DEMO ---');
const guestIntro = Person.prototype.introduce.call(guest);
console.log('Guest Intro via call():', guestIntro);

console.log('\n--- DETACHED METHOD DEMO ---');
const fn = sampleStudent.introduce;
try {
  console.log('Detached fn():', fn());
} catch (error) {
  console.log('Detached fn() Error:', error.message);
}

console.log('\n--- BIND() DEMO ---');
const boundFn = sampleStudent.introduce.bind(sampleStudent);
console.log('Bound fn():', boundFn());

// ---------------- INSTANCEOF DEMONSTRATION ----------------

console.log('\n--- INSTANCEOF CHECKS ---');
console.log('sampleStudent instanceof Student :', sampleStudent instanceof Student);
console.log('sampleStudent instanceof Person  :', sampleStudent instanceof Person);
console.log('sampleStudent instanceof FacultyMember :', sampleStudent instanceof FacultyMember);