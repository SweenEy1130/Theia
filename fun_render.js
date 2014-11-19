var Camera = {
	pos : [0, 0, -10],//camera(eye) position
	lookat : [0, 0, 1],//lookat direction
	up : [0, 1, 0],//up vector
	offset : [0, 0, 0],//camera position offset
	rotate : [0, 0, 0],//lookat direction rotate degrees
	rotv : [0, 0, 0],
	fov : 65,//field of view, y axis
	ratio : 1,
	rtrans : null,//translate eye ray from camera space to word space
	getRTrans : function ()
	{
		var f = Uti.normalize(this.lookat);
		var u = this.up;
		
		var r = Uti.crossProduct(u, f);
		u = Uti.crossProduct(f, r);
		
		u = Uti.normalize(u);
		r = Uti.normalize(r);

		this.rtrans = [
		[ r[0], u[0], f[0] ],
		[ r[1], u[1], f[1] ],
		[ r[2], u[2], f[2] ]
		];
	},
};
var Render = {
	program : null,
	texture : null,
	time : 0,
	getShaderProgram : function(gl){
		var fragmentShader = this.getShader(gl, "shader-fs", gl.FRAGMENT_SHADER);
		var vertexShader = this.getShader(gl, "shader-vs", gl.VERTEX_SHADER);
		
		this.program = gl.createProgram();
		program = this.program;//convenient to write
		
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		//alert if fail
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			alert("Unable to initialize the shader program.");
		}
		return program;
	},

	getShader : function(gl, id, type) {
		var shaderScript, shader;
		shaderScript = document.getElementById(id);

		if (!shaderScript || (shaderScript.type != "x-shader/x-fragment" && shaderScript.type != "x-shader/x-vertex") ){
			return null;
		}
		shader = gl.createShader(type);
		gl.shaderSource(shader, shaderScript.text);
		gl.compileShader(shader);  

 	 	// See if it compiled successfully
 	 	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
 	 		alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
 	 		return null;  
 	 	}
 	 	return shader;
 	 },

 	  updateShaderParams : function(gl){
 	 	gl.uniform3fv(this.program.cameraPos, Camera.pos);
 	 	gl.uniform1f(gl.getUniformLocation(this.program, "fov"), Camera.fov);
 	 	gl.uniform1f(gl.getUniformLocation(this.program, "ratio"), Camera.ratio);
 	 	gl.uniform3fv(gl.getUniformLocation(this.program, "cameraPos"), Camera.pos);
 	 	gl.uniformMatrix3fv(gl.getUniformLocation(this.program, "rtrans"), false, Uti.flat(Camera.rtrans));
 	 	gl.uniform3fv(gl.getUniformLocation(this.program, "rot"), Camera.rotate);
 	 	gl.uniform3fv(gl.getUniformLocation(this.program, "rotv"), Camera.rotv);
 	 },

 	 updateTime: function()
 	 {
 	 	gl.uniform1f(gl.getUniformLocation(this.program, "time"), this.time);
 	 },
 	 getTexture : function(){

 	 	var image = new Image();
 	 	image.src = "im_clip.jpg";
 	 	image.webglTexture = false;

 	 	image.onload=function(e) {
 	 		var texture=gl.createTexture();
 	 		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 	 		gl.bindTexture(gl.TEXTURE_2D, texture);
 	 		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
 	 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 	 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
 	 		gl.generateMipmap(gl.TEXTURE_2D);
 	 		gl.bindTexture(gl.TEXTURE_2D, null);
 	 		image.webglTexture = texture;
 	 	}
 	 	this.texture = image;
 	 }
}



