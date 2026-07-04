export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const hasAnyStock = (stock = {}) => bloodGroups.some((group) => Number(stock[group]) > 0);

export const getDemoStock = (seed = '') => {
  const base = Array.from(String(seed)).reduce((total, char) => total + char.charCodeAt(0), 0);

  return bloodGroups.reduce((stock, group, index) => {
    const value = ((base + index * 7) % 34) + 6;
    stock[group] = value;
    return stock;
  }, {});
};
