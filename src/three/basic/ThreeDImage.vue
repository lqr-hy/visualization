<template>
  <canvas ref="canvas"></canvas>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GirlImage from "./assets/image/girl.jpg";
import GirlDepthImage from "./assets/image/girl_depth.png";

const canvas = ref<HTMLCanvasElement | null>(null);

const scene = new THREE.Scene();
const size = {
  width: window.innerWidth - 240,
  height: window.innerHeight - 100,
};
const camera = new THREE.PerspectiveCamera(
  75,
  size.width / size.height,
  0.1,
  1000
);
camera.position.set(0, 0, 6);

const cameraGroup = new THREE.Group();

cameraGroup.add(camera);

scene.add(cameraGroup);

onMounted(() => {
  rendererInit();
});

const texture = new THREE.TextureLoader().load(GirlImage);
const textureDepth = new THREE.TextureLoader().load(GirlDepthImage);

const geometry = new THREE.PlaneGeometry(19.2, 12);
// const material = new THREE.MeshBasicMaterial({ map: texture });

// 鼠标坐标
const mouse = new THREE.Vector2();
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: texture },
    uDepthTexture: { value: textureDepth },
    uMouse: { value: mouse },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform sampler2D uDepthTexture;
    uniform vec2 uMouse;
    varying vec2 vUv;
    uniform float uTime;
    void main() {
      vec4 textureColor = texture2D(uTexture, vUv);
      vec4 depthColor = texture2D(uDepthTexture, vUv);
      float depth = depthColor.r;
      float x = vUv.x + (uMouse.x + sin(uTime)) * 0.01 * depth;
      float y = vUv.y + (uMouse.y + cos(uTime)) * 0.01 * depth;
      vec4 newColor = texture2D(uTexture, vec2(x, y));
      gl_FragColor = newColor;
    }
  `,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

let renderer: THREE.WebGLRenderer, obitControls: OrbitControls;
const rendererInit = () => {
  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value as HTMLCanvasElement,
    antialias: true,
  });
  renderer.setSize(size.width, size.height);
  // obitControls = new OrbitControls(camera, renderer.domElement);
  // obitControls.enableDamping = true;
  animate();
};

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / size.width) * 2 + 1;
  mouse.y = (e.clientY / size.height) * 2 + 1;
});

const animate = () => {
  material.uniforms.uMouse.value = mouse;
  material.uniforms.uTime.value = performance.now() / 1000;
  requestAnimationFrame(animate);
  // obitControls.update();
  renderer.render(scene, camera);
};
</script>
<style lang="less" scoped>
</style>