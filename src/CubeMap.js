/* global THREE: false */

export default class CubeMap {
  constructor (path, ext = '.jpg') {
    const urls = [
      path + 'px' + ext, path + 'nx' + ext,
      path + 'py' + ext, path + 'ny' + ext,
      path + 'pz' + ext, path + 'nz' + ext,
    ]
    const reflectionCube = new THREE.CubeTextureLoader().load(urls)
    reflectionCube.format = THREE.RGBFormat
    return reflectionCube
  }
}