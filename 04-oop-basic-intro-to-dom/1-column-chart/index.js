export default class ColumnChart {
  constructor({
    data = [],
    label = "",
    value = "",
    link = "",
    formatHeading = "",
    chartHeight = 50,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = chartHeight;

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
          this.formatHeading ? this.formatHeading(this.value) : this.value
        }</div>
        <div data-element="body" class="column-chart__chart">
            ${columns.join("")}
        </div>
        </div>
    </div>
        `;
  }

  update(updateData) {
    const childs = this.element.getElementsByClassName("column-chart__chart")[0]
      .children;
    for (const child of childs) {
      child.remove();
    }
    const columns = this.generateColumns(updateData);
    this.element.getElementsByClassName("column-chart__chart")[0].innerHTML =
      columns.join("");
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
    return columns;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  initEventListner() {}

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
