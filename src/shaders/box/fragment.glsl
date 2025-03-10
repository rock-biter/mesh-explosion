uniform float uProgress;

varying vec3 vNormal;
varying vec3 vWNormal;
varying vec3 vWPosition;

void main() {

  float light = dot(normalize(vWPosition),normalize(vWNormal)); // -1 | 1.
  light = min(light, 0.); // -1 | 0.
  light = abs(light);
  light = smoothstep(0.,0.4,light);
  light *= 1. - smoothstep(0.,2.,length(vWPosition * uProgress * 0.5)) * 0.7;


  vec3 dirLight = vec3(0.5,2.,1.);

  vec3 baseColor = vec3(1.0,0.0,0.1) * clamp(0.,1.,dot(normalize(dirLight),normalize(vWNormal)));
  baseColor = max(baseColor, vec3(0.05,0,0.05));
  // baseColor = mix(baseColor,vec3(0,0.,0.),clamp(0.,0.8,length(vWPosition * uProgress * 0.5)));
  vec3 lightColor = vec3(0., 0.0, 0.25) * 2.;
  vec3 color = mix(baseColor, lightColor, light);

  float fog = distance(vec3(0.0),vWPosition);
  fog = smoothstep(2.,8.,fog);
  color = mix(color, vec3(0),fog);

  float dith = sin(gl_FragCoord.x * 1.3) * 0.02 + cos(gl_FragCoord.y * 1.3) * 0.02;
  color += mix(vec3(0),vec3(dith), 1. - fog);

  gl_FragColor = vec4(color,1.);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>
}