/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(str, size) {
  if (size !== undefined) {
    const noRepeatStr = str
      .split("")
      .filter((item, index, arr) => item !== arr[index - 1]);

    let counter = {};
    for (const char of str) {
      counter[char] = counter.hasOwnProperty(char) ? (counter[char] += 1) : 1;
    }

    const result = noRepeatStr.map((item) => {
      if (counter[item] > size) {
        return item.repeat(size);
      }
      return item;
    });

    return result.join("");
  } else {
    return str;
  }
}