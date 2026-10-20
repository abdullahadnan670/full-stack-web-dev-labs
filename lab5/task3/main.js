function updateStudentProfile(originalStudent, patch = {}, ...tags) {
  if (!originalStudent || typeof originalStudent !== 'object') {
    return null;
  }

  // Array destructuring on rest parameters
  const [primaryTag = 'LOG', secondaryTag = 'PROFILE_UPDATE'] = tags;

  // Object destructuring with renaming, nested destructuring, defaults, and object rest
  const {
    name: originalName,
    address: { city: originalCity, sector: originalSector } = {},
    contact: origContact = {},
    ...studentRest
  } = originalStudent;

  const {
    address: updateAddress,
    contact: updateContact,
    ...updateRest
  } = patch;

  // Optional chaining and nullish coalescing (preserves 0, false, '')
  const marks = updateRest.marks ?? studentRest.marks;
  const scholarship = updateRest.scholarship ?? studentRest.scholarship;

  // Safe nested merging using spread operator
  const address = {
    city: originalCity,
    sector: originalSector,
    ...(updateAddress?.city !== undefined && { city: updateAddress.city }),
    ...(updateAddress?.sector !== undefined && { sector: updateAddress.sector })
  };

  const contact = {
    ...origContact,
    ...(updateContact ?? {})
  };

  // Property shorthand (address, contact) and object spread
  const updatedStudent = {
    ...studentRest,
    ...updateRest,
    marks,
    scholarship,
    address,
    contact
  };

  return updatedStudent;
}

// ---------------- TEST DATA ----------------

const student = {
  id: 101,
  name: 'Ali',
  marks: 0,
  scholarship: false,
  address: {
    city: 'Islamabad',
    sector: 'F-10'
  },
  contact: {
    email: 'ali@university.edu'
  }
};

const update = {
  name: 'Ali Khan',
  address: {
    city: 'Rawalpindi'
  },
  contact: {
    phone: '03001234567'
  }
};

// Execution
const updatedStudent = updateStudentProfile(student, update, 'AUDIT', 'UPDATE_SUCCESS');

console.log('--- ORIGINAL STUDENT ---');
console.dir(student, { depth: null });

console.log('\n--- UPDATED STUDENT ---');
console.dir(updatedStudent, { depth: null });

// ---------------- REFERENCE CHALLENGE PROOF ----------------

const isStudentEqual = student === updatedStudent;
const isAddressEqual = student.address === updatedStudent.address;
const isContactEqual = student.contact === updatedStudent.contact;

console.log('\n--- REFERENCE COMPARISONS ---');
console.log(`Original Student === Updated Student : ${isStudentEqual}`);
console.log(`Original Address === Updated Address : ${isAddressEqual}`);
console.log(`Original Contact === Updated Contact : ${isContactEqual}`);