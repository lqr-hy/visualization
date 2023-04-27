<template>
  <canvas ref="webgl"/>
</template>
<script lang="ts" setup>
import * as THREE from 'three'
import { TextureLoader, WebGLRenderer } from 'three'
import { onMounted, onUnmounted, ref } from "vue"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'
import { GUI } from "dat.gui"
import fileImage from './assets/textures/flag-china.jpg'

const webgl = ref()
const gui = new GUI()

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100)
camera.position.set(0, 0, 2)
scene.add(camera)

const textureLoader = new TextureLoader()
const flagImage = textureLoader.load(fileImage)

const geometry = new THREE.PlaneBufferGeometry(2, 2, 32, 32)

const count = geometry.attributes.position.count
const randoms = new Float32Array(count)

for (let i = 0; i < randoms.length; i++) {
  randoms[i] = Math.random()
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

const meshMaterial = new THREE.RawShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('orange') },
    uTexture: { value: flagImage }
  }
})
const plane = new THREE.Mesh(
    geometry,
    meshMaterial
)
gui.add(meshMaterial.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.001).name('uFrequencyX')
gui.add(meshMaterial.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.001).name('uFrequencyY')
// gui.addColor(meshMaterial.uniforms.uColor, 'value').onFinishChange()
scene.add(plane)

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value })

  renderer.setSize(sizes.width, sizes.height)

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  orbitControls = new OrbitControls(camera, renderer.domElement)

  render()
}

const Clock = new THREE.Clock()
const render = () => {
  meshMaterial.uniforms.uTime.value = Clock.getElapsedTime()

  orbitControls.update()

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