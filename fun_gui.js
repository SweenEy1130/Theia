var Gui = {
	oldPos : [-1, -1],
	drag : false,
	offset : [0, 0], //newPos - oldPos
	time : -1,
	
	mouseDown :function (e) {
		Gui.oldPos = [e.pageX, e.pageY];
		Gui.drag = true;
		time = Date.now();
	},
	
	mouseUp: function(e){
		Gui.drag = false;
		Gui.oldPos = [-1, -1];
		Camera.rotv = [0, 0, 0];
	},
	mouseMove : function (e) {
		if(Gui.drag){
			Gui.offset = math.subtract([e.pageX, e.pageY], Gui.oldPos);
			Gui.oldPos = [e.pageX, e.pageY];
			var ntime = Date.now();
			var dt = ntime - time;
			time = ntime;
		    Camera.rotv = [Gui.offset[0] / dt * 100, Gui.offset[1] / dt * 100, 0];// pixel / sec
			// Camera.rotv = [Gui.offset[0] , Gui.offset[1] , 0];

			Camera.rotate = math.add(Camera.rotate,[Gui.offset[1] , Gui.offset[0] , 0]);
			Camera.rotate[0] = math.min(math.max(Camera.rotate[0], -89), 89);//constrain u can not do upsidedown
			Camera.rotate[1] = Camera.rotate[1] > 180 ? Camera.rotate[1] - 360 : Camera.rotate[1];
			
		}

	},
	keyDown : function(e) {
		switch(e.keyCode)
		{
			case 38://UP
			case 87:
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1;
				break;
			case 40://DOWN
			case 83:
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
				break;
		}
		Render.updateShaderParams(gl);

	},
	animate : function(time) {
		if (Render.texture.webglTexture) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D,Render.texture.webglTexture);
		}

		Render.updateShaderParams(gl);

		gl.enableVertexAttribArray(Render.program);
		gl.vertexAttribPointer(Render.program.cVertex, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disableVertexAttribArray(Render.program);
		//gl.flush();

		window.requestAnimationFrame(Gui.animate);
  }
}