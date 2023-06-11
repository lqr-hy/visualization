<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WebGLRenderer } from 'three'
import colorImage from '../basic/assets/textures/door/color.jpg'
// import alphaImage from '../basic/assets/textures/door/alpha.jpg'
// import ambientOcclusionImage from '../basic/assets/textures/door/ambientOcclusion.jpg'
// import heightImage from '../basic/assets/textures/door/height.jpg'
// import metalnessImage from '../basic/assets/textures/door/metalness.jpg'
// import normalImage from '../basic/assets/textures/door/normal.jpg'
// import roughnessImage from '../basic/assets/textures/door/roughness.jpg'


const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

window.addEventListener('resize', () => {
  // 更新sizes大小
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  // 更新相机 摄像机视锥体的长宽比
  camera.aspect = sizes.width / sizes.height
  // 更新相机矩阵
  camera.updateProjectionMatrix()

  // 更新渲染器
  renderer.setSize(sizes.width, sizes.height)
  // 更新分辨率
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('dblclick', () => {
  // 全屏
  const fullscreenElement = document.fullscreenElement
  if (!fullscreenElement) {
    if (renderer.domElement.requestFullscreen) {
      renderer.domElement.requestFullscreen()
    }
  } else {
    document.exitFullscreen()
  }
})

// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)


// loader管理
const loaderManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loaderManager)

loaderManager.onStart = () => { console.log('onStart') }
loaderManager.onLoad = () => { console.log('onLoad') }
loaderManager.onProgress = () => { console.log('onProgress') }
loaderManager.onError = () => { console.log('onError') }

const texture = textureLoader.load(colorImage)

// texture.repeat.x = 2
// texture.repeat.y = 2

// 镜像
// texture.wrapS = THREE.MirroredRepeatWrapping
// texture.wrapT = THREE.MirroredRepeatWrapping

// 移动位置
// texture.offset.x = 0.5

// 旋转
// texture.rotation = Math.PI * 0.25

// 设置中心点
// texture.center.x = 0.5
// texture.center.y = 0.5


texture.minFilter = THREE.NearestFilter


const cube = new THREE.BoxBufferGeometry(1, 1, 1)
const meshMaterial = new THREE.MeshBasicMaterial({
  // color: '#ff0000',
  map: texture
})
const mesh = new THREE.Mesh(cube, meshMaterial)

scene.add(mesh)

let renderer: WebGLRenderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

const render = () => {
  orbitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})
</script>

<style lang="less" scoped>
</style>

