uniform float uProgress;
uniform float uDistance;

mat3 rotationMatrix(float alpha, vec3 axis) {
  axis = normalize(axis); // Normalizza l'asse di rotazione
  float s = sin(alpha);
  float c = cos(alpha);
  float oc = 1.0 - c;

  return mat3(
    oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.x * axis.z + axis.y * s,
    oc * axis.y * axis.x + axis.z * s, oc * axis.y * axis.y + c,         oc * axis.y * axis.z - axis.x * s,
    oc * axis.z * axis.x - axis.y * s, oc * axis.z * axis.y + axis.x * s,  oc * axis.z * axis.z + c
  );
}

varying vec3 vNormal;

void main() {

  float PI = 3.14159;

  vec4 center = modelMatrix * vec4(0.,0.,0.,1.);
  vec3 axe = normalize( cross(max(vec3(0.01),center.xyz), vec3(0,1,0)));

  mat3 rotation =  rotationMatrix(uProgress * PI * sign(center.y), axe);
  vec3 pos = rotation * position;
  vNormal = rotation * (modelMatrix * vec4(normal,0.0)).xyz;

  vec3 offset = center.xyz * uProgress * uDistance;
  vec4 wPosition = modelMatrix * vec4(pos, 1.0);

  float hFactor = 2. * (1. - smoothstep(0., 1., abs(center.y)));

  offset *= vec3(hFactor,1.,hFactor);

  wPosition.xyz += offset;

  gl_Position = projectionMatrix * viewMatrix * wPosition;
}