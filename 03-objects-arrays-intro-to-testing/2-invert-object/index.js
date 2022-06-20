/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (Object.keys(obj).length) {
    const reverseArr = Object.entries(obj).map((item) => item.reverse());
    return Object.fromEntries(reverseArr);
  }
}
