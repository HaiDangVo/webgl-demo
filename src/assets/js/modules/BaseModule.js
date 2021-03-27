import random from "../libs/RandomString"
import Publisher from "../libs/Publisher"

export default class BaseModule extends Publisher {
  constructor() {
    super()
    const [el, name] = arguments
    this.id = random()
    this.name = name
    this.el = el
    this.el.modules = this.el.modules || {}
    this.el.modules[this.name] = this.id
    if (this.register) {
      this.register()
      this.register = undefined
    }
  }
}
