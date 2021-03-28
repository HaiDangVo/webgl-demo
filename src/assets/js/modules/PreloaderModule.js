import BaseModule from "./BaseModule"
export default class PreloaderModule extends BaseModule {
  register() {
    this.bar = this.el.querySelector('.percentage')
  }

  hide() {
    this.el.classList.add('hidding')
    setTimeout(() => {
      this.el.style.display = 'none'
    }, 1200)
  }

  progress(pct) {
    if (this.bar) {
      this.bar.style.transform = `scaleX(${pct})`
    }
  }
}
