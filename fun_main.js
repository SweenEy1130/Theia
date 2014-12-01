var gl = null;
window.onload = init;
function init(){
	var canvas = document.getElementById("canv");
	canvas.width = 512;
	canvas.height = 512;
	canvas.addEventListener("mousemove", Gui.mouseMove, false);
	canvas.addEventListener("mousedown", Gui.mouseDown, false);
	canvas.addEventListener("mouseup", Gui.mouseUp, false);
	canvas.addEventListener("mouseout", Gui.mouseUp, false);
	document.addEventListener("keydown", Gui.keyDown, false);

	//get gl object
	try{
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	}
	catch(e){
		alert("You are not webgl compatible :("); gl = null;
	}

	if (gl) {
    	gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
    	gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
    	gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
    	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
    }

	//set Camera
	Camera.res = [canvas.width,canvas.height];
	Camera.getRTrans();
	//load Shader
	var traceProg = Render.getShaderProgram("shaders/trace_vs.glsl","shaders/trace_fs.glsl");
	gl.useProgram(traceProg);
	Render.program = traceProg;
	Render.setUniforms(traceProg);
	var drawProg = Render.getShaderProgram("shaders/draw_vs.glsl","shaders/draw_fs.glsl");
	Render.drawProg = drawProg;
	//load material
	var MaterialTextureData = parseMtl("models/sampleMtl.mtl");
	Render.texMtl = Render.makeTextureFloat(MaterialTextureData);
	gl.uniform1f(Render.program.mtlNumLoc, Render.mtlNum);//set numbers of material
	//init buffer, 2 tris for whole canvas
	var quadBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0,
    ]), gl.STATIC_DRAW);

    Render.fb = gl.createFramebuffer();
    Render.tex = [];
    Render.tex.push(Render.makeTexture());//render to texture
    Render.tex.push(Render.makeTexture());

    Render.texImage = [];
    Render.texImage.push(Render.getTexture("models/wall-texture.jpg"));
    Render.texImage.push(Render.getTexture("models/wall_norm.jpg"));
    Render.texImage.push(Render.getTexture("models/pool_tex.jpg"));

    Render.waterNorm = [];
    Render.waterNorm.push(Render.getTexture("models/640-normal.jpg"));
    Render.waterNorm.push(Render.getTexture("models/4483-normal.jpg"));

    Gui.timeStart = Date.now();
    Gui.animate(0);
}