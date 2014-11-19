var gl = null;
window.onload = init;

function init(){
	var canvas = document.getElementById("canv");
	canvas.width = 640;
	canvas.height = 480;
	canvas.addEventListener("mousemove", Gui.mouseMove, false);
	canvas.addEventListener("mousedown", Gui.mouseDown, false);
	canvas.addEventListener("mouseup", Gui.mouseUp, false);
	canvas.addEventListener("mouseout", Gui.mouseUp, false);
	document.addEventListener("keydown", Gui.keyDown, false);
	setInterval(function(){
		Render.time++;

	}, 1);

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
	Camera.ratio = canvas.width / canvas.height;
	Camera.getRTrans();


	var program = Render.getShaderProgram(gl);
	gl.useProgram(program);
	Render.updateShaderParams(gl);

	//init buffer, 2 tris for whole canvas
	var quadBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0,
    ]), gl.STATIC_DRAW);

    Render.getTexture();

    Gui.animate(0);
}