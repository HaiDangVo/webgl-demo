export default class AMesh {
  constructor(options) {
    this.options = options
    this.mesh = options.mesh
    this.animations = options.animations
    this.timer = 0
    this.baseY = this.mesh.position.y
  }

  rotate(delta, dir) {
    this.mesh.rotation.y += dir * delta
  }

  float(delta, value) {
    this.timer += delta * value
    this.mesh.position.y = this.baseY + Math.sin(this.timer) * 0.5
  }

  update(delta) {
    this.animations.forEach(a => this[a.name](delta, a.param))
  }
}
