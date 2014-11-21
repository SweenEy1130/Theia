var Camera = {
	pos : [0, 0, -10],//camera(eye) position
	lookat : [0, 0, 1],//lookat direction
	up : [0, 1, 0],//up vector
	offset : [0, 0, 0],//camera position offset
	rotate : [0, 0, 0],//lookat direction rotate degrees
	rotv : [0, 0, 0],
	fov : 90,//field of view, y axis
	res : [0, 0],
	rtrans : null,//translate eye ray from camera space to word space
	getRTrans : function ()
	{
		var f = Uti.normalize(this.lookat);
		var u = this.up;
		
		var r = Uti.crossProduct(u, f);
		u = Uti.crossProduct(f, r);
		
		u = Uti.normalize(u);
		r = Uti.normalize(r);

		var trans = [
		[ r[0], u[0], f[0] ],
		[ r[1], u[1], f[1] ],
		[ r[2], u[2], f[2] ]
		];

		var rot = math.multiply(Uti.rotateX(this.rotate[0]), Uti.rotateY(this.rotate[1]));
		this.rtrans = math.multiply(trans, rot);
	},
};
var Render = {
	program : null,
	texture : null,

	setUniforms: function(){
		this.camFovLoc = gl.getUniformLocation(this.program, "camera.fov_factor");
		this.camResLoc = gl.getUniformLocation(this.program, "camera.res");
		this.camPosLoc = gl.getUniformLocation(this.program, "camera.pos");
		this.camTransLoc = gl.getUniformLocation(this.program, "trans");
		this.sampleCountLoc = gl.getUniformLocation(this.program, "sampleCount");
		this.tex1Loc = gl.getUniformLocation(this.program, "tex1");
		this.tex0Loc = gl.getUniformLocation(this.program, "tex0");
		this.timeLoc = gl.getUniformLocation(this.program, "globTime");
	},
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
 	  	gl.uniform1f(this.sampleCountLoc, Gui.sampleCount);
 	  	gl.uniform1f(this.timeLoc, (Date.now()-Gui.timeStart)/1000.);
 	 	gl.uniform1f(this.camFovLoc, Math.tan(Uti.radians(Camera.fov/2)));
 	 	gl.uniform2fv(this.camResLoc, Camera.res);
 	 	gl.uniform3fv(this.camPosLoc, Camera.pos);
 	 	gl.uniformMatrix3fv(this.camTransLoc, false, Uti.flat(Camera.rtrans));
 	 	//gl.uniform3fv(gl.getUniformLocation(this.program, "camera.rotv"), Camera.rotv);
 	 },

 	 makeTexture : function() { //render to texture
 	 	var tex = gl.createTexture();
 	 	gl.bindTexture( gl.TEXTURE_2D, tex );
 	 	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
 	 	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
 	 	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, Camera.res[0], Camera.res[1], 0, gl.RGB, gl.UNSIGNED_BYTE, null );
 	 	gl.bindTexture( gl.TEXTURE_2D, null );
 	 	return tex;
 	 },
 	 getTexture : function(src){ //return an image
 	 	var texImage = new Image();
 	 	texImage.src = src;
 	 	texImage.onload = function(e) {
 	 		var texture=gl.createTexture();
 	 		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
 	 		gl.bindTexture(gl.TEXTURE_2D, texture);
 	 		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
 	 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 	 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
 	 		gl.generateMipmap(gl.TEXTURE_2D);
 	 		gl.bindTexture(gl.TEXTURE_2D, null);//free texture0
 	 		this.tex = texture;
 	 	}
 	 	return texImage;
 	 }
}



