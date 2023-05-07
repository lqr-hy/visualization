<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from "vue"
import * as Dat from 'dat.gui'
import { WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import vertexShader from './shaderPatterns/vertex.glsl'
import fragmentShader from './shaderPatterns/fragment.glsl'

const webgl = ref()
const gui = new Dat.GUI()

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100,
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 1000)
camera.position.set(1, 0.5, 2)
scene.add(camera)

const plane = new THREE.PlaneBufferGeometry(2, 2, 32, 32)
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
})
const planeMesh = new THREE.Mesh(plane, material)
scene.add(planeMesh)


let renderer: WebGLRenderer, orBitControls: OrbitControls

const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orBitControls = new OrbitControls(camera, renderer.domElement)
  orBitControls.enableDamping = true
  render()
}

const render = () => {
  orBitControls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}


onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style scoped>

</style>