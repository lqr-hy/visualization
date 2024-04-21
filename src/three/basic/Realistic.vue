<template>
  <canvas ref="webgl"/>
  <div class="loading-bar" ref="loading">
    <span>{{ progress }} %</span>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue"
import * as THREE from 'three'
import { LoadingManager, WebGLRenderer } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as Dat from 'dat.gui'
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import pxTexture from './assets/textures/environmentMaps/0/px.jpg'
import nxTexture from './assets/textures/environmentMaps/0/nx.jpg'
import pyTexture from './assets/textures/environmentMaps/0/py.jpg'
import nyTexture from './assets/textures/environmentMaps/0/ny.jpg'
import pzTexture from './assets/textures/environmentMaps/0/pz.jpg'
import nzTexture from './assets/textures/environmentMaps/0/nz.jpg'
import { gsap } from "gsap"

const webgl = ref()
const loading = ref()
const progress = ref(0)

/**
 * loader
 */
const loadingManager = new LoadingManager(
    () => {
      gsap.delayedCall(0.5, () => {
        gsap.to(overlayMartial.uniforms.uAlpha, { duration: 3, value: 0 })
        loading.value.classList.add('ended')
        loading.value.style.transform = ''
      })
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
      const progressRatio = itemsLoaded / itemsTotal
      progress.value = Math.floor(progressRatio * 100)
      loading.value.style.transform = `scaleX(${ progressRatio })`
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextures = new THREE.CubeTextureLoader(loadingManager)
const environmentList = cubeTextures.load([
  pxTexture,
  nxTexture,
  pyTexture,
  nyTexture,
  pzTexture,
  nzTexture
])

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100
}

const debugUIObject = {
  envMapIntensity: 5
}

const gui = new Dat.GUI()

/**
 * scene
 */
const scene = new THREE.Scene()
// 纹理编码格式
environmentList.encoding = THREE.sRGBEncoding
// 将场景中所有物理材质的环境贴图设置为 environmentList
scene.environment = environmentList
scene.background = environmentList

/**
 * carme
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100)
camera.position.set(5, 1, -4)
scene.add(camera)

/**
 * test sprere
 */
// const testSphere = new THREE.Mesh(
//     new THREE.SphereBufferGeometry(1, 32, 32),
//     new THREE.MeshStandardMaterial()
// )
// scene.add(testSphere)

/**
 * overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1)
const overlayMartial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1.0 }
  },
  vertexShader: `
    void main () {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;

    void main () {
      gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
    }
  `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMartial)
scene.add(overlay)

/**
 * light
 */
const directionalLight = new THREE.DirectionalLight('#fff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
scene.add(directionalLight)

// const directionLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionLightHelper)

gui.add(directionalLight, 'intensity').min(1).max(10).step(0.001).name('LightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('LightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('LightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('LightZ')

/**
 * modals
 */
gltfLoader.load('./models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf: GLTF) => {
  gltf.scene.scale.set(10, 10, 10)
  gltf.scene.position.set(0, -4, 0)
  gltf.scene.rotation.y = Math.PI * 0.5
  scene.add(gltf.scene)

  gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('FlightRotationY')

  updateAllMaterials()
})

/**
 * updateAllMaterials
 */
// 更新 模型里面的material
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // 这里可以使用 scene.environment 代替
      // child.material.envMap = environmentList
      // 通过乘以环境贴图的颜色来缩放环境贴图的效果。
      child.material.envMapIntensity = debugUIObject.envMapIntensity
      // 表示物体需要更新
      child.material.needsUpdate = true

      // 打开阴影
      child.castShadow = true
      // 接受阴影
      child.receiveShadow = true
    }
  })
}
gui.add(debugUIObject, 'envMapIntensity').min(0).max(10).step(0.001).name('envMapIntensity').onChange(updateAllMaterials)

/**
 * renderInit
 */
let renderer: WebGLRenderer, orbitControls: OrbitControls
const renderInit = () => {
  // 渲染器
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value, antialias: true })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // 渲染器输出编码格式
  renderer.outputEncoding = THREE.sRGBEncoding
  // 渲染色调
  renderer.toneMapping = THREE.NoToneMapping
  // 色调映射曝光度
  renderer.toneMappingExposure = 3
  // 打开阴影
  renderer.shadowMap.enabled = true
  gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  }).onFinishChange((e) => {
    // 改完之后需要吧物理的mesh 加更新
    renderer.toneMapping = Number(e)
    updateAllMaterials()
  })
  // 轨道控制器
  orbitControls = new OrbitControls(camera, renderer.domElement)
  // 惯性
  orbitControls.enableDamping = true
  // 渲染
  render()
}

/**
 * render
 */
const render = () => {
  // 更新轨道控制器
  orbitControls.update()
  // 渲染
  renderer.render(scene, camera)
  // 使用物理上正确的光照模式
  renderer.useLegacyLights = false
  requestAnimationFrame(render)
}
onMounted(() => {
  renderInit()
})

onUnmounted(() => {
  gui.destroy()
})
</script>

<style lang="less" scoped>
.loading-bar {
  position: absolute;
  top: 50%;
  width: 100%;
  height: 2px;
  background: #ffffff;
  transform: scaleX(0);
  transform-origin: top left;
  transition: transform 0.5s;
  will-change: transform;

  &.ended {
    transform-origin: top right;
    transition: transform 1.5s ease-in-out;
  }

  span {
    display: block;
    position: absolute;
    top: -30px;
    font-size: 36px;
    color: #ffffff;
    left: 20px;
  }
}
</style>