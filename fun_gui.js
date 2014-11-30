var Gui = {
	oldPos : [-1, -1],
	drag : false,
	offset : [0, 0], //newPos - oldPos
	time : -1,
	sampleCount: 0,//when there is no motion, samplecount increase with frames rendered to achieve antialiasing.
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
			case 37:
				Camera.pos[0] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
				Gui.sampleCount = 0;
				break;
			case 38://UP
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1; //if turn a round up and down flip
				Gui.sampleCount = 0;
				break;
			case 39:
				Camera.pos[0] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1; //if turn a round up and down flip
				Gui.sampleCount = 0;
				break;
			case 40://DOWN
				Camera.pos[2] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
				Gui.sampleCount = 0;
				break;
		}

	},

	renderToBuffer : function()
	{
		gl.useProgram(Render.program);
		if (Render.texImage[0].tex) {//to see if a image texture is loaded from file
			gl.activeTexture(gl.TEXTURE2);//wall texture available
			gl.uniform1i(Render.program.wallTexLoc, 2);
			gl.bindTexture(gl.TEXTURE_2D,Render.texImage[0].tex);
		}

		if (Render.texImage[1].tex) {
			gl.activeTexture(gl.TEXTURE3);//wall norm availabe
			gl.uniform1i(Render.program.wallNormLoc, 3);
			gl.bindTexture(gl.TEXTURE_2D,Render.texImage[1].tex);
		}

		// Water normal map texture load
		if (Render.waterNorm[0].tex) {
			gl.activeTexture(gl.TEXTURE4);
			gl.uniform1i(Render.program.waterNorm0Loc, 4);
			gl.bindTexture(gl.TEXTURE_2D,Render.waterNorm[0].tex);
		}
		if (Render.waterNorm[1].tex) {
			gl.activeTexture(gl.TEXTURE5);
			gl.uniform1i(Render.program.waterNorm1Loc, 5);
			gl.bindTexture(gl.TEXTURE_2D,Render.waterNorm[1].tex);
		}

		Camera.getRTrans();//update translate matrix
		Gui.sampleCount++;//when there is no motion, samplecount increase with frames rendered to achieve antialiasing.
		Render.updateShaderParams(Render.program);
		//material as texture for achieve ka, kd, ks for different object
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, Render.texMtl);
		gl.uniform1i(Render.program.mtlTexLoc, 1);
		//bind previous render result to texture for antialiasing
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D,Render.tex[0]);
		gl.uniform1i(Render.program.pTexLoc, 0);
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