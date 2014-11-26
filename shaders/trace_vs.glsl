attribute vec2 cVertex;//quad vetices
void main(void) {
	gl_Position =  vec4(cVertex, 0, 1.0);
}