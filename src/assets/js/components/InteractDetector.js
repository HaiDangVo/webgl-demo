import {
  Raycaster,
  Vector2
} from "three"

export default class InteractDetector {
  constructor(options) {
    this.options = options
    this.scene = options.scene
    this.renderer = options.renderer
    this.theViewer = options.theViewer
    this.pointer = {
      isTouch: false,
      position: new Vector2()
    }
    this.rayCaster = new Raycaster()
    this.subs = {}
    this.register()
  }

  register() {
    this.renderer.domElement.addEventListener('pointerdown', e => {
      this.pointer.position.x = (e.clientX / window.innerWidth) * 2 - 1
      this.pointer.position.y = -(e.clientY / window.innerHeight) * 2 + 1
      this.pointer.isTouch = true
      if (this.subs['onTouchStart']) {
        const intersects = this.getIntersects()
        this.subs['onTouchStart'].forEach(cb => cb && cb(intersects))
      }
    })
    this.renderer.domElement.addEventListener('pointerup', e => {
      const prevPos = {
        x: this.pointer.position.x,
        y: this.pointer.position.y
      }
      this.pointer.position.x = (e.clientX / window.innerWidth) * 2 - 1
      this.pointer.position.y = -(e.clientY / window.innerHeight) * 2 + 1
      if (this.pointer.isTouch) {
        this.pointer.isTouch = false
        if (Math.abs(prevPos.x - this.pointer.position.x) < 0.05 && Math.abs(prevPos.y - this.pointer.position.y) < 0.05) {
          if (this.subs['onTouchEnd']) {
            const intersects = this.getIntersects()
            this.subs['onTouchEnd'].forEach(cb => cb && cb(intersects))
          }
        }
      }
    })
  }

  getIntersects() {
    this.rayCaster.setFromCamera(this.pointer.position, this.theViewer.camera)
    return this.rayCaster.intersectObjects(this.scene.children, true)
  }

  addEventListener(eventName, callback) {
    if (!this.subs[eventName]) {
      this.subs[eventName] = []
    }
    this.subs[eventName].push(callback)
  }
}
