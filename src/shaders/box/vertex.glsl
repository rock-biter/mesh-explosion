
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
varying vec3 vWNormal;
varying vec3 vWPosition;

void main() {

  vec3 pos = position;

  vec4 center = modelMatrix * vec4(0.,0.,0., 1.0);
  vec3 axe = normalize(cross(max(vec3(0.01),center.xyz), vec3(0.,1.,0))); 

  mat3 rotation = rotationMatrix(uProgress * 3.14159 * sign(center.y), axe);
  pos = rotation * pos;
  vNormal = (modelViewMatrix * vec4(rotation * normal,0.0)).rgb;
  vWNormal = (modelMatrix * vec4(rotation * normal,0.0)).rgb;

  vec4 wPosition = modelMatrix * vec4(pos, 1.0);
  
  vec3 offset = center.xyz * uProgress * uDistance;
  float hFactor = 2. * (1. - smoothstep(0.,1.,abs(center.y)));
  offset *= vec3(hFactor,1.,hFactor);
  wPosition.xyz += offset;

  vWPosition = wPosition.xyz;
  // vec4 offset = modelMatrix * vec4(vec3(0.), 1.0);
  // offset *= uProgress * uDistance;

  // wPosition += offset * 1.;

  gl_Position = projectionMatrix * viewMatrix * wPosition;
}