import Render from './src/Render'
import Scene from './src//Scene'
import Clock from './src//Clock'
import Vec3 from './src//Vec3'
import Axis from './src//Axis'
import Grid from './src//Grid'
import Camera from './src//Camera'
import CubeMap from './src/CubeMap'
import DirectionalLight from './src//DirectionalLight'
import AmbientLight from './src//AmbientLight'
import Loader from './src//Loader'
import HeightMap from './src//HeightMap'
import Sphere from './src//Sphere'
import Box from './src//Box'
import Cylinder from './src//Cylinder'
import Cone from './src//Cone'
import GLTFModel from './src//GLTFModel'
import PhysicsWorld from './src//PhysicsWorld'
import DragControls from './src//DragControls'

export default class Game {

  init = async () => {
    // アニメーションとかで使う時間用
    this.clock = new Clock()
    // シーン作成
    this.scene = new Scene()
    this.cubeMap = new CubeMap('textures/')
    this.scene.background = this.cubeMap
    // レンダラー作成
    this.renderer = new Render(this.onResize)
    // 物理世界作成
    this.physicsWorld = new PhysicsWorld()

    // カメラ
    const eye = new Vec3(50, 50, 150)
    const lookAt = new Vec3(0, 0, 0)
    this.camera = new Camera(eye, lookAt)
    this.scene.add(this.camera)
    this.scene.add(this.camera.getHelper())

    // コントロールカメラ
    const debugEye = new Vec3(100, 200, 200)
    const debugLookAt = new Vec3(0, 0, 0)
    this.controlCamera = new Camera(debugEye, debugLookAt, 1, 4000)
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

    const gltf = await this.loader.loadGLTFModel('./model/CesiumMan.gltf')
    this.model = new GLTFModel(gltf, true)
    this.model.position.set(0, 40, 0)
    const s = 10
    this.model.scale.set(s, s, s)
    this.initRotate = -Math.PI/2
    this.model.rotation.set(0, this.initRotate, 0)
    this.model.actions[0].play()
    this.scene.add(this.model)
    this.model.getCenter()
    // this.physicsWorld.addBoxBody(this.model, this.model.size, 2000)
    this.physicsWorld.addCapsuleBody(this.model, (this.model.size.x ** 2 + this.model.size.z ** 2) ** 0.5 * 0.5 * 0.8, this.model.size.y, 2000)
    this.model.userData.physicsBody.setAngularFactor(0, 1, 0)
    this.model.userData.physicsBody.setFriction(100)
    // this.scene.add(this.model.boxHelper)


    this.keys = []
    document.addEventListener('keydown', (e) => {
      const keycode = e.keyCode
      this.keys[keycode] = true
    })
    document.addEventListener('keyup', (e) => {
      const keycode = e.keyCode
      this.keys[keycode] = false
    })

    this.heightMap = new HeightMap()
    this.scene.add(this.heightMap)
    this.physicsWorld.addRigidBody(this.heightMap.userData.physicsBody)

    this.objectTimePeriod = 3
    this.timeNextSpawn = this.objectTimePeriod
    this.vel = new Vec3(0, 0, 0)

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

    const cameras = [this.camera, this.controlCamera]
    for (let camera of cameras) {
      camera.resize()
    }
  }

  move = () => {
    let vector = new Vec3()
    this.controlCamera.getWorldDirection(vector)
    vector.y = 0
    const yAxis = new Vec3(0, 1, 0)
    vector.normalize()
    const max = 0.2
    const move = 0.05
    // A
    if (this.keys[65]) {
      vector.applyAxisAngle(yAxis, Math.PI/2)
      const rotate = new Vec3()
      rotate.copy(vector)
      rotate.applyAxisAngle(yAxis, this.initRotate)
      this.model.lookAt(new Vec3(this.model.position.x + rotate.x, this.model.position.y + rotate.y, this.model.position.z + rotate.z))
      vector.multiplyScalar(move)
      if (this.vel.length() < max) {
        this.vel.x += vector.x
        this.vel.z += vector.z
      }
    // D
    } else if (this.keys[68]) {
      vector.applyAxisAngle(yAxis, -Math.PI/2)
      const rotate = new Vec3()
      rotate.copy(vector)
      rotate.applyAxisAngle(yAxis, this.initRotate)
      this.model.lookAt(new Vec3(this.model.position.x + rotate.x, this.model.position.y + rotate.y, this.model.position.z + rotate.z))
      vector.multiplyScalar(move)
      if (this.vel.length() < max) {
        this.vel.x += vector.x
        this.vel.z += vector.z
      }
    // W
    } else if (this.keys[87]) {
      const rotate = new Vec3()
      rotate.copy(vector)
      rotate.applyAxisAngle(yAxis, this.initRotate)
      this.model.lookAt(new Vec3(this.model.position.x + rotate.x, this.model.position.y + rotate.y, this.model.position.z + rotate.z))
      vector.multiplyScalar(move)
      if (this.vel.length() < max) {
        this.vel.x += vector.x
        this.vel.z += vector.z
      }
    // S
    } else if (this.keys[83]) {
      vector.applyAxisAngle(yAxis, Math.PI)
      const rotate = new Vec3()
      rotate.copy(vector)
      rotate.applyAxisAngle(yAxis, this.initRotate)
      this.model.lookAt(new Vec3(this.model.position.x + rotate.x, this.model.position.y + rotate.y, this.model.position.z + rotate.z))
      vector.multiplyScalar(move)
      if (this.vel.length() < max) {
        this.vel.x += vector.x
        this.vel.z += vector.z
      }
    }
    if (!(this.keys[65] || this.keys[68] || this.keys[87] || this.keys[83])) {
      this.vel.x = 0
      this.vel.z = 0
    }
    this.model.position.x += this.vel.x
    this.model.position.z += this.vel.z
    PhysicsWorld.setPhysicsPose(this.model)
  }

  render = () => {
    const {delta, time} = this.clock.update()
    this.model.mixer && this.model.mixer.update(delta)

    if (this.physicsWorld.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
      const objectType = Math.ceil(Math.random() * 4)
      let mesh = null
      const initPos = new Vec3(0, 100, 0)
      const objectSize = 3
      switch (objectType) {
        case 1:
          mesh = new Sphere(1 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addSphereBody(mesh, mesh.radius, objectSize * 5)
          break
        case 2:
          mesh = new Box(new Vec3(1 + Math.random() * objectSize, 1 + Math.random() * objectSize, 1 + Math.random() * objectSize))
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addBoxBody(mesh, mesh.size, objectSize * 5)
          break
        case 3:
          mesh = new Cylinder(1 + Math.random() * objectSize, 2 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addCylinderBody(mesh, mesh.radius, mesh.height, objectSize * 5)
          break
        default:
          mesh = new Cone(1 + Math.random() * objectSize, 2 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addConeBody(mesh, mesh.radius, mesh.height, objectSize * 5)
          break
      }

      this.scene.add(mesh)
      this.physicsWorld.dynamicObjects.push(mesh)
      this.timeNextSpawn = time + this.objectTimePeriod
    }
    this.move()
    this.physicsWorld.update(delta)
    this.physicsWorld.updateDynamicObjectsModelPose()
    PhysicsWorld.setModelPose(this.model)
    this.controlCamera.controls.update()
    this.renderer.render(this.scene, this.controlCamera)
  }
}




