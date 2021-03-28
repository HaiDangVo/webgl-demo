import BaseModule from "./BaseModule"
import {
  AmbientLight,
  AxesHelper,
  Clock,
  GridHelper,
  Loader,
  ObjectLoader,
  PCFSoftShadowMap,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer
} from "three"
import ACamera from "../components/ACamera"
import {
  DeThrottler
} from "../libs/Helper"
import AMesh from "../components/AMesh"
import PictureShader from "../components/PictureShader"
export default class MainApp extends BaseModule {
  register() {
    this.scene = new Scene()
    this.aCam = new ACamera({
      el: this.el,
      scene: this.scene
    })
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.ticker = new Clock(false)
    this.pointer = {
      isTouch: false,
      needCast: false,
      position: new Vector2()
    }
    this.rayCaster = new Raycaster()
    this.activeMeshes = []
    this.pictures = []
    this.el.appendChild(this.renderer.domElement)
    // debug
    // const grid = new GridHelper(50, 50)
    // this.scene.add(grid)
    // const axis = new AxesHelper(10)
    // this.scene.add(axis)

    // light
    this.scene.add(new AmbientLight(0x999999))

    // loader
    this.loader = new ObjectLoader()
    this.loader.load('assets/images/scene.json', object => {
      this.scene.add(object)
      const aMesh01 = new AMesh({
        mesh: this.scene.getObjectByName('rotateObject 01'),
        animations: [{
          name: 'float',
          param: 1
        }, {
          name: 'rotate',
          param: 1
        }]
      })
      const aMesh02 = new AMesh({
        mesh: this.scene.getObjectByName('rotateObject 02'),
        animations: [{
          name: 'rotate',
          param: -0.75
        }]
      })
      this.activeMeshes = [aMesh01, aMesh02]
      //
      this.aCam.navigation.hideVisibleCheckpoints()
      this.aCam.initFollowers()
      // custom shader object
      const names = [
        'p_i_c01', 'picRL1-1', 'picRL1-2', 'picRL1-3',
        'picRL2-1', 'picRL2-2', 'picRL2-3',
        'picRR1-1', 'picRR1-2',
        'picRR2-1', 'picRR2-2', 'picRR2-3', 'picRR2-4'
      ]
      names.forEach(name => {
        const cObject = new PictureShader({
          scene: this.scene,
          mesh: this.scene.getObjectByName(name),
          uniforms: {
            uResolution: {
              type: 'vec2',
              value: new Vector2(window.innerWidth, window.innerHeight)
            },
            uSize: {
              type: 'vec2',
              value: new Vector2(6, 3)
            },
            uDelta: {
              type: 'float',
              value: Math.random()
            },
            uChange: {
              type: 'float',
              value: Math.random()
            },
          }
        })
        this.pictures.push(cObject)
      })
    })
    // wall
    // - left

    // - right
    //
    this.ticker.start()
    this.loop()
    //
    window.app = this
    DeThrottler({
      event: 'wheel',
      skipLastCall: true,
      callback: e => {
        if (e.deltaY < -2) {
          this.aCam.move('forward')
        }
        if (e.deltaY > 2) {
          this.aCam.move('backward')
        }
      }
    })
    DeThrottler({
      event: 'resize',
      callback: () => {
        this.aCam.camera.aspect = window.innerWidth / window.innerHeight
        this.aCam.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    })
    this.renderer.domElement.addEventListener('pointerdown', e => {
      this.pointer.position.x = (e.clientX / window.innerWidth) * 2 - 1
      this.pointer.position.y = -(e.clientY / window.innerHeight) * 2 + 1
      this.pointer.isTouch = true
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
          this.pointer.needCast = true
        }
      }
    })
  }

  loop() {
    this.update(this.ticker.getDelta())
    this.render()
    requestAnimationFrame(() => this.loop())
  }

  update(delta) {
    // console.log(delta)
    this.controls && this.controls.update()
    this.aCam.update(delta)
    this.activeMeshes.forEach(a => a.update(delta))
    this.pictures.forEach(p => p.update(delta))
    //
    if (this.pointer.needCast) {
      this.pointer.needCast = false
      this.rayCaster.setFromCamera(this.pointer.position, this.aCam.camera)
      const intersects = this.rayCaster.intersectObjects(this.scene.children, true)
      if (intersects.length) {
        // console.log(intersects)
        const door = intersects.find(i => i.object.name.includes('door'))
        const pic = intersects.find(i => i.object.name.includes('pic'))
        const button = intersects.find(i => i.object.name.includes('button'))
        if (door) {
          this.aCam.moveTo(door, this.scene)
          return
        }
        if (pic) {
          this.aCam.moveTo(pic, this.scene)
          return
        }
        if (button) {
          if (button.object.name === 'buttonMoveForward') {
            this.aCam.move('forward')
            this.aCam.move('forward')
          }
          if (button.object.name === 'buttonMoveBackward') {
            this.aCam.move('backward')
            this.aCam.move('backward')
          }
        }
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.aCam.camera)
  }
}
