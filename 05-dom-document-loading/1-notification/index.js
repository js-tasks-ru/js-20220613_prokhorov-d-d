export default class NotificationMessage {
  static prevNotification = null;
  timerId = null;
  constructor(message = "", { duration = 0, type = "" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();

    if (NotificationMessage.prevNotification) {
      NotificationMessage.prevNotification.remove();
    }
    NotificationMessage.prevNotification = this;
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

    this.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.createNotification();
    this.element = element.firstElementChild;
  }

  remove() {
    if (this.element) {
      NotificationMessage.prevNotification = null;
      // чистим таймер, иначе prevNotification после отработки setTimeout не будет удаляться, а будет дублироваться, т.к. prevNotification === this
      clearTimeout(this.timerId);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
