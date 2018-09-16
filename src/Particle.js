/* global THREE: false */
import 'three/Particle'

export default class Particle {
  constructor (maxParticles = 100000, spawnRate = 1000, color = 0xaa88ff, position = new THREE.Vector3(), velocity = new THREE.Vector3(), size = 5, positionRandomness = 0.3, velocityRandomness = 0.5, colorRandomness = 0.2, turbulence = 0.5, lifetime = 2, sizeRandomness = 1) {
    this.maxParticles = maxParticles
    this.particleSystem = new THREE.GPUParticleSystem({
      maxParticles, // 最大パーティクル数
    })
    this.options = {
      position, // 位置
      positionRandomness, // 位置の分散
      velocity, // 速度
      velocityRandomness, // 速度の分散
      color, // 色
      colorRandomness, // 色の分散
      turbulence, // 乱気流
      lifetime, // 寿命
      size, // 大きさ
      sizeRandomness, // 大きさの分散
    }
    this.spawnerOptions = {
      spawnRate,  // 描画するパーティクル数
    }

    this.particleSystem.tick = 0
    this.particleSystem.simulate = this.simulate.bind(this)
    this.particleSystem.setParticle = this.setParticle.bind(this)
    return this.particleSystem
  }

  setParticle = ({spawnRate = 1000, color = 0xaa88ff, position = new THREE.Vector3(), velocity = new THREE.Vector3(), size = 5, positionRandomness = 0.3, velocityRandomness = 0.5, colorRandomness = 0.2, turbulence = 0.5, lifetime = 2, sizeRandomness = 1}) => {
    this.options = {
      position, // 位置
      positionRandomness, // 位置の分散
      velocity, // 速度
      velocityRandomness, // 速度の分散
      color, // 色
      colorRandomness, // 色の分散
      turbulence, // 乱気流
      lifetime, // 寿命
      size, // 大きさ
      sizeRandomness, // 大きさの分散
    }
    this.spawnerOptions = {
      spawnRate,  // 描画するパーティクル数
    }
  }

  simulate = (delta, position = new THREE.Vector3()) => {
    this.particleSystem.tick += delta
    if (this.particleSystem.tick < 0 || this.particleSystem.tick === Infinity) this.particleSystem.tick = 0
    if (delta > 0) {
      this.options.position.x = position.x
      this.options.position.y = position.y
      this.options.position.z = position.z
      for (let i = 0; i < this.spawnerOptions.spawnRate; i++) {
        // パーティクルの状態を更新する
        this.particleSystem.spawnParticle(this.options)
      }
    }
    // GPUレンダリング
    this.particleSystem.update(this.particleSystem.tick)
  }

}