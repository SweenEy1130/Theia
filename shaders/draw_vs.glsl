attribute vec2 cVertex;//quad vetices
varying vec2 uv; 
void main(void) {
	gl_Position =  vec4(cVertex, 0, 1.0);
	uv = (cVertex + 1.)/2.;
}