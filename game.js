import Render from './src/Render'
import Scene from './src//Scene'
import Clock from './src//Clock'
import Vector3 from './src//Vector3'
import Axis from './src//Axis'
import Grid from './src//Grid'
import Camera from './src//Camera'
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
    // レンダラー作成
    this.renderer = new Render(this.onResize)
    // 物理世界作成
    this.physicsWorld = new PhysicsWorld()

    // カメラ
    const eye = new Vector3(50, 50, 150)
    const lookAt = new Vector3(0, 0, 0)
    this.camera = new Camera(eye, lookAt)
    this.scene.add(this.camera)
    this.scene.add(this.camera.getHelper())

    // コントロールカメラ
    const debugEye = new Vector3(100, 200, 200)
    const debugLookAt = new Vector3(0, 0, 0)
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

    /*
    this.SkinnedMesh = new SkinnedMesh(
      await this.loader.loadTexture('../model/fox.png'),
      await this.loader.loadJsonModel('../model/fox.json')
    )
    // this.SkinnedMesh.position.set(0, 0, 0)
    // this.SkinnedMesh.scale.set(5, 5, 5)
    this.SkinnedMesh.actions[1].play()
    this.scene.add(this.SkinnedMesh)
    //this.physicsWorld.addRigidBody(this.SkinnedMesh.userData.physicsBody)
    */

    const gltf = await this.loader.loadGLTFModel('./model/CesiumMan.gltf')
    this.model = new GLTFModel(gltf)
    this.model.position.set(50, 10, 0)
    this.model.scale.set(5, 5, 5)
    this.model.actions[0].play()
    this.scene.add(this.model)
    // this.physicsWorld.addRigidBody(this.model.userData.physicsBody)

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

    const cameras = [this.camera, this.controlCamera]
    for (let camera of cameras) {
      camera.resize()
    }
  }

  render = () => {
    const {delta, time} = this.clock.update()
    this.model.mixer && this.model.mixer.update(delta)

    if (this.physicsWorld.dynamicObjects.length < 5 && time > this.timeNextSpawn) {
      const objectType = Math.ceil(Math.random() * 4)
      let mesh = null
      const initPos = new Vector3(0, 100, 0)
      const objectSize = 3
      switch (objectType) {
        case 1:
          mesh = new Sphere(1 + Math.random() * objectSize)
          mesh.position.set(initPos.x, initPos.y, initPos.z)
          this.physicsWorld.addSphereBody(mesh, mesh.radius, objectSize * 5)
          break
        case 2:
          mesh = new Box(new Vector3(1 + Math.random() * objectSize, 1 + Math.random() * objectSize, 1 + Math.random() * objectSize))
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
    this.physicsWorld.update(delta)
    this.physicsWorld.updateDynamicObjectsModelPose()
    // this.model.updatePhysics()
    this.controlCamera.controls.update()
    this.renderer.render(this.scene, this.controlCamera)
  }
}




