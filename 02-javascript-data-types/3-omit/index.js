/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let pickObj = JSON.parse(JSON.stringify(obj));

  for (let key in pickObj) {
    for (let i = 0; i < fields.length; i++) {
      if (key === fields[i]) {
        delete pickObj[key];
      }
    }
  }
  return pickObj;
};
