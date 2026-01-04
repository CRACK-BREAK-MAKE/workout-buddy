// Test file with ONLY formatting issues (no lint errors)

const badlyFormatted = 'too many spaces';
console.log(badlyFormatted);

function badFormat(x: number, y: number) {
  return x + y;
} // Bad formatting only

export const okFunction = () => {
  const result = 123;
  return result;
};

export default badFormat;
