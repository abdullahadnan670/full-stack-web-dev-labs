function roundMe(...args) {
  if (args.length === 0) return 0;
  if (args.length === 1) return Math.round(args[0]);
  return args.map(arg => Math.round(arg));
}

console.log(roundMe());
console.log(roundMe(4.7));
console.log(roundMe(4.7, 4.4));