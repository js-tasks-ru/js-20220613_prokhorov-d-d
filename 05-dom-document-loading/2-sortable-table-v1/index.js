export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    //складываем название заголовков => по этим ключам достаем свойства
    this.headers = this.headerConfig.map((item) => {
      if (item.template) {
        return item;
      } else {
        return item.id;
      }
    });

    this.render();
  }

  getTemplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">  
            ${this.getHeader(this.headerConfig, this.orderValue)}
        </div>
        <div data-element="body" class="sortable-table__body">
            ${this.getElements(this.data)}
        </div>
      </div>
  </div>
    `;
  }

  getHeader(headerConfig, orderValue = "") {
    const headers = headerConfig.map(
      ({
        id = "",
        title = "",
        sortable = false,
        template = null,
        sortType = "number",
      }) => {
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${orderValue}">
            <span>${title}</span>
          </div>        
        `;
      }
    );

    return headers.join("");
  }

  getElements(data) {
    //Чтобы генерить values, то есть значения колонок для каждого item
    const values = data.map((item) => {
      let arr = [];

      for (const header of this.headers) {
        if (typeof header === "object") continue;
        arr.push(`<div class="sortable-table__cell">${item[header]}</div>`);
      }

      return arr.join("");
    });

    const products = data.map(
      ({
        id = "",
        title = "",
        description = "",
        quantity = 0,
        subcategory: {
          id: subId = "",
          title: subTitle = "",
          count: subCount = 0,
          weight: subWeight = 0,
          category: {
            id: categoryId = "",
            title: categoryTitle = "",
            count: categoryCount = 0,
            weight: categoryWeigth = 0,
          } = {},
        } = {},
        status = 0,
        images = [],
        price = 0,
        discount = 0,
        sales = 0,
      }) => {
        let arr = [];
        for (const item of values) {
          arr.push(`
          <a href="/products/${id}" class="sortable-table__row">


            ${this.headers[0].template ? this.headers[0].template(images) : ""}

            ${item}          
        </a>
        `);
        }
        return arr.join("");
      }
    );

    return products.join("");
  }

  sortValues(arr, fieldValue = "", param = "", sortType = "number") {
    if (!param) return;
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[param];

    if (sortType === "string") {
      const collator = new Intl.Collator(["ru", "en"], {
        sensitivity: "variant",
        caseFirst: "upper",
      });
      return [...arr].sort(
        (obj1, obj2) =>
          direction * collator.compare(obj1[fieldValue], obj2[fieldValue])
      );
    }
    return [...arr].sort(
      (obj1, obj2) => direction * (obj1[fieldValue] - obj2[fieldValue])
    );
  }

  sort(fieldValue, orderValue) {
    this.orderValue = orderValue;
    let sortable = false;
    let sortType = "number";

    //определиться с sortable и sortType
    for (const header of this.headerConfig) {
      if (fieldValue === header.id) {
        sortable = header.sortable;
        sortType = header.sortType;
      }
    }

    if (!sortable) return;

    if (sortType === "string") {
      this.data = this.sortValues(this.data, fieldValue, orderValue, sortType);
    }
    this.data = this.sortValues(this.data, fieldValue, orderValue);

    this.update(this.data);
  }

  update(updateData) {
    const columns = this.getElements(updateData);
    this.subElements.body.innerHTML = columns;
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
