import {
  PerspectiveCamera,
  Vector3
} from "three"
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls"
import {
  DeviceOrientationControls
} from "three/examples/jsm/controls/DeviceOrientationControls"
import {
  isMobile
} from "../libs/Helper"

export default class ACamera {
  constructor(options) {
    this.options = options
    this.speed = options.speed || 4
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.selfPosition = {
      x: 0,
      y: 4,
      z: 0
    }
    this.targetPosition = {
      x: 0,
      y: 4,
      z: 0.6
    }
    this.isInsideRoom = false
    this.camera.position.set(this.selfPosition.x, this.selfPosition.y, this.selfPosition.z)
    this.controls = isMobile() ? new DeviceOrientationControls(this.camera) : new OrbitControls(this.camera, this.options.el)
    // this.controls = new OrbitControls(this.camera, this.options.el)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.minPolarAngle = Math.PI * 0.4 // for lower
    this.controls.maxPolarAngle = Math.PI * 0.6 // for upper
    this.controls.target = new Vector3(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z)
    let callbackId = 0
    const timeout = 1000
    this.controls.addEventListener('start', () => {
      this.isTouched = true
      clearTimeout(callbackId)
    })
    this.controls.addEventListener('end', () => {
      callbackId = setTimeout(() => {
        this.isTouched = false
      }, timeout)
    })
    this.isTouched = false
  }

  move(dir) {
    console.log(this.isInsideRoom)
    if (this.isInsideRoom) return
    switch (dir) {
      case 'forward':
        this.selfPosition.z += this.speed
        this.targetPosition.z += this.speed
        break;
      case 'right':
        this.selfPosition.x += this.speed
        this.targetPosition.x += this.speed
        break;
      case 'left':
        this.selfPosition.x -= this.speed
        this.targetPosition.x -= this.speed
        break;
      case 'backward':
        this.selfPosition.z -= this.speed
        this.targetPosition.z -= this.speed
        break;
      default:
        break;
    }
  }

  moveTo(object, scene) {
    const map = {
      doorLeft: 'leftStandPoint',
      doorRight: 'rightStandPoint',
      outDoor: 'outDoor'
    }
    const target = scene.getObjectByName(map[object.object.name])
    if (target) {
      this.selfPosition.x = target.position.x
      this.targetPosition.x = target.position.x
      //
      this.selfPosition.z = target.position.z
      this.targetPosition.z = target.position.z + 0.6
    }
  }

  update(delta) {
    const camPosition = new Vector3(this.selfPosition.x, this.selfPosition.y, this.selfPosition.z)
    const targetPosition = new Vector3(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z)
    const t = 1 - Math.pow(0.2, delta)
    if (!this.isTouched) {
      this.camera.position.lerp(camPosition, t)
    }
    this.controls.target.lerp(targetPosition, t)
    this.controls && this.controls.update()
  }
}
