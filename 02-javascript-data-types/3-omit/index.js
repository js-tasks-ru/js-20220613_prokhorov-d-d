/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let pickObj = JSON.parse(JSON.stringify(obj));
  const props = Object.keys(pickObj);

  for (const prop of props) {
    for (let i = 0; i < fields.length; i++) {
      if (prop === fields[i]) {
        delete pickObj[prop];
      }
    }
  }
  return pickObj;
};
