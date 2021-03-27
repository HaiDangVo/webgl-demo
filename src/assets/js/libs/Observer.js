import Subscriber from "./Subscriber"

const pool = {}

const Observer = (name = 'eventName.ModuleName.ModuleId', callback = value => value) => {
  const [eventName, moduleName, moduleId] = name.split(/\./g)
  const sub = new Subscriber(eventName, callback, name)
  const returnObject = {
    disconnect() {
      let index = (pool[eventName] || {
        default: []
      }).default.findIndex(s => s === sub)
      if (index > -1) {
        pool[eventName].default.splice(index, 1)
        return
      }
      index = ((pool[eventName] || {})[moduleName] || {
        default: []
      }).default.findIndex(s => s === sub)
      if (index > -1) {
        pool[eventName][moduleName].default.splice(index, 1)
        return
      }
      index = (((pool[eventName] || {})[moduleName] || {})[moduleId] || []).findIndex(s => s === sub)
      if (index > -1) {
        pool[eventName][moduleName][moduleId].splice(index, 1)
        return
      }
    }
  }
  if (!pool[eventName]) {
    pool[eventName] = {
      default: []
    }
  }
  let subject = pool[eventName]
  if (!moduleName) {
    subject.default.push(sub)
    return returnObject
  }
  if (!subject[moduleName]) {
    subject[moduleName] = {
      default: []
    }
  }
  subject = subject[moduleName]
  subject.default.push(sub)
  if (!moduleId) return returnObject
  if (!subject[moduleId]) {
    subject[moduleId] = []
  }
  subject[moduleId].push(sub)
  return returnObject
}

const invoker = (name, data, publisher) => {
  const [eventName, moduleName, moduleId] = name.split(/\./g)
  let subject = (pool[eventName] || {
    default: []
  })
  let subs = [...subject.default]
  if (!subject[moduleName]) {
    subs.forEach(sub => sub.invoke(data, publisher))
    return
  }
  subject = subject[moduleName]
  subs = [...subs, ...subject.default]

  if (!subject[moduleId]) {
    subs.forEach(sub => sub.invoke(data, publisher))
    return
  }
  subject = subject[moduleId]
  subs = [...subs, ...subject]
  subs.forEach(sub => sub.invoke(data, publisher))
}

export default Observer
export {
  invoker
}
