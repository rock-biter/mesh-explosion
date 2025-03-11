varying vec3 vNormal;

void main() {

  vec3 color = vec3(vNormal * 0.5 + 0.5);

  gl_FragColor = vec4(color,1.);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>
}