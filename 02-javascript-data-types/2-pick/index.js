/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  let pickObj = {};
  const props = Object.keys(obj);

  for (const prop of props) {
    for (let i = 0; i < fields.length; i++) {
      if (fields[i] === prop) {
        pickObj[fields[i]] = obj[prop];
      }
    }
  }
  return pickObj;
};
