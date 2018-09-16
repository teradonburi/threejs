import TWEEN from '@tweenjs/tween.js'
import Render from './src/Render'
import Scene from './src/Scene'
import Clock from './src/Clock'
import Vec3 from './src/Vec3'
import Axis from './src/Axis'
import Grid from './src/Grid'
import Camera2D from './src/Camera2D'
import Camera3D from './src/Camera3D'
// import CubeMap from './src/CubeMap'
import DirectionalLight from './src/DirectionalLight'
import AmbientLight from './src/AmbientLight'
import Loader from './src/Loader'
import HeightMap from './src/HeightMap'
import Fog from './src/Fog'
import Sprite from './src/Sprite'
import Sphere from './src/Sphere'
import Box from './src/Box'
import Cylinder from './src/Cylinder'
import Cone from './src/Cone'
import GLTFModel from './src/GLTFModel'
import PhysicsWorld from './src/PhysicsWorld'
import DragControls from './src/DragControls'
import Keyboard from './src/Keyboard'
import AudioListener from './src/AudioListener'
import PositionalAudio from './src/PositionalAudio'
import Audio from './src/Audio'
import Particle from './src/Particle'
import Water from './src/Water'
import Sky from './src/Sky'

export default class Game {

  init = async () => {
    // アニメーションとかで使う時間用
    this.clock = new Clock()
    this.loader = new Loader()
    // シーン作成
    this.scene = new Scene()
    this.sceneOrtho = new Scene()
    // this.cubeMap = new CubeMap('textures/')
    // this.scene.background = this.cubeMap
    this.scene.fog = new Fog()
    // レンダラー作成
    this.renderer = new Render(this.onResize)
    // 物理世界作成
    this.physicsWorld = new PhysicsWorld()

    // Audio
    this.audioListener = new AudioListener()
    this.buffer = await this.loader.loadAudio('./sounds/bgm_maoudamashii_cyber39.mp3')
    this.bgm = new Audio(this.buffer, this.audioListener)
    this.bgm.setLoop(true)
    this.bgm.setVolume(0.1)
    this.bgm.play()
    this.soundBuffer = await this.loader.loadAudio('./sounds/ping_pong.mp3')
    this.sound = new PositionalAudio(this.soundBuffer, this.audioListener)
    this.sound.setVolume(10)

    // 3Dカメラ
    const eye = new Vec3(50, 50, 150)
    const lookAt = new Vec3(0, 0, 0)
    this.camera = new Camera3D(eye, lookAt)
    this.scene.add(this.camera)
    this.scene.add(this.camera.getHelper()) // helper

    // 2Dカメラ
    this.cameraOrtho = new Camera2D()

    // コントロールカメラ
    const debugEye = new Vec3(100, 200, 200)
    const debugLookAt = new Vec3(0, 0, 0)
    this.controlCamera = new Camera3D(debugEye, debugLookAt, 1, 4000)
    this.controlCamera.controls = this.controlCamera.getControls()

    // lighting
    this.light = new DirectionalLight()

    const parameters = {
      distance: 400,
      inclination: 0.3,
      azimuth: 0.205,
    }
    const theta = Math.PI * (parameters.inclination - 0.5)
    const phi = 2 * Math.PI * (parameters.azimuth - 0.5)
    this.light.position.x = parameters.distance * Math.cos(phi)
    this.light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta)
    this.light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta)
    this.scene.add(this.light)
    this.ambient = new AmbientLight()
    // this.scene.add(this.ambient)

    // Sky
    this.sky = new Sky()
    this.sky.setEnv({turbidity: 10, rayleigh: 2, luminance: 1, mieCoefficient: 0.005, mieDirectionalG: 0.8})
    this.sky.setLight(this.light)
    this.scene.add(this.sky)

    // Water
    this.water = new Water(this.light)
    this.water.setEnv({distortionScale: 3.7, alpha: 0.95})
    this.water.setLight(this.light)
    this.scene.add(this.water)

    // HeightMap
    this.heightMap = new HeightMap()
    this.scene.add(this.heightMap)
    this.physicsWorld.addRigidBody(this.heightMap.userData.physicsBody)

    // GLTF
    const gltf = await this.loader.loadGLTFModel('./model/CesiumMan.gltf')
    this.model = new GLTFModel(gltf, true)
    this.model.init(new Vec3(0, 10, 0), -Math.PI/2, 10)
    this.model.actions[0].play()
    this.model.getCenter()
    this.physicsWorld.addHumanBody(this.model, 0.8)
    this.scene.add(this.model)
    this.model.add(this.sound)
    // this.scene.add(this.model.boxHelper)
    this.isGround = false

    // Particle
    this.particle = new Particle()
    this.scene.add(this.particle)

    // Grid
    this.grid = new Grid()
    this.scene.add(this.grid)
    // Axis
    this.axis = new Axis()
    this.scene.add(this.axis)

    // Sprite
    const texture = await this.loader.loadTexture('./textures/sprite1.png')
    this.sprite = new Sprite(texture)
    this.sprite.setPos(-1, 1)
    this.sprite.setCenter({right: true, bottom: true})
    this.sprite.setSize(128, 128)
    this.sceneOrtho.add(this.sprite)

    const coords = { x: -1, y: 1 }
    this.tween = new TWEEN.Tween(coords)
        .to({ x: -1, y: 0 }, 3000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          this.sprite.setPos(coords.x, coords.y)
        })

    this.tweenBack = new TWEEN.Tween(coords)
        .to({ x: -1, y: 1 }, 3000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          this.sprite.setPos(coords.x, coords.y)
        })

    this.tween.chain(this.tweenBack)
    this.tweenBack.chain(this.tween)
    this.tween
      .delay(3000)
      .start()

    // util
    this.keyboard = new Keyboard()

    // ドラッグ処理
    this.dynamicObjects = []
    this.dragControls = new DragControls(this.dynamicObjects, this.controlCamera, this.renderer, this.onDragStart, this.onDragEnd)

    this.objectTimePeriod = 3
    this.timeNextSpawn = this.objectTimePeriod

    this.loop()
  }

  onDragStart = (e) => {
    if (this.controlCamera.controls) {
      this.controlCamera.controls.enabled = false
    }
    if (e.object.userData) {
      e.object.userData.ignorePhysics = true
    }
  }

  onDragEnd = (e) => {
    if (e.object.userData) {
      this.physicsWorld.setPhysicsPose(e.object)
      e.object.userData.ignorePhysics = false
    }
    if (this.controlCamera.controls) {
      this.controlCamera.controls.enabled = true
    }
  }

  loop = (frame) => {
    requestAnimationFrame(this.loop)
    this.render(frame)
  }

  onResize = () =>  {
    this.renderer.resize()

    const cameras = [this.camera, this.cameraOrtho, this.controlCamera]
    for (let camera of cameras) {
      camera.resize()
    }
    this.sprite.onResizeWindow()
  }

  render = (frame) => {
    const {delta, time} = this.clock.update()
    TWEEN.update(frame)
    this.model.mixer && this.model.mixer.update(delta)

    if (this.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
      const objectType = Math.ceil(Math.random() * 4)
      let mesh = null
      const initPos = new Vec3(0, 100, 0)
      const objectSize = 2
      switch (objectType) {
        case 1:
          mesh = new Sphere(3 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addSphereBody(mesh, mesh.radius, objectSize * 5)
          break
        case 2:
          mesh = new Box(new Vec3(4 + Math.random() * objectSize, 4 + Math.random() * objectSize, 4 + Math.random() * objectSize))
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addBoxBody(mesh, mesh.size, objectSize * 5)
          break
        case 3:
          mesh = new Cylinder(3 + Math.random() * objectSize, 3 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addCylinderBody(mesh, mesh.radius, mesh.height, objectSize * 5)
          break
        default:
          mesh = new Cone(3 + Math.random() * objectSize, 2 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addConeBody(mesh, mesh.radius, mesh.height, objectSize * 5)
          break
      }

      this.scene.add(mesh)
      this.dynamicObjects.push(mesh)
      this.timeNextSpawn = time + this.objectTimePeriod
    }

    if (!(this.keyboard.isPressA() || this.keyboard.isPressD() || this.keyboard.isPressW() || this.keyboard.isPressS())) {
      this.model.stop()
    // A
    } else if (this.keyboard.isPressA()) {
      this.model.move(this.controlCamera, Math.PI/2)
    // D
    } else if (this.keyboard.isPressD()) {
      this.model.move(this.controlCamera, -Math.PI/2)
    // W
    } else if (this.keyboard.isPressW()) {
      this.model.move(this.controlCamera, 0)
    // S
    } else if (this.keyboard.isPressS()) {
      this.model.move(this.controlCamera, Math.PI)
    }
    this.physicsWorld.setPhysicsPose(this.model)

    const delay = 1
    if (this.isGround && time > (this.jumbTime || 0) + delay && this.keyboard.isPressSpace()) {
      this.physicsWorld.addImpulse(this.model, new Vec3(0, 8000, 0))
      this.sound.play()
      this.isGround = false
      this.jumbTime = time
    }
    this.physicsWorld.addForce(this.model, new Vec3(0, -3000, 0))

    // 物理計算更新
    this.physicsWorld.update(delta)

    // 物理空間上のオブジェクトの当たり判定
    const hitResult = this.physicsWorld.hitTest([this.heightMap, this.model])
    if (Object.keys(hitResult).length > 0) {
      if (time > (this.jumbTime || 0) + delay) {
        this.isGround = true
      }
    }

    for (let i = 0; i < this.dynamicObjects.length; i++) {
      const objThree = this.dynamicObjects[ i ]
      // ドラッグしていないオブジェクト以外反映する
      if (objThree.userData && objThree.userData.ignorePhysics) {
        continue
      }
      this.physicsWorld.setModelPose(objThree)
    }

    const horizontalSpeed = 1.5
    const verticalSpeed = 1.33
    this.particle.simulate(delta, new Vec3(Math.sin(this.particle.tick * horizontalSpeed) * 20, Math.sin(this.particle.tick * verticalSpeed) * 10 + 30, Math.sin(this.particle.tick * horizontalSpeed + verticalSpeed) * 5))
    this.water.update()

    this.physicsWorld.setModelPose(this.model)
    this.controlCamera.controls.update()
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.clear(true, true, true)
    this.renderer.render(this.scene, this.controlCamera)
    this.renderer.clearDepth()
    this.renderer.render(this.sceneOrtho, this.cameraOrtho)
  }
}




