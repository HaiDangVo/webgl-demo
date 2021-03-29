import BaseModule from "./BaseModule"
export default class HelloModule extends BaseModule {
  register() {
    this.el.innerText = 'v0.0.1'
  }
}
