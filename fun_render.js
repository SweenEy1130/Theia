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
	programs : [],
	texture : null,

	setUniforms: function(program){
		program.camFovLoc = gl.getUniformLocation(program, "camera.fov_factor");
		program.camResLoc = gl.getUniformLocation(program, "camera.res");
		program.camPosLoc = gl.getUniformLocation(program, "camera.pos");
		program.camTransLoc = gl.getUniformLocation(this.program, "trans");
		program.sampleCountLoc = gl.getUniformLocation(program, "sampleCount");
		program.tex1Loc = gl.getUniformLocation(program, "tex1");//image texture
		program.tex0Loc = gl.getUniformLocation(program, "tex0");//pevious result
		program.tex2Loc = gl.getUniformLocation(program, "tex2");//material as texture
		program.timeLoc = gl.getUniformLocation(program, "globTime");
		program.mtlNumLoc = gl.getUniformLocation(program, "mtlNum");
	},
	getShaderProgram : function(vs_url, fs_url){
		var vertexShader = this.getShader(vs_url, gl.VERTEX_SHADER);
		var fragmentShader = this.getShader(fs_url, gl.FRAGMENT_SHADER);
		
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		//alert if fail
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			alert("Unable to initialize the shader program.");
		}
		return program;
	},
 	 getShader : function(url, type){
 	 	var ss;//shaderScript and shader
 	 	$.ajax({
 	 		dataType: "text",
 	 		url: url,
 	 		async: false,//synchronically load file
 	 		success: function(data){
 	 			ss = data;
 	 		},
 	 		error:function(){
 	 			console.log("unable to load glsl");
 	 		}
 	 	});

 	 	var s = gl.createShader(type);
 	 	gl.shaderSource(s, ss);
 	 	gl.compileShader(s);
  	 	// See if it compiled successfully
 	 	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {  
 	 		alert("Compile Error in " + url+ ":" + gl.getShaderInfoLog(s));  
 	 		return null;  
 	 	}
 	 	return s;		
 	 	    
 	 },

 	  updateShaderParams : function(program){
 	  	gl.uniform1f(program.sampleCountLoc, Gui.sampleCount);
 	  	gl.uniform1f(program.timeLoc, (Date.now()-Gui.timeStart)/1000.);
 	 	gl.uniform1f(program.camFovLoc, Math.tan(Uti.radians(Camera.fov/2)));
 	 	gl.uniform2fv(program.camResLoc, Camera.res);
 	 	gl.uniform3fv(program.camPosLoc, Camera.pos);
 	 	gl.uniformMatrix3fv(program.camTransLoc, false, Uti.flat(Camera.rtrans));
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
 	 makeTextureFloat : function(data){
 	 	var tex = gl.createTexture();
 	 	var w = 4, h = data.length / w / 3; // 3 float for ks, 3 for kd 3 for (ilum, ns, 0);
 	 	var dataf = new Float32Array(data);
 	 	gl.bindTexture( gl.TEXTURE_2D, tex);
 	 	console.log("float texture support: " + gl.getExtension("OES_texture_float"));
		console.log("linear texture support: " + gl.getExtension("OES_texture_float_linear")); 	 	
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
 	 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Prevents s-coordinate wrapping (repeating).
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Prevents t-coordinate wrapping (repeating).
 	 	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, w, h, 0, gl.RGB, gl.FLOAT, dataf);
 	 	gl.bindTexture(gl.TEXTURE_2D, null);
 	 	this.mtlNum = h - 1;
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



