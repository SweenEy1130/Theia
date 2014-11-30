varying vec3 worldPosition;
varying vec2 vUv;

void main(){
    vUv = uv;
    worldPosition = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}