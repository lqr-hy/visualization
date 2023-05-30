<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { onMounted, ref } from "vue"
import { CubeTextureLoader, Mesh, MeshDepthMaterial, MeshStandardMaterial, TextureLoader, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import pxTexture from './assets/textures/environmentMaps/0/px.jpg'
import nxTexture from './assets/textures/environmentMaps/0/nx.jpg'
import pyTexture from './assets/textures/environmentMaps/0/py.jpg'
import nyTexture from './assets/textures/environmentMaps/0/ny.jpg'
import pzTexture from './assets/textures/environmentMaps/0/pz.jpg'
import nzTexture from './assets/textures/environmentMaps/0/nz.jpg'
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import LeePerrySmithUrl from './assets/models/LeePerrySmith/LeePerrySmith.glb?url'
import normalUrl from './assets/models/LeePerrySmith/normal.jpg?url'
import colorUrl from './assets/models/LeePerrySmith/color.jpg?url'

const webgl = ref()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Material
const customUniforms = {
  uTime: {
    value: 0,
  },
}


const gltfLoader = new GLTFLoader()
const textureLoader = new TextureLoader()
const cubeTextureLoader = new CubeTextureLoader()

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -4)
scene.add(camera)

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
    ) {
      // 通过乘以环境贴图的颜色来缩放环境贴图的效果。
      child.material.envMapIntensity = 5
      // 表示物体需要更新
      child.material.needsUpdate = true

      // 打开阴影
      child.castShadow = true
      // 接受阴影
      child.receiveShadow = true
    }
  })
}

const environmentList = cubeTextureLoader.load([
  pxTexture,
  nxTexture,
  pyTexture,
  nyTexture,
  pzTexture,
  nzTexture
])

// 纹理编码格式
environmentList.encoding = THREE.sRGBEncoding
// 将场景中所有物理材质的环境贴图设置为 environmentList
scene.background = environmentList
// scene.environment = environmentList

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.rotation.y = Math.PI
plane.position.y = -5
plane.position.z = 5
scene.add(plane)

// Textures
const mapTexture = textureLoader.load(colorUrl)
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load(normalUrl)

const material = new MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture
})

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime
  // 旋转矩阵
  shader.vertexShader = shader.vertexShader.replace('#include <common>', `
    #include <common>
    uniform float uTime;
    mat2 get2DRotateMatrix(float _angle) {
      return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
    }
  `)
  // 对象顶点
  shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>',
      `
    #include <beginnormal_vertex>
    float angle = sin(position.y + uTime) * 0.2;
    mat2 rotateMatrix = get2DRotateMatrix(angle);
    objectNormal.xz = rotateMatrix * objectNormal.xz;`)
  // 旋转
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      `
    #include <begin_vertex>
    transformed.xz = rotateMatrix * transformed.xz;`)
}

const depthMaterial = new MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking
})

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime

  shader.vertexShader = shader.vertexShader.replace('#include <common>', `
    #include <common>
    uniform float uTime;
    mat2 get2DRotateMatrix(float _angle) {
      return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
    }
  `)

  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      `
    #include <begin_vertex>
    float angle = sin(position.y + uTime) * 0.2;
    mat2 rotateMatrix = get2DRotateMatrix(angle);
    transformed.xz = rotateMatrix * transformed.xz;`)
}

gltfLoader.load(LeePerrySmithUrl, (gltf: GLTF) => {
  const mesh = gltf.scene.children[0] as Mesh
  mesh.rotation.y = Math.PI * 0.5
  mesh.material = material
  mesh.customDepthMaterial = depthMaterial
  scene.add(mesh)

  updateAllMaterials()
})

const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value, antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.useLegacyLights = false
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  render()
}
const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()
  customUniforms.uTime.value = elapsedTime
  orbitControls.update()
  renderer.render(scene, camera)
  renderer.useLegacyLights = false
  requestAnimationFrame(render)
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth - 240
  sizes.height = window.innerHeight - 100

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

onMounted(() => {
  renderInit()
})
</script>

<style scoped>

</style>