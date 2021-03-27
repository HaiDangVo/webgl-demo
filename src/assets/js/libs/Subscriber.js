import random from "./RandomString"
import refState from "./ModuleState"

export default class Subscriber {
  constructor(name, action, refName) {
    this.name = name
    this.action = action
    this.id = random()
    this.refState = refState(refName)
    this.refState.onChange(value => this.action && this.action(value, this.publisher))
  }

  invoke(data, publisher) {
    if (!this.publisher) {
      this.publisher = publisher
    }
    if (publisher !== this.publisher) {
      throw Error('invalid invoke from untrusted publisher.')
    }
    this.refState.set(data)
  }
}
