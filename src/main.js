import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import fragmentShader from './shaders/box/fragment.glsl'
import vertexShader from './shaders/box/vertex.glsl'

/**
 * Debug
 */
// __gui__
const config = {
	progress: 0,
	distance: 7,
}
const pane = new Pane()

pane
	.addBinding(config, 'progress', {
		min: 0,
		max: 1,
		step: 0.01,
	})
	.on('change', (ev) => {
		material.uniforms.uProgress.value = ev.value
		console.log(ev.value)
		box.visible = ev.value === 0
	})

pane
	.addBinding(config, 'distance', {
		min: 1,
		max: 10,
		step: 0.05,
	})
	.on('change', (ev) => {
		material.uniforms.uDistance.value = ev.value
	})

/**
 * Scene
 */
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xdedede)

const material = new THREE.ShaderMaterial({
	fragmentShader,
	vertexShader,
	uniforms: {
		uProgress: { value: config.progress },
		uDistance: { value: config.distance },
	},
})

const box = new THREE.Mesh(new THREE.BoxGeometry(2.01, 2.01, 2.01), material)
// box.position.set(0.5, 0, 0)
scene.add(box)

const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/fractured-cube.glb', (gltf) => {
	console.log(gltf)

	gltf.scene.traverse((el) => {
		if (el instanceof THREE.Mesh) {
			el.material = material
		}
	})

	scene.add(gltf.scene)
})

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(4, 4, 8)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
// __helper_axes__
// const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
})
document.body.appendChild(renderer.domElement)
handleResize()

/**
 * OrbitControls
 */
// __controls__
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Three js Clock
 */
// __clock__
// const clock = new THREE.Clock()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	// const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	// __controls_update__
	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height

	// camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
