<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WebGLRenderer } from 'three'
// import FontJson from './assets/fonts/helvetiker_regular.typeface.json'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import matCapsImage from './assets/textures/matcaps/1.png'

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

// textLoader
const textLoader = new THREE.TextureLoader()
const matCapTexture = textLoader.load(matCapsImage)

// loaderText
const fontLoader = new FontLoader()
fontLoader.load('./fonts/helvetiker_regular.typeface.json', (font) => {
  const textGeometry = new TextGeometry('Hello three.js!', {
    font: font,
    size: 0.5,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  })

  // textGeometry.computeBoundingBox()

  // textGeometry.translate(
  //   -(textGeometry.boundingBox.max.x - 0.02) * 0.5,
  //   -(textGeometry.boundingBox.max.y - 0.02) * 0.5,
  //   -(textGeometry.boundingBox.max.z - 0.03) * 0.5
  // )
  // console.log(textGeometry.boundingBox)

  // 等于center
  textGeometry.center()

  // const textMaterial = new THREE.MeshBasicMaterial()
  const material = new THREE.MeshMatcapMaterial({ matcap: matCapTexture })
  const text = new THREE.Mesh(textGeometry, material)
  scene.add(text)

  const torusGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)

  for (let index = 0; index < 100; index++) {
    const donut = new THREE.Mesh(torusGeometry, material)

    donut.position.x = (Math.random() - 0.5) * 10
    donut.position.y = (Math.random() - 0.5) * 10
    donut.position.z = (Math.random() - 0.5) * 10

    donut.rotation.x = Math.random() * Math.PI
    donut.rotation.y = Math.random() * Math.PI

    const scale = Math.random()
    donut.scale.set(scale, scale, scale)

    scene.add(donut)
  }
})

// axes
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

// const cube = new THREE.BoxGeometry(1, 1, 1)
// const meshMaterial = new THREE.MeshBasicMaterial({
//   color: '#ff0000'
// })
// cube.computeBoundingBox()
// console.log(cube.boundingBox)
// const mesh = new THREE.Mesh(cube, meshMaterial)

// scene.add(mesh)

let renderer: WebGLRenderer, orbitControls: OrbitControls
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

