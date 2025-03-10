import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
// __controls_import__
// __gui_import__

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Pane } from 'tweakpane'
import fragmentShader from './shaders/box/fragment.glsl'
import vertexShader from './shaders/box/vertex.glsl'
import gsap from 'gsap'
import { lerp } from 'three/src/math/MathUtils.js'

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
		// gsap.to(material.uniforms.uProgress, { value: ev.value, duration: 0.5 })
		// // console.log(ev.value)
		// box.visible = ev.value === 0
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

scene.add(
	new THREE.Mesh(
		new THREE.IcosahedronGeometry(0.3, 2),
		new THREE.MeshBasicMaterial({ color: new THREE.Color(0.0, 0.0, 0.4) })
	)
)

const gltfLoader = new GLTFLoader()
gltfLoader.load('/models/prova-fraction.glb', (gltf) => {
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

/**
 * OrbitControls
 */
// __controls__
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 8

/**
 * Three js Clock
 */
// __clock__
const clock = new THREE.Clock()

const renderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
	format: THREE.RGBAFormat,
	stencilBuffer: false,
	depthBuffer: true,
})

const RTScene = new THREE.Scene()
const RTGeometry = new THREE.BufferGeometry()
RTGeometry.setAttribute(
	'position',
	new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2)
)

const RTMaterial = new THREE.ShaderMaterial({
	vertexShader: /* glsl */ `
	void main() {
		gl_Position = vec4(position.xy,1.0,1.0);
	}
	`,
	fragmentShader: /* glsl */ `
		uniform vec2 uResolution;
		uniform sampler2D uScene;
	
		void main() {
			vec2 uv = gl_FragCoord.xy / uResolution.xy;
			vec2 texel = 1.0 / uResolution.xy;

			vec3 lightColor = vec3(0., 0., 0.25) * 2.;

			
			vec3 color = texture(uScene,uv).rgb;
			float div = 1.;
			vec2 dir = normalize(vec2(0.5) - uv);

			for(int i = 0; i < 40; i++) {
				vec2 uvMap = uv + vec2(i) * texel * dir * 6.;
				vec3 colorMap = texture(uScene,uvMap).rgb;
				float f = max(0.0,0.6 - distance(lightColor,colorMap) - float(i) / 25.);
				f = smoothstep(0.,1.,f);
				color += colorMap * f;
				div += f;
			}

			color /= div;

  		float dith = sin(gl_FragCoord.x * 1.2) * 0.06 + cos(gl_FragCoord.y * 1.2) * 0.06;
			// color += dith;


			gl_FragColor = vec4(color,1.0);

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
		}
	`,
	uniforms: {
		uResolution: { value: new THREE.Vector2(0) },
		uScene: { value: renderTarget.texture },
	},
})

const RTMesh = new THREE.Mesh(RTGeometry, RTMaterial)
RTScene.add(RTMesh)

handleResize()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	const dt = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	// __controls_update__
	controls.update(dt)

	material.uniforms.uProgress.value = lerp(
		material.uniforms.uProgress.value,
		config.progress,
		dt * 3
	)

	box.visible = material.uniforms.uProgress.value <= 0.01

	renderer.setRenderTarget(renderTarget)
	renderer.render(scene, camera)
	renderer.setRenderTarget(null)
	renderer.render(RTScene, camera)

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
	renderTarget.setSize(sizes.width, sizes.height)

	renderer.getDrawingBufferSize(RTMaterial.uniforms.uResolution.value)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
