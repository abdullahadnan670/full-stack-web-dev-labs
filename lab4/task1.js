var fullName = "Alex Mercer";
var age = 28;
var isStudent = false;
var email = "alex.mercer@example.com";

var biography = {
  name: fullName,
  age: age,
  isStudent: isStudent,
  email: email,
  address: {
    street: "123 Innovation Way",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105"
  },
  degreeProgram: {
    degree: "Bachelor of Science",
    major: "Computer Science",
    university: "State University",
    graduationYear: 2020
  }
};

console.log("Name: " + biography.name);
console.log("Age: " + biography.age);
console.log("Student: " + biography.isStudent);
console.log("Email: " + biography.email);
console.log("Address: " + biography.address.street + ", " + biography.address.city + ", " + biography.address.state + " " + biography.address.zipCode);
console.log("Degree Program: " + biography.degreeProgram.degree + " in " + biography.degreeProgram.major + " from " + biography.degreeProgram.university + " (" + biography.degreeProgram.graduationYear + ")");