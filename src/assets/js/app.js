import 'babel-polyfill'
import factory from './libs/Factory'

const moduleElements = [...document.querySelectorAll('[data-module]')]

window.factory = factory

document.addEventListener('DOMContentLoaded', () => {
  factory.registerModules(moduleElements)
  const observer = new MutationObserver(mutations => {
    mutations.forEach((m) => {
      const rawElements = [m.target, ...m.addedNodes]
      let modifyElements = []
      rawElements.forEach((e) => {
        if (e.querySelectorAll) {
          modifyElements = [...modifyElements, ...e.querySelectorAll('[data-module]')]
        }
      })
      const elements = [...rawElements, ...modifyElements].filter((e) => e.getAttribute && e.getAttribute('data-module') && !e.modules)
      factory.registerModules(elements)
    })
  })
  observer.observe(document, {
    subtree: true,
    childList: true,
  })
})
