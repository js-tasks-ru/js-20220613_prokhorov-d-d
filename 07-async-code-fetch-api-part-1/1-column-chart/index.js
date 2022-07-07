import fetchJson from "./utils/fetch-json.js";

const ENDPOINT_URL = "https://course-js.javascript.ru/";
export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (data) => data,
    url = "",
    range: { from = new Date(), to = new Date() } = {},
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.formatHeading = formatHeading;
    this.link = link;
    this.url = new URL(url, ENDPOINT_URL);
    this.from = from;
    this.to = to;

    this.render();
    this.update(this.from, this.to);
  }

  getHeaderValue(data) {
    return this.formatHeading(
      Object.values(data).reduce((accum, item) => accum + item, 0)
    );
  }

  getTemplate() {
    const columns = this.generateColumns(this.data);
    return `
        <div class="column-chart ${
          !this.data.length ? "column-chart_loading" : ""
        }" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
        Total ${this.label}
        ${
          this.link.length
            ? `<a href=${this.link} class="column-chart__link">View all</a>`
            : ""
        }
        </div>
        <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${
          this.value
        }</div>
        <div data-element="body" class="column-chart__chart">
            ${columns}
        </div>
        </div>
    </div>
        `;
  }

  async update(from, to) {
    this.element.classList.add("column-chart_loading");

    const result = await this.loadData(from, to);
    this.data = this.sortData(result, from, to);

    if (this.data && Object.values(this.data).length) {
      this.subElements.header.innerHTML = this.getHeaderValue(this.data);
      this.subElements.body.innerHTML = this.generateColumns(this.data);

      this.element.classList.remove("column-chart_loading");
    }

    return result;
  }

  async loadData(from, to) {
    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());

    return await fetchJson(this.url);
  }

  sortData(data, from, to) {
    from = from.toISOString().split("T")[0];
    to = to.toISOString().split("T")[0];

    return Object.entries(data)
      .filter((item) => item[0] >= from && item[0] <= to)
      .map((item) => item[1]);
  }

  generateColumns(data) {
    const maxValue = Math.max(...data);
    const columns = data.map((item) => {
      return `
          <div style="--value: ${
            // scale depends on charHeight
            Math.floor((item / maxValue) * this.chartHeight)
          }" data-tooltip="${((item / maxValue) * 100).toFixed(0)}%"></div>
      `;
    });
    return columns.join("");
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  }

  initEventListner() {}

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
