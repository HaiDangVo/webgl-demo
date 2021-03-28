import BaseModule from "./BaseModule"
import {
  AmbientLight,
  AxesHelper,
  Clock,
  GridHelper,
  ObjectLoader,
  Scene,
  Vector2,
  WebGLRenderer
} from "three"
import TheViewer from "../components/TheViewer"
import {
  DeThrottler
} from "../libs/Helper"
import AMesh from "../components/AMesh"
import PictureShader from "../components/PictureShader"
import InteractDetector from "../components/InteractDetector"
import factory from '../libs/Factory'
export default class MainApp extends BaseModule {
  register() {
    this.scene = new Scene()
    this.theViewer = new TheViewer({
      el: this.el,
      scene: this.scene
    })
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.shadowMap.enabled = true
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.ticker = new Clock(false)
    this.activeMeshes = []
    this.pictures = []
    this.interactDetector = new InteractDetector({
      scene: this.scene,
      renderer: this.renderer,
      theViewer: this.theViewer
    })
    this.el.appendChild(this.renderer.domElement)
    // debug
    // const grid = new GridHelper(50, 50)
    // this.scene.add(grid)
    // const axis = new AxesHelper(10)
    // this.scene.add(axis)
    window.app = this

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
      this.theViewer.navigation.hideVisibleCheckpoints()
      this.theViewer.initFollowers()
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
        cObject.active = name === 'p_i_c01'
        this.pictures.push(cObject)
      })

      // all done
      const preloader = (factory.getModulesByName('PreloaderModule') || [])[0]
      preloader && preloader.hide()
      this.theViewer.preStart()
      this.start()
    })
    // reigster handler
    this.interactDetector.addEventListener('onTouchStart', intersects => {
      if (!intersects.length) return
      const button = intersects.find(i => i.object.name.includes('button'))
      if (button) {
        if (button.object.name === 'buttonMoveForward') {
          this.theViewer.move('forward')
          this.theViewer.move('forward')
        }
        if (button.object.name === 'buttonMoveBackward') {
          this.theViewer.move('backward')
          this.theViewer.move('backward')
        }
      }
    })
    this.interactDetector.addEventListener('onTouchEnd', intersects => {
      if (!intersects.length) return
      const door = intersects.find(i => i.object.name.includes('door'))
      const pic = intersects.find(i => i.object.name.includes('pic'))
      if (door) {
        this.theViewer.moveTo(door, this.scene)
        return
      }
      if (pic) {
        this.theViewer.moveTo(pic, this.scene)
        return
      }
    })
    DeThrottler({
      event: 'wheel',
      skipLastCall: true,
      callback: e => {
        if (e.deltaY < -2) {
          this.theViewer.move('forward')
        }
        if (e.deltaY > 2) {
          this.theViewer.move('backward')
        }
      }
    })
    DeThrottler({
      event: 'resize',
      callback: () => {
        this.theViewer.camera.aspect = window.innerWidth / window.innerHeight
        this.theViewer.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    })

    //
    // this.start()
  }

  start() {
    this.ticker.start()
    this.loop()
  }

  loop() {
    this.update(this.ticker.getDelta())
    this.render()
    requestAnimationFrame(() => this.loop())
  }

  update(delta) {
    // console.log(delta)
    this.controls && this.controls.update()
    this.theViewer.update(delta)
    this.activeMeshes.forEach(a => a.update(delta))
    this.pictures.forEach(p => p.update(delta))
  }

  render() {
    this.renderer.render(this.scene, this.theViewer.camera)
  }
}
