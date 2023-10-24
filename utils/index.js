export const getRandomNumber = () => {
  const range1 = Math.floor(Math.random() * (1017 - 1 + 1)) + 1; // Random number between 1 and 1000
  const range2 = Math.floor(Math.random() * (10292 - 10001 + 1)) + 10000; // Random number between 10000 and 10227

  const isRange1 = Math.random() < 0.9;

  return isRange1 ? range1 : range2;
};

export const transformInput = (input) => {
  const lowercased = input.toLowerCase();
  const kebabCased = lowercased.replace(/[^a-z0-9]+/g, '-');
  return kebabCased.replace(/^-+|-+$/g, '');
};
