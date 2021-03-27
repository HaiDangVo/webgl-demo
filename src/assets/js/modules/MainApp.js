import BaseModule from "./BaseModule"
import {
  AmbientLight,
  AxesHelper,
  Clock,
  GridHelper,
  Loader,
  Scene,
  WebGLRenderer
} from "three"
import ACamera from "../components/ACamera"
import { DeThrottler } from "../libs/Helper"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export default class MainApp extends BaseModule {
  register() {
    this.scene = new Scene()
    this.aCam = new ACamera({
      el: this.el
    })
    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.ticker = new Clock(false)
    this.el.appendChild(this.renderer.domElement)
    // debug
    // const grid = new GridHelper(50, 50)
    // this.scene.add(grid)
    // const axis = new AxesHelper(10)
    // this.scene.add(axis)

    // light
    this.scene.add(new AmbientLight(0x999999))

    this.loader = new GLTFLoader()
    this.loader.load('assets/images/scene.gltf', gltf => {
      this.scene.add(gltf.scene)
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
      event: 'mousewheel',
      skipLastCall: true,
      callback: e => {
        console.log(e)
        if (e.deltaY < 0) {
          this.aCam.move('forward')
        }
        if (e.deltaY > 0) {
          this.aCam.move('backward')
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
  }

  render() {
    this.renderer.render(this.scene, this.aCam.camera)
  }
}
