import {
  PerspectiveCamera,
  Vector3
} from "three"
import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls"
import Navigation from "./Navigation"

export default class TheViewer {
  constructor(options) {
    this.options = options
    this.scene = options.scene
    this.speed = options.speed || 4
    this.maxZ = options.maxZ || 30
    this.minZ = options.minZ || -30
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
    this.moveQueue = []
    this.navigation = new Navigation({
      scene: this.scene
    })
    this.followers = []
    this.camera.position.set(this.selfPosition.x, this.selfPosition.y, this.selfPosition.z)
    this.controls = new OrbitControls(this.camera, this.options.el)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.enablePan = false
    this.controls.enableZoom = false
    this.controls.minPolarAngle = Math.PI * 0.45 // for lower
    this.controls.maxPolarAngle = Math.PI * 0.55 // for upper
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

  preStart() {
    this.camera.position.set(0, 10, -12)
    this.camera.lookAt(new Vector3(0, 0, -6))
    this.controls && this.controls.update()
  }

  initFollowers() {
    const forward = this.scene.getObjectByName('buttonMoveForward')
    const backward = this.scene.getObjectByName('buttonMoveBackward')
    forward.timer = 0
    backward.timer = 0
    this.followers.push(forward, backward)
  }

  move(dir) {
    if (!this.navigation.isOutdoor) return
    switch (dir) {
      case 'forward':
        if (this.selfPosition.z < this.maxZ) {
          this.selfPosition.z += this.speed
          this.targetPosition.z += this.speed
        }
        break;
      case 'backward':
        if (this.selfPosition.z > this.minZ) {
          this.selfPosition.z -= this.speed
          this.targetPosition.z -= this.speed
        }
        break;
      default:
        break;
    }
  }

  moveTo(object, scene) {
    if (this.navigation.checkIfOutdoor()) {
      this.navigation.saveCheckpoint('checkpointOS')
      this.moveQueue = ['checkpointOS']
    } else {
      if (!this.navigation.checkIfOnCenterPoint()) {
        const centerPoint = this.navigation.determineCenterPoint()
        if (centerPoint && centerPoint.length) {
          this.navigation.saveCheckpoint(centerPoint)
          this.moveQueue = [centerPoint]
        }
      }
    }
    this.moveQueue.push(this.navigation.determineNextCheckpoint(object.object))
    //
    const target = scene.getObjectByName(this.moveQueue.shift())
    this.lockTarget(target)
  }

  lockTarget(target) {
    if (target) {
      this.selfPosition.x = target.position.x
      this.targetPosition.x = target.position.x
      //
      this.selfPosition.z = target.position.z
      this.targetPosition.z = target.position.z
      //
      this.targetPosition.z += 0.6
      if (this.moveQueue.length) {
        if (this.moveQueue[0] === 'checkpointRL1') {
          this.targetPosition.x += 1.2
          this.targetPosition.z -= 0.5
        }
        if (this.moveQueue[0] === 'checkpointRR1') {
          this.targetPosition.x += -1.2
          this.targetPosition.z -= 0.5
        }
      }
      const targetForLooking = this.navigation.determineLookatBaseOnCheckpoint(target.name)
      if (targetForLooking) {
        const tPosition = new Vector3(0, 0, 0)
        targetForLooking.getWorldPosition(tPosition)
        tPosition.lerp(target.position, 0.9)
        this.targetPosition.x = tPosition.x
        this.targetPosition.z = tPosition.z
      }
      if (!this.moveQueue.length) {
        this.navigation.saveCheckpoint(target.name)
      }
    }
  }

  update(delta) {
    const camPosition = new Vector3(this.selfPosition.x, this.selfPosition.y, this.selfPosition.z)
    const targetPosition = new Vector3(this.targetPosition.x, this.targetPosition.y, this.targetPosition.z)
    const t = 1 - Math.pow(0.2, delta)
    if (!this.isTouched) {
      this.camera.position.lerp(camPosition, t)
    }
    if (this.camera.position.distanceTo(camPosition) < 1) {
      if (this.moveQueue.length) {
        const target = this.scene.getObjectByName(this.moveQueue.shift())
        this.lockTarget(target)
        if (this.moveQueue.length === 0) {
          if (target) {
            this.navigation.saveCheckpoint(target.name)
          }
        }
      }
    }
    this.controls.target.lerp(targetPosition, t)
    this.controls && this.controls.update()
    //
    const [forward, backward] = this.followers
    if (forward && backward) {
      if (this.camera.position.z < this.minZ + this.speed) {
        backward.visible = false
      } else {
        backward.visible = true
      }
      if (this.camera.position.z > this.maxZ - this.speed) {
        forward.visible = false
      } else {
        forward.visible = true
      }
      backward.position.z = this.camera.position.z - 10
      forward.position.z = this.camera.position.z + 10
      backward.material.opacity = (Math.cos(backward.timer += delta * 2) + 1) * 0.5
      forward.material.opacity = (Math.cos(forward.timer += delta * 2) + 1) * 0.5
    }
  }
}
