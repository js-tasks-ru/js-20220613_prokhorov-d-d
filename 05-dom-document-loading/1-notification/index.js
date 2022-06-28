export default class NotificationMessage {
  static isExist = false;
  constructor(message, { duration = 0, type = "" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  createNotification() {
    return `
        <div class="notification ${this.type}" style="--value:${
      this.duration / 1000
    }s">
            <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message}
            </div>
        </div>
    `;
  }

  show(target) {
    if (target) target.insertAdjacentHTML("beforeend", this.element.outerHTML);
    document.body.append(this.element);
    NotificationMessage.isExist = true;

    const timerId = setTimeout(() => {
      this.destroy();
      NotificationMessage.isExist = false;
    }, this.duration);

  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.createNotification();
    this.element = element.firstElementChild;
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
