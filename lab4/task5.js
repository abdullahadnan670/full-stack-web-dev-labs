function abs(...args) {
  if (args.length === 0) return 0;
  if (args.length === 1) return Math.abs(args[0]);
  return args.map(arg => Math.abs(arg));
}

function ceil(...args) {
  if (args.length === 0) return 0;
  if (args.length === 1) return Math.ceil(args[0]);
  return args.map(arg => Math.ceil(arg));
}

function floor(...args) {
  if (args.length === 0) return 0;
  if (args.length === 1) return Math.floor(args[0]);
  return args.map(arg => Math.floor(arg));
}

console.log(abs(-5));
console.log(abs(-5, 3.2, -10));
console.log(ceil(4.2));
console.log(ceil(4.2, 7.1));
console.log(floor(4.7));
console.log(floor(4.7, 9.9));