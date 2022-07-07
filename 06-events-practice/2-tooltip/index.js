class Tooltip {
  static instance;
  element;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize() {
    this.initEventListener();
  }

  initEventListener() {
    document.addEventListener("pointerover", this.pointerOver);
    document.addEventListener("pointerout", this.pointerOut);
  }

  pointerOver = (event) => {
    const target = event.target.closest("[data-tooltip]");

    if (!target) return;

    this.content = target.dataset.tooltip;

    this.render();
    target.addEventListener("pointermove", this.pointerMove);
  };

  pointerMove = (event) => {
    this.showTooltip(event);
  };

  pointerOut = () => {
    if (this.element) {
      document.removeEventListener("pointermove", this.pointerMove);
      this.remove();
    }
  };

  showTooltip(event) {
    const offset = 5;

    this.element.style.left = event.pageX + offset + "px";
    this.element.style.top = event.pageY + offset + "px";
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = `<div class="tooltip">${this.content}</div>`;

    this.element = element.firstElementChild;
    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;

    document.removeEventListener("pointerover", this.pointerOver);
    document.removeEventListener("pointerout", this.pointerOut);
    document.removeEventListener("pointermove", this.pointerMove);
  }
}

export default Tooltip;
