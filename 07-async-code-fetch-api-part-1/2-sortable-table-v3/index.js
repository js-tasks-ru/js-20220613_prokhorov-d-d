import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";
export default class SortableTable {
  element;
  subElements = {};

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    console.log(bottom);
    console.log("clientHeight", document.documentElement.clientHeight);
    const { id, order } = this.sorted;

    if (
      bottom < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally
    ) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = (order) => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order); // undefined

      this.sorted = {
        id,
        order: newOrder,
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        return this.sortOnClient(id, newOrder);
      } else {
        return this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      url = "",
      isSortLocally = false,
      step = 20,
      start = 1,
      end = start + step,
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.step = 30;
    this.start = start;
    this.end = end;

    this.render();
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTable(this.data);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.sortData(id, order);

    this.initEventListeners();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  addRows(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  getTableRows(data) {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
      )
      .join("");
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);
    window.addEventListener("scroll", this.onWindowScroll);
  }

  sortData(id, order) {
    if (this.isSortLocally) {
      return this.sortOnClient(id, order);
    } else {
      return this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[id] - b[id]);
        case "string":
          return direction * a[id].localeCompare(b[id], "ru");
        case "custom":
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    return await fetchJson(this.url);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.renderRows(data);
  }

  renderRows(data) {
    if (data.length) {
      this.element.classList.remove("sortable-table_empty");
      this.addRows(data);
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }

  update(data) {
    const rows = document.createElement("div");

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    document.removeEventListener("scroll", this.onWindowScroll);
  }
}
