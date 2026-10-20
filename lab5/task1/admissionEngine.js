const SUPPORTED_PROGRAMS = ['BSCS', 'BSSE', 'BSAI'];

function parseScore(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === '') return null;
  
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return null;
}

export function processApplicant(applicant) {
  if (!applicant || typeof applicant !== 'object') {
    return { ...applicant, status: 'INVALID DATA', isValid: false, merit: null, errors: ['Invalid applicant object'] };
  }

  const errors = [];

  const age = parseScore(applicant.age);
  const matricMarks = parseScore(applicant.matricMarks);
  const intermediateMarks = parseScore(applicant.intermediateMarks);
  const entryTest = parseScore(applicant.entryTest);
  const feePaid = parseBoolean(applicant.feePaid);

  if (age === null || age < 17 || age > 30) {
    errors.push('Age must be a valid number between 17 and 30');
  }

  if (matricMarks === null || matricMarks < 0 || matricMarks > 100) {
    errors.push('Matric marks must be between 0 and 100');
  }

  if (intermediateMarks === null || intermediateMarks < 0 || intermediateMarks > 100) {
    errors.push('Intermediate marks must be between 0 and 100');
  }

  if (entryTest === null || entryTest < 0 || entryTest > 100) {
    errors.push('Entry test marks must be between 0 and 100');
  }

  if (!applicant.program || !SUPPORTED_PROGRAMS.includes(applicant.program)) {
    errors.push(`Program must be one of: ${SUPPORTED_PROGRAMS.join(', ')}`);
  }

  if (feePaid === null) {
    errors.push('Fee paid status must be true or false');
  }

  if (errors.length > 0) {
    return {
      ...applicant,
      isValid: false,
      merit: null,
      status: 'INVALID DATA',
      errors
    };
  }

  const merit = Number(((matricMarks * 0.20) + (intermediateMarks * 0.30) + (entryTest * 0.50)).toFixed(2));
  const isEligible = merit >= 70 && entryTest >= 60 && intermediateMarks >= 60;

  let status = 'REJECTED';
  if (isEligible) {
    status = feePaid ? 'SELECTED' : 'WAITING';
  }

  return {
    id: applicant.id,
    name: applicant.name,
    program: applicant.program,
    sanitizedData: { age, matricMarks, intermediateMarks, entryTest, feePaid },
    merit,
    isEligible,
    isValid: true,
    status,
    errors: []
  };
}

export function generateSummary(processedApplicants) {
  const validApplicants = processedApplicants.filter(a => a.isValid);
  const invalidApplicants = processedApplicants.filter(a => !a.isValid);

  let highestMeritApplicant = null;
  let lowestMeritApplicant = null;
  let totalMerit = 0;

  if (validApplicants.length > 0) {
    highestMeritApplicant = validApplicants.reduce((max, current) => 
      current.merit > max.merit ? current : max
    , validApplicants[0]);

    lowestMeritApplicant = validApplicants.reduce((min, current) => 
      current.merit < min.merit ? current : min
    , validApplicants[0]);

    totalMerit = validApplicants.reduce((sum, current) => sum + current.merit, 0);
  }

  const programCounts = processedApplicants.reduce((acc, applicant) => {
    const prog = applicant.program || 'Unknown/Invalid';
    acc[prog] = (acc[prog] || 0) + 1;
    return acc;
  }, {});

  return {
    totalApplicants: processedApplicants.length,
    validCount: validApplicants.length,
    invalidCount: invalidApplicants.length,
    highestMeritApplicant: highestMeritApplicant 
      ? { id: highestMeritApplicant.id, name: highestMeritApplicant.name, merit: highestMeritApplicant.merit }
      : null,
    lowestMeritValidApplicant: lowestMeritApplicant 
      ? { id: lowestMeritApplicant.id, name: lowestMeritApplicant.name, merit: lowestMeritApplicant.merit }
      : null,
    averageMerit: validApplicants.length > 0 
      ? Number((totalMerit / validApplicants.length).toFixed(2))
      : 0,
    programCounts
  };
}

export function processAdmissions(applicants = []) {
  const processed = applicants.map(processApplicant);
  const summary = generateSummary(processed);

  return {
    applicants: processed,
    summary
  };
}