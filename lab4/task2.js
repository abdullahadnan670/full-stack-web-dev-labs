function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function getNextPrime(givenPrime) {
  let candidate = givenPrime + 1;
  while (!isPrime(candidate)) {
    candidate++;
  }
  return candidate;
}

let inputPrime = 11;
let nextPrime = getNextPrime(inputPrime);

console.log(`Given Prime: ${inputPrime}`);
console.log(`Prime after ${inputPrime}: ${nextPrime}`);