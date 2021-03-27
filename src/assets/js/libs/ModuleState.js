const storage = {}

const refState = (name, initValue) => {
  if (!storage[name]) {
    const subs = []
    let currentValue = initValue
    storage[name] = {
      get: () => currentValue,
      set: value => {
        if (value !== currentValue) {
          currentValue = value
          subs.forEach(s => s(currentValue))
          return [...subs]
        }
        return false
      },
      onChange: sub => subs.push(sub)
    }
  }
  return storage[name]
}

export default refState
