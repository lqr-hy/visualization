<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted,  ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'

const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

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

let renderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}

// // Time
// let timer = Date.now()

// const render = () => {
//   orbitControls.update()
//   const currentTime = Date.now()
//   const deltaTime = currentTime - timer
//   timer = currentTime

//   mesh.rotation.y += 0.001 * deltaTime

//   renderer.render(scene, camera)
//   requestAnimationFrame(render)
// }

// Clock
// const Clock = new THREE.Clock()

gsap.to(mesh.position, { duration: 2, delay: 1, x: 2 })

const render = () => {
  orbitControls.update()
  // const elapsedTime = Clock.getElapsedTime()
  // // mesh.position.y = Math.sin(elapsedTime)
  // // mesh.position.x = Math.cos(elapsedTime)
  // camera.position.y = Math.sin(elapsedTime)
  // camera.position.x = Math.cos(elapsedTime)
  // camera.lookAt(mesh.position)

  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

onMounted(() => {
  renderInit()
})
</script>

<style lang="less" scoped>
</style>

