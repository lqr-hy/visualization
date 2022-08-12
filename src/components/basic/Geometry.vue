<template>
  <canvas ref="webgl" />
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const webgl = ref()

// 创建场景
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth - 260,
  height: window.innerHeight - 100
}

// 相机
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// const cube = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)

const geometry = new THREE.BufferGeometry()

const count = 50
const vertices = new Float32Array(50 * 3 * 3)
for (let i = 0; i < 50 * 3 * 3; i++) {
  for (let j = 0; j < 3; j++) {
    vertices[i] = (Math.random() - 0.5) * 4
  }
  geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
}

const meshMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000',
  wireframe: true
})

const mesh = new THREE.Mesh(geometry, meshMaterial)

scene.add(mesh)

let renderer, orbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
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

