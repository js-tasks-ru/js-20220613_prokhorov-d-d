export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  
  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;

    this.render();
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

  update(updateData) {
    const columns = this.generateColumns(updateData);
    this.subElements.body.innerHTML = columns;
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
