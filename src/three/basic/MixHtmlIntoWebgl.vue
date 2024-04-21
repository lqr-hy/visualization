<template>
  <canvas ref="webgl" />
  <div class="point point-0">
    <div class="label">1</div>
    <div class="text">look at the helmet</div>
  </div>
  <div class="point point-1">
    <div class="label">2</div>
    <div class="text">look at the helmet</div>
  </div>
  <div class="point point-2">
    <div class="label">3</div>
    <div class="text">look at the helmet</div>
  </div>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { onMounted, reactive, ref } from "vue";
import { CubeTextureLoader, Mesh, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import pxTexture from "./assets/textures/environmentMaps/0/px.jpg";
import nxTexture from "./assets/textures/environmentMaps/0/nx.jpg";
import pyTexture from "./assets/textures/environmentMaps/0/py.jpg";
import nyTexture from "./assets/textures/environmentMaps/0/ny.jpg";
import pzTexture from "./assets/textures/environmentMaps/0/pz.jpg";
import nzTexture from "./assets/textures/environmentMaps/0/nz.jpg";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const points = reactive<
  {
    position: THREE.Vector3;
    element: HTMLElement;
  }[]
>([]);
const webgl = ref();

const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100,
};

const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new CubeTextureLoader();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 1, -4);
scene.add(camera);

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // 通过乘以环境贴图的颜色来缩放环境贴图的效果。
      child.material.envMapIntensity = 5;
      // 表示物体需要更新
      child.material.needsUpdate = true;

      // 打开阴影
      child.castShadow = true;
      // 接受阴影
      child.receiveShadow = true;
    }
  });
};

const environmentList = cubeTextureLoader.load([
  pxTexture,
  nxTexture,
  pyTexture,
  nyTexture,
  pzTexture,
  nzTexture,
]);

// 纹理编码格式
environmentList.encoding = THREE.sRGBEncoding;
// 将场景中所有物理材质的环境贴图设置为 environmentList
scene.background = environmentList;
scene.environment = environmentList;

gltfLoader.load(
  "./models/DamagedHelmet/glTF/DamagedHelmet.gltf",
  (gltf: GLTF) => {
    gltf.scene.scale.set(2.5, 2.5, 2.5);
    gltf.scene.rotation.y = Math.PI * 0.5;
    scene.add(gltf.scene);

    updateAllMaterials();
  }
);

const rayCaster = new THREE.Raycaster();

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 2, -2.25);
scene.add(directionalLight);

let renderer: WebGLRenderer, orbitControls: OrbitControls;
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value, antialias: true });
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  render();
};

// 创建一个ArrowHelper对象，它的方向是射线的方向
const arrowHelper = new THREE.ArrowHelper(
  rayCaster.ray.direction,
  rayCaster.ray.origin,
  10,
  0xff0000
);
scene.add(arrowHelper);

// 添加场景富辅助线
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// 更新ArrowHelper的位置和方向
function updateArrowHelper() {
  arrowHelper.position.copy(rayCaster.ray.origin);
  arrowHelper.setDirection(rayCaster.ray.direction);
}

const render = () => {
  orbitControls.update();
  updateArrowHelper();
  for (const point of points) {
    const screenPosition = point.position.clone();
    screenPosition.project(camera);

    // 通过摄像机和鼠标位置更新射线
    rayCaster.setFromCamera(screenPosition, camera);
    // // 获取与射线相交的物体
    const intersects = rayCaster.intersectObjects(scene.children, true);
    // console.log(intersects);  // 输出相交的物体
    if (intersects.length === 0) {
      point.element.classList.remove("visible");
    } else {
      //   // Get the distance of the intersection and the distance of the point
      const intersectionDistance = intersects[0].distance;
      const pointDistance = point.position.distanceTo(camera.position);
      // console.log(pointDistance, 'pointDistance', point.position, intersectionDistance);
      // Intersection is close than the point
      if (intersectionDistance < pointDistance) {
        // Hide
        point.element.classList.remove("visible");
      }
      // Intersection is further than the point
      else {
        // Show
        point.element.classList.add("visible");
      }
    }

    const translateX = sizes.width * screenPosition.x * 0.5;
    const translateY = -sizes.height * screenPosition.y * 0.5;
    point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth - 240;
  sizes.height = window.innerHeight - 100;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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

onMounted(() => {
  points.push(
    {
      position: new THREE.Vector3(1.24, 0.6, -0.4),
      element: document.querySelector(".point-0") as HTMLElement,
    },
    {
      position: new THREE.Vector3(0.5, 0.8, - 1.55),
      element: document.querySelector(".point-1") as HTMLElement,
    },
    {
      position: new THREE.Vector3(1.6, - 1.3, - 0.7),
      element: document.querySelector(".point-2") as HTMLElement,
    }
  );
  console.log(points);
  renderInit();
});
</script>

<style lang="less" scoped>
.point {
  position: absolute;
  top: calc((100% + 90px) / 2);
  left: calc((100% + 230px) / 2);
  color: #fff;

  &:hover {
    .text {
      opacity: 1;
      transition: opacity 0.3s;
    }
  }

  &.visible {
    .label {
      transform: scale(1, 1);
    }
  }

  .text {
    position: absolute;
    top: 30px;
    left: -120px;
    width: 200px;
    padding: 20px;
    border-radius: 4px;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    line-height: 1.3em;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 100;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .label {
    position: absolute;
    top: -20px;
    left: -20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    font-family: Helvetica, Arial, sans-serif;
    text-align: center;
    line-height: 40px;
    font-weight: 100;
    font-size: 14px;
    cursor: help;
    transform: scale(0, 0);
    transition: transform 0.3s;
  }
}
</style>