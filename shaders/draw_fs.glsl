precision mediump float;
uniform sampler2D tex;
varying vec2 uv;
void main(void) {
	gl_FragColor = vec4(texture2D(tex, uv).rgb, 1);
}