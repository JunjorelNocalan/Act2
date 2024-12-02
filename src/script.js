import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg');

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
scene.add(ambientLight);

// Spot light
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.position.set(0, 2, 2);
scene.add(spotLight);
scene.add(spotLight.target);
spotLight.castShadow = false;

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
scene.add(directionalLight);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 0.3);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
scene.add(pointLight);

/**
 * Materials
 */
const sphereMaterial = new THREE.MeshStandardMaterial();
sphereMaterial.roughness = 0.7;
sphereMaterial.color.set(0x800080); // Purple
gui.add(sphereMaterial, 'metalness').min(0).max(1).step(0.001);
gui.add(sphereMaterial, 'roughness').min(0).max(1).step(0.001);

const planeMaterial = new THREE.MeshStandardMaterial();
planeMaterial.roughness = 0.7;
planeMaterial.color.set(0xffffff);
gui.add(planeMaterial, 'metalness').min(0).max(1).step(0.001);
gui.add(planeMaterial, 'roughness').min(0).max(1).step(0.001);

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    sphereMaterial
);
sphere.castShadow = true;

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    planeMaterial
);
plane.receiveShadow = true;
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, alphaMap: simpleShadow })
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.01;

scene.add(sphere, sphereShadow, plane);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update the sphere
    sphere.position.x = Math.cos(elapsedTime) * 1.5;
    sphere.position.z = Math.sin(elapsedTime) * 1.5;
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));

    // Update the shadow
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
