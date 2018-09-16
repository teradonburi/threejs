const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: ['babel-polyfill', './app.js'],
  output: {
    // 出力ファイル名
    filename: 'bundle.js',
  },
  resolve: {
    // 使用したいコントロールやレンダラを定義しておきます
    alias: {
      // 物体ドラッグ
      'three/DragControls': path.join(__dirname, 'node_modules/three/examples/js/controls/DragControls.js'),
      // カメラ制御
      'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
      // GLTF
      'three/GLTFLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/GLTFLoader.js'),
      // DracoLoader
      'three/Draco': path.join(__dirname, 'node_modules/three/examples/js/loaders/DRACOLoader.js'),
      // Particle
      'three/Particle': path.join(__dirname, 'node_modules/three/examples/js/GPUParticleSystem.js'),
      // Water
      'three/Water': path.join(__dirname, 'node_modules/three/examples/js/objects/Water.js'),
      // Sky
      'three/Sky': path.join(__dirname, 'node_modules/three/examples/js/objects/Sky.js'),
    },
    extensions: [
      '.js',
    ],
  },
  module: {
    rules: [
      {
        // 拡張子 .js の場合
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              cacheDirectory: true,
              presets: [
                [
                  '@babel/env', {
                    targets: {
                      browsers: [
                        '>0.25%',
                        'not ie 11',
                        'not op_mini all',
                      ],
                    },
                    modules: false,
                  },
                ],
              ],
              plugins: ['babel-plugin-transform-class-properties'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // THREE.Scene などの形式で three.js のオブジェクトを使用できるようにします。
    new webpack.ProvidePlugin({
      'THREE': 'three/build/three',
    }),
  ],
}
