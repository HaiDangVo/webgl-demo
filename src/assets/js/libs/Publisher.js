import { invoker } from "./Observer"

export default class Publisher {
  publish(name, data) {
    invoker(`${name}.${this.name}.${this.id}`, data, this)
  }
}
