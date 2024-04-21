<template>
  <canvas ref="webgl"></canvas>
</template>

<script lang="ts" setup>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { onMounted, onUnmounted, ref } from "vue";
import { AnimationMixer, WebGLRenderer } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

const webgl = ref();
const Gui = new dat.GUI();
let prePos = 0;
const sizes = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100,
};

// 场景
const scene = new THREE.Scene();

// 相机
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  100
);
camera.position.set(1, 3, 4);
// 相机看场景的位置
camera.lookAt(scene.position);
scene.add(camera);

/**
 * light
 */

const ambientLight = new THREE.AmbientLight("#fff", 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("#fff", 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: "#444444",
    metalness: 0,
    roughness: 0.5,
  })
);
plane.position.y = 0;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

/**
 * models
 */
// 用于性能优化 加载被压缩的资源 主要是为了加载很大的模型才使用
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
let mixer: AnimationMixer,
  playerMesh: THREE.Group,
  animations: THREE.AnimationClip[];
gltfLoader.load(
  "./models/Fox/glTF/Fox.gltf",
  (gltf) => {
    playerMesh = gltf.scene;
    //  模型太大了进行缩放
    playerMesh.scale.set(0.005, 0.005, 0.005);
    playerMesh.rotateY(Math.PI);
    animations = gltf.animations;
    scene.add(gltf.scene);

    mixer = startAnimation(
      playerMesh.children[0] as THREE.SkinnedMesh,
      animations,
      "Survey"
    );
    // 播放动画
    // mixer = new THREE.AnimationMixer(gltf.scene)
    // 获取剪辑动画
    // const action = mixer.clipAction(gltf.animations[1])
    // 播放动画
    // action.play()
  },
  () => {
    console.log("progress");
  },
  () => {
    console.log("error");
  }
);

let renderer: WebGLRenderer, orbitControls: OrbitControls;
const renderInit = () => {
  renderer = new THREE.WebGLRenderer({ canvas: webgl.value });
  // 轨道控制器
  orbitControls = new OrbitControls(camera, renderer.domElement);
  renderer.setSize(sizes.width, sizes.height);
  // 设置dpi
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // 渲染
  render();
};

const Clock = new THREE.Clock();
let previousTime = 0;
const render = () => {
  const elapsedTime = Clock.getElapsedTime();
  const deltaTimer = elapsedTime - previousTime;
  previousTime = elapsedTime;
  if (mixer) {
    mixer.update(deltaTimer);
  }
  // 更新矩阵
  orbitControls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

function startAnimation(
  skin: THREE.SkinnedMesh,
  animations: THREE.AnimationClip[],
  animationsName: string
) {
  const mixer = new THREE.AnimationMixer(skin);
  const clip = THREE.AnimationClip.findByName(animations, animationsName);
  if (clip) {
    const action = mixer.clipAction(clip);
    action.play();
  }
  return mixer;
}

window.addEventListener("mousemove", (e) => {
  if (prePos) {
    playerMesh.rotateY((prePos - e.clientX) * 0.01);
  }
  prePos = e.clientX;
});

let isRun = false;
onMounted(() => {
  renderInit();
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      playerMesh.translateZ(0.1);
      if (!isRun) {
        isRun = true;
        mixer = startAnimation(
          playerMesh.children[0] as THREE.SkinnedMesh,
          animations,
          "Run"
        );
      }
    } else if (e.key === "ArrowDown") {
      playerMesh.rotateY(Math.PI);
      console.log(camera.position);
    } else if (e.key === "ArrowLeft") {
      playerMesh.rotateY(Math.PI / 2);
    } else if (e.key === "ArrowRight") {
      // camera.position.x += 0.1
      playerMesh.rotateY(-Math.PI / 2);
    }
    camera.lookAt(playerMesh.position);
  });
});

onUnmounted(() => {
  Gui.destroy();
});
</script>

<style lang="less" scoped></style>
