import { processAdmissions } from './admissionEngine.js';

const testApplicants = [
  {
    id: 'A101',
    name: 'Sara Khan',
    age: '19',
    matricMarks: '91',
    intermediateMarks: '87',
    entryTest: '78',
    program: 'BSCS',
    feePaid: 'true'
  },
  {
    id: 'A102',
    name: 'Ahmed Ali',
    age: 'twenty',
    matricMarks: '88',
    intermediateMarks: '',
    entryTest: '72',
    program: 'BSSE',
    feePaid: 'false'
  },
  {
    id: 'A103',
    name: 'Hassan',
    age: '18',
    matricMarks: '76',
    intermediateMarks: '83',
    entryTest: '91',
    program: 'BSAI',
    feePaid: 'false'
  },
  {
    id: 'A104',
    name: 'Boundary Pass',
    age: '17',
    matricMarks: '100',
    intermediateMarks: '60',
    entryTest: '60',
    program: 'BSCS',
    feePaid: 'true'
  },
  {
    id: 'A105',
    name: 'Boundary Fail Entry',
    age: '30',
    matricMarks: '95',
    intermediateMarks: '90',
    entryTest: '59',
    program: 'BSSE',
    feePaid: 'true'
  },
  {
    id: 'A106',
    name: 'Out of Bounds Marks',
    age: '22',
    matricMarks: '105',
    intermediateMarks: '80',
    entryTest: '70',
    program: 'MBA',
    feePaid: 'true'
  }
];

const result = processAdmissions(testApplicants);

console.dir(result.applicants, { depth: null });
console.dir(result.summary, { depth: null });