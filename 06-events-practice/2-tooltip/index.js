class Tooltip {
  constructor() {
    this.element = null;
    this.content = null;
  }

  initialize() {
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerOver = this.pointerOver.bind(this);
    this.pointerOut = this.pointerOut.bind(this);

    this.initEventListener();
  }

  initEventListener() {
    document.addEventListener("pointerover", this.pointerOver);
    document.addEventListener("pointerout", this.pointerOut);
  }

  pointerOver(event) {
    let target = event.target.closest("[data-tooltip]");

    if (!target) return;

    this.content = target.dataset.tooltip;

    this.render();
    target.addEventListener("pointermove", this.pointerMove);
  }

  pointerMove(event) {
    this.showTooltip(event);
  }

  pointerOut() {
    if (this.element) {
      document.removeEventListener("pointermove", this.pointerMove);
      this.remove();
    }
  }

  showTooltip(event) {
    if (
      this.element &&
      this.element.innerHTML === event.target.dataset.tooltip
    ) {
      this.element.style.left = event.pageX + 5 + "px";
      this.element.style.top = event.pageY + 5 + "px";
    } else {
      this.element.style.left = event.pageX + 5 + "px";
      this.element.style.top = event.pageY + 5 + "px";
    }
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
  }
}

export default Tooltip;
