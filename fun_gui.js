var Gui = {
	oldPos : [-1, -1],
	drag : false,
	offset : [0, 0], //newPos - oldPos
	time : -1,
	sampleCount: 0,
	timeStart : 0,
	
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
			Gui.sampleCount = 0;
			
		}

	},
	keyDown : function(e) {
		switch(e.keyCode)
		{
			case 38://UP
			case 87:
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1;
				Gui.sampleCount = 0;
				break;
			case 40://DOWN
			case 83:
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
				Gui.sampleCount = 0;
				break;
		}

	},

	renderToBuffer : function()
	{

		if (Render.texImage.tex) {
			gl.useProgram(Render.program);//draw to frame buffer
			gl.activeTexture(gl.TEXTURE1);//enviroment texture
			gl.uniform1i(Render.program.tex1Loc, 1);
			gl.bindTexture(gl.TEXTURE_2D,Render.texImage.tex);
		}
		Camera.getRTrans();//update translate mat
		Gui.sampleCount++;
		gl.useProgram(Render.program);
		Render.updateShaderParams(Render.program);
		//material as texture
		gl.activeTexture(gl.TEXTURE2);
		gl.bindTexture(gl.TEXTURE_2D, Render.texMtl);
		gl.uniform1i(Render.program.tex2Loc, 2);
		//previous render result
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D,Render.tex[0]);
		gl.uniform1i(Render.program.tex0Loc, 0);
		//render to texture
		gl.bindFramebuffer(gl.FRAMEBUFFER, Render.fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Render.tex[1], 0);
		gl.enableVertexAttribArray(Render.program);		
		gl.vertexAttribPointer(Render.program.cVertex, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disableVertexAttribArray(Render.program);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		//gl.bindTexture(gl.TEXTURE_2D, null);
		Render.tex.reverse();//swap 2 element
	},
	drawToScreen : function()
	{
		gl.useProgram(Render.drawProg);
		gl.bindTexture(gl.TEXTURE_2D, Render.tex[1]);
		gl.enableVertexAttribArray(Render.drawProg);
		gl.vertexAttribPointer(Render.drawProg.cVertex, 2, gl.FLOAT, false, 0, 0);	
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.disableVertexAttribArray(Render.program);
		gl.bindTexture(gl.TEXTURE_2D, null);	
	},
	animate : function(time) {
		Gui.renderToBuffer();
		Gui.drawToScreen();
		gl.flush();
		window.requestAnimationFrame(Gui.animate);
		
  }
}