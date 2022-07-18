import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  };

  constructor(productId) {
    this.productId = productId;
  }

  getForm() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
              <fieldset>
                  <label class="form-label">Название товара</label>
                  <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
              </fieldset>
          </div>
          <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea id="description" required="" class="form-control" name="description" data-element="productDescription"
                  placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer">
                  <ul class="sortable-list">
                      ${this.createImagesList()}
                  </ul>
              </div>
              <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              ${this.createCategoriesSelect()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                  <label class="form-label">Цена ($)</label>
                  <input id="price" required="" type="number" name="price" class="form-control" placeholder="${
                    this.defaultFormData.price
                  }">
              </fieldset>
              <fieldset>
                  <label class="form-label">Скидка ($)</label>
                  <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${
                    this.defaultFormData.discount
                  }">
              </fieldset>
          </div>
          <div class="form-group form-group__part-half">
              <label class="form-label">Количество</label>
              <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${
                this.defaultFormData.quantity
              }">
          </div>
          <div class="form-group form-group__part-half">
              <label class="form-label">Статус</label>
              <select class="form-control" name="status">
                  <option value="1">Активен</option>
                  <option value="0">Неактивен</option>
              </select>
          </div>
          <div class="form-buttons">
              <button type="submit" name="save" class="button-primary-outline">
                  ${this.productId ? "Сохранить" : "Добавить"} товар
              </button>
          </div>
      </form>
    </div>
    `;
  }

  async render() {
    const categoriesDataPromise = this.loadCategoriesData();

    const productDataPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve(this.defaultFormData);

    // parallell requests
    const [categoriesData, productResponse] = await Promise.all([
      categoriesDataPromise,
      productDataPromise,
    ]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;

    this.renderForm();

    if (this.formData) {
      this.initEventListeners();
    }

    return this.element;
  }

  renderForm() {
    const element = document.createElement("div");

    element.innerHTML = this.formData
      ? this.getForm()
      : this.getEmptyTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  async loadProductData(productId) {
    let proudctURI = new URL("/api/rest/products", BACKEND_URL);
    proudctURI.searchParams.set("id", productId);

    return fetchJson(proudctURI);
  }

  async loadCategoriesData() {
    let categoriesURI = new URL("/api/rest/categories", BACKEND_URL);
    categoriesURI.searchParams.set("_sort", "weight");
    categoriesURI.searchParams.set("_refs", "subcategory");

    return fetchJson(categoriesURI);
  }

  getPhotoRows(productData) {
    return productData[0].images
      .map((item) => {
        return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
            <span>${item.source}</span>
        </span>
        <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
      `;
      })
      .join("");
  }

  createCategoriesSelect() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(
          new Option(`${category.title} > ${child.title}`, child.id)
        );
      }
    }

    return select.outerHTML;
  }

  createImagesList() {
    return this.formData.images
      .map((item) => {
        return this.getImageItem(item.url, item.source).outerHTML;
      })
      .join("");
  }

  getImageItem(url, name) {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(
            name
          )}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  onSubmit = (event) => {
    event.preventDefault();

    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.addEventListener("change", async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append("image", file);

        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const response = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: "",
        });

        imageListContainer.append(
          this.getImageItem(response.data.link, file.name)
        );

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    //calling the click() method on an <input> element of type "file" opens the file picker
    fileInput.click();
  };

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error("something went wrong", error);
    }
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ["images"];
    const formatToNumber = ["price", "quantity", "discount", "status"];
    const fields = Object.keys(this.defaultFormData).filter(
      (item) => !excludedFields.includes(item)
    );

    const getValue = (field) =>
      productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt,
      });
    }

    return values;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ["images"];
    const fields = Object.keys(this.defaultFormData).filter(
      (item) => !excludedFields.includes(item)
    );

    fields.forEach((item) => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent("product-updated", { detail: id }) // new CustomEvent('click')
      : new CustomEvent("product-saved");

    this.element.dispatchEvent(event);
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener("submit", this.onSubmit);
    uploadImage.addEventListener("click", this.uploadImage);

    imageListContainer.addEventListener("click", (event) => {
      if ("deleteHandle" in event.target.dataset) {
        event.target.closest("li").remove();
      }
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
