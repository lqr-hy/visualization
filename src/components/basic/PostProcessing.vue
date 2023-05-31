<template>
  <canvas ref="webgl"/>
</template>

<script lang="ts" setup>
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from "vue"
import {
  CubeTextureLoader,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  TextureLoader, WebGLMultipleRenderTargets,
  WebGLRenderer,
  WebGLRenderTarget
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import pxTexture from './assets/textures/environmentMaps/0/px.jpg'
import nxTexture from './assets/textures/environmentMaps/0/nx.jpg'
import pyTexture from './assets/textures/environmentMaps/0/py.jpg'
import nyTexture from './assets/textures/environmentMaps/0/ny.jpg'
import pzTexture from './assets/textures/environmentMaps/0/pz.jpg'
import nzTexture from './assets/textures/environmentMaps/0/nz.jpg'
import interfaceNormalMap  from './assets/textures/interfaceNormalMap.png?url'
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import normalUrl from './assets/models/LeePerrySmith/normal.jpg?url'
import colorUrl from './assets/models/LeePerrySmith/color.jpg?url'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass"
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass"
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import * as DAT from 'dat.gui'

const webgl = ref()
const gui = new DAT.GUI()

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
scene.environment = environmentList

// Textures
const mapTexture = textureLoader.load(colorUrl)
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load(normalUrl)

const material = new MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture
})

gltfLoader.load(import.meta.env.BASE_URL + '/src/components/basic/assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf'
    , (gltf: GLTF) => {
  const mesh = gltf.scene.children[0] as Mesh
  mesh.scale.set(2, 2, 2)
  mesh.rotation.z = Math.PI * 1.4
  scene.add(mesh)

  updateAllMaterials()
})

const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, -2.25)
scene.add(directionalLight)

let renderer: WebGLRenderer, orbitControls: OrbitControls, effectComposer: EffectComposer, renderPass: RenderPass,
    displacementPass: ShaderPass
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

  let RenderTargetClass = null
  if (renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2) {
    RenderTargetClass = WebGLMultipleRenderTargets
  } else {
    RenderTargetClass = WebGLRenderTarget
  }

  const renderTarget = new RenderTargetClass(
      800, 600, 1, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        encoding: THREE.sRGBEncoding
      }
  )

  effectComposer = new EffectComposer(renderer, renderTarget)
  effectComposer.setSize(sizes.width, sizes.height)
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // 后期处理
  renderPass = new RenderPass(scene, camera)
  effectComposer.addPass(renderPass)

  const dotScreenPass = new DotScreenPass()
  dotScreenPass.enabled = false
  effectComposer.addPass(dotScreenPass)

  const glitchPass = new GlitchPass()
  glitchPass.goWild = false
  glitchPass.enabled = false
  effectComposer.addPass(glitchPass)

  const rgbShiftPass = new ShaderPass(RGBShiftShader)
  rgbShiftPass.enabled = false
  effectComposer.addPass(rgbShiftPass)


  const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.5, 0.4, 0.85)
  unrealBloomPass.radius = 1
  unrealBloomPass.threshold = 0.6
  unrealBloomPass.strength = 0.3
  effectComposer.addPass(unrealBloomPass)
  gui.add(unrealBloomPass, 'enabled')
  gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
  gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.001)
  gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)

  if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass(800, 600)
    effectComposer.addPass(smaaPass)
  }

  // Tine Pass
  const TineShader = {
    uniforms: {
      tDiffuse: { value: null },
      uTint: { value: null }
    },
    vertexShader: `
      varying vec2 vUv;
      void main () {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv=uv;
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec3 uTint;

      varying vec2 vUv;
      void main () {
        vec4 color = texture2D(tDiffuse, vUv);
        color.rgb += uTint;
        gl_FragColor = color;
      }
    `
  }
  const TinePass = new ShaderPass(TineShader)
  TinePass.uniforms.uTint.value = new THREE.Vector3()
  gui.add(TinePass.uniforms.uTint.value, 'x').min(-1).max(1).step(0.001).name('red')
  gui.add(TinePass.uniforms.uTint.value, 'y').min(-1).max(1).step(0.001).name('green')
  gui.add(TinePass.uniforms.uTint.value, 'z').min(-1).max(1).step(0.001).name('blue')
  effectComposer.addPass(TinePass)


  const DisplacementShader = {
    uniforms: {
      tDiffuse: { value: null },
      uNormalMap: { value: null}
      // uTime: { value: null }
    },
    vertexShader: `
      varying vec2 vUv;
      void main () {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv=uv;
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D uNormalMap;
      // uniform float uTime;

      varying vec2 vUv;
      void main () {
        // vec2 newVuv = vec2(vUv.x, vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1);
        vec3 normalMapColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        vec2 newVuv = vUv + normalMapColor.xy * 0.1;
        vec4 color = texture2D(tDiffuse, newVuv);

        vec3 lightDirection = normalize(vec3(- 1.0, 1.0, 0.0));
        float lightness = clamp(dot(normalMapColor, lightDirection), 0.0, 1.0);
        color.rgb += lightness * 2.0;

        gl_FragColor = color;
      }
    `
  }
  displacementPass = new ShaderPass(DisplacementShader)
  // displacementPass.uniforms.uTime.value = 0
  displacementPass.uniforms.uNormalMap.value = textureLoader.load(interfaceNormalMap)
  displacementPass.enabled = false
  gui.add(displacementPass, 'enabled')
  effectComposer.addPass(displacementPass)

  render()
}

const Clock = new THREE.Clock()
const render = () => {
  const elapsedTime = Clock.getElapsedTime()
  // customUniforms.uTime.value = elapsedTime
  // displacementPass.uniforms.uTime.value = elapsedTime
  orbitControls.update()

  // renderer.render(scene, camera)
  effectComposer.render()

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


  effectComposer.setSize(sizes.width, sizes.height)
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style scoped>

</style>