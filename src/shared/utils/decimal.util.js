export const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(value);
};

export const roundMoney = (value) => Math.round(value * 100) / 100;
