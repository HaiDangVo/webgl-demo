import BaseModule from "./BaseModule"
export default class PreloaderModule extends BaseModule {
  register() {
    // console.log()
  }

  hide() {
    this.el.classList.add('hidding')
    setTimeout(() => {
      this.el.style.display = 'none'
    }, 1200)
  }
}
