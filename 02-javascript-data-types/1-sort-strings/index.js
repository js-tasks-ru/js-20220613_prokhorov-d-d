/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  let collator = new Intl.Collator("ru-RU", {
    sensitivity: "variant",
    caseFirst: "upper",
  });

  arr =
    param === "asc"
      ? arr.slice().sort(collator.compare)
      : param === "desc"
      ? arr.slice().sort(collator.compare).reverse()
      : undefined;

  return arr;
}
