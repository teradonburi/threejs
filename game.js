/* global Ammo: false */
import Render from './src/Render'
import Scene from './src/Scene'
import Clock from './src/Clock'
import Vec3 from './src/Vec3'
import Axis from './src/Axis'
import Grid from './src/Grid'
import Camera2D from './src/Camera2D'
import Camera3D from './src/Camera3D'
import CubeMap from './src/CubeMap'
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

export default class Game {

  init = async () => {
    // アニメーションとかで使う時間用
    this.clock = new Clock()
    // シーン作成
    this.scene = new Scene()
    this.sceneOrtho = new Scene()
    this.cubeMap = new CubeMap('textures/')
    this.scene.background = this.cubeMap
    this.scene.fog = new Fog()
    // レンダラー作成
    this.renderer = new Render(this.onResize)
    // 物理世界作成
    this.physicsWorld = new PhysicsWorld()

    // 3Dカメラ
    const eye = new Vec3(50, 50, 150)
    const lookAt = new Vec3(0, 0, 0)
    this.camera = new Camera3D(eye, lookAt)
    this.scene.add(this.camera)
    this.scene.add(this.camera.getHelper())

    // 2Dカメラ
    this.cameraOrtho = new Camera2D()

    // コントロールカメラ
    const debugEye = new Vec3(100, 200, 200)
    const debugLookAt = new Vec3(0, 0, 0)
    this.controlCamera = new Camera3D(debugEye, debugLookAt, 1, 4000)
    this.controlCamera.controls = this.controlCamera.getControls()

    this.light = new DirectionalLight()
    this.ambient = new AmbientLight()
    this.scene.add(this.light)
    // this.scene.add(this.ambient)

    this.grid = new Grid()
    this.axis = new Axis()
    this.scene.add(this.grid)
    this.scene.add(this.axis)

    this.loader = new Loader()
    const texture = await this.loader.loadTexture('./textures/book.png')
    this.sprite = new Sprite(texture)

    this.sprite.setPos(-1, 1, {right: true, bottom: true})
    this.sprite.setSize(100)
    this.sceneOrtho.add(this.sprite)

    const gltf = await this.loader.loadGLTFModel('./model/CesiumMan.gltf')
    this.model = new GLTFModel(gltf, true)
    this.model.init(new Vec3(0, 40, 0), -Math.PI/2, 10)
    this.model.actions[0].play()
    this.scene.add(this.model)
    this.model.getCenter()
    this.physicsWorld.addHumanBody(this.model, 0.8)
    // this.scene.add(this.model.boxHelper)
    this.isGround = false

    this.keyboard = new Keyboard()
    this.heightMap = new HeightMap()
    this.scene.add(this.heightMap)
    this.physicsWorld.addRigidBody(this.heightMap.userData.physicsBody)

    this.objectTimePeriod = 3
    this.timeNextSpawn = this.objectTimePeriod

    // ドラッグ処理
    this.dragControls = new DragControls(this.physicsWorld.dynamicObjects, this.controlCamera, this.renderer)

    this.loop()
  }

  loop = () => {
    requestAnimationFrame(this.loop)
    this.render()
  }

  onResize = () =>  {
    this.renderer.resize()

    const cameras = [this.camera, this.cameraOrtho, this.controlCamera]
    for (let camera of cameras) {
      camera.resize()
    }
    this.sprite.onResizeWindow()
  }

  render = () => {
    const {delta, time} = this.clock.update()
    this.model.mixer && this.model.mixer.update(delta)

    if (this.physicsWorld.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
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
      this.physicsWorld.dynamicObjects.push(mesh)
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
      this.model.userData.physicsBody.applyCentralImpulse(new Ammo.btVector3(0, 20000, 0))
      this.isGround = false
      this.jumbTime = time
    }
    this.physicsWorld.update(delta/2)
    this.physicsWorld.update(delta/2)

    // 物理空間上のオブジェクトの当たり判定
    const hitResult = this.physicsWorld.hitTest([this.heightMap, this.model])
    if (Object.keys(hitResult).length > 0) {
      if (time > (this.jumbTime || 0) + delay) {
        this.isGround = true
      }
    }


    this.physicsWorld.updateDynamicObjectsModelPose()
    this.physicsWorld.setModelPose(this.model)
    this.controlCamera.controls.update()
    this.renderer.clear()
    this.renderer.render(this.scene, this.controlCamera)
    this.renderer.clearDepth()
    this.renderer.render(this.sceneOrtho, this.cameraOrtho)
  }
}




