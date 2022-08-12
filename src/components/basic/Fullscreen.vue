<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { WebGLRenderer } from 'three'

const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 260,
  height: window.innerHeight - 100
}

window.addEventListener('resize', () => {
  // 更新sizes大小
  sizes.width = window.innerWidth - 260
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

const cube = new THREE.BoxGeometry(1, 1, 1)
const meshMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
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

