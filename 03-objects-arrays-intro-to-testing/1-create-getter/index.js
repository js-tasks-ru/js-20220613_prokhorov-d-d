/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathsArr = path.split(".");
  return function (obj) {
    if (Object.keys(obj).length) {
      let value = obj;
      for (let i = 0; i < pathsArr.length; i++) {
        value = value[pathsArr[i]];
      }
      return value;
    }
    return obj[pathsArr[0]];
  };
}
