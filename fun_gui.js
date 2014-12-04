var Gui = {
	oldPos : [-1, -1],
	drag : false,
	offset : [0, 0], //newPos - oldPos
	time : -1,
	sampleCount: 0,//when there is no motion, samplecount increase with frames rendered to achieve antialiasing.
	timeStart : 0,
	timeLast : 0,
	timeAccumulate:0,
	timePrev20 : 0,
	prevCounter : 0,
	stop : 0,
	lookAt:[0,0,1],
	rotate:[0,0,0],
	up : [0,1,0],
	//convert sphere coordinate to direction vector
	radians: function(degree){
		return degree * Math.PI / 180;
	},
	rotateX : function(degree)
	{
		var rad = this.radians(degree);
		return [
		[1, 0, 0],
		[0, Math.cos(rad), -Math.sin(rad)],
		[0, Math.sin(rad), Math.cos(rad)]
		];
	},
	rotateY : function(degree){
		var rad = this.radians(degree);
		return [
		[Math.cos(rad), 0, Math.sin(rad)],
		[0, 1, 0],
		[-Math.sin(rad), 0, Math.cos(rad)]
		];
	},
	normalize : function(u){
		return math.divide(u, math.norm(u));
	},
	crossProduct : function(u, f)
	{
		return [
		u[1] * f[2] - u[2] * f[1],
		u[2] * f[0] - u[0] * f[2],
		u[0] * f[1] - u[1] * f[0]
		];
	},
	polarToVector : function() {
		var f = this.normalize(Gui.lookAt);
		var rotateXMatrix = this.rotateX(Gui.rotate[0]);
		var rotateYMatrix = this.rotateY(Gui.rotate[1]);
		f = math.multiply(f,rotateXMatrix);
		f = math.multiply(f,rotateYMatrix);
		f = this.normalize(f);
		Gui.rotate = [0,0,0];
		Gui.lookAt = f;

		f = this.normalize(Gui.up);
		f = math.multiply(f,rotateXMatrix);
		f = math.multiply(f,rotateYMatrix);
		f = this.normalize(f);
		Gui.up = f;
	},
	getLeftRightVector : function(dir) {
		var f = this.normalize(Gui.lookAt);
		var vertical = this.crossProduct(f,Gui.up);
		if (dir == 0)//left
		{
			if (Gui.lookAt[2]>0)//facing inside
			{
				if (vertical[0] > 0)
					vertical = math.multiply(vertical,-1);
			}
			else {
				if (vertical[0] < 0)
					vertical = math.multiply(vertical,-1);
			}
		}
		else //right
		{
			if (Gui.lookAt[2]>0)//facing inside
			{
				if (vertical[0] < 0)
					vertical = math.multiply(vertical,-1);
			}
			else {
				if (vertical[0] > 0)
					vertical = math.multiply(vertical,-1);
			}
		}
		vertical = this.normalize(vertical);
		return vertical;
	},
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
			Gui.rotate = math.add(Gui.rotate,[Gui.offset[1],Gui.offset[0],0]);
			Camera.rotate[0] = math.min(math.max(Camera.rotate[0], -89), 89);//constrain u can not do upsidedown
			Camera.rotate[1] = Camera.rotate[1] > 180 ? Camera.rotate[1] - 360 : Camera.rotate[1];
			Gui.sampleCount = 0;

		}

	},

	keyDown : function(e) {
		switch(e.keyCode)
		{
			// case 37:
			// 	Camera.pos[0] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
			// 	Gui.sampleCount = 0;
			// 	break;
			// case 38://UP
			// 	Camera.pos[1] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1; //if turn a round up and down flip
			// 	Gui.sampleCount = 0;
			// 	break;
			// case 39:
			// 	Camera.pos[0] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 ? 0.1 : -0.1; //if turn a round up and down flip
			// 	Gui.sampleCount = 0;
			// 	break;
			// case 40://DOWN
			// 	Camera.pos[1] += Camera.rotate[1] < 90 && Camera.rotate[1] > -90 > 0 ? -0.1 : 0.1 ;
			// 	Gui.sampleCount = 0;
			// 	break;
			case 87://w
				Gui.polarToVector();
				Camera.pos[0] += Gui.lookAt[0] * 0.1;
				// Camera.pos[] = math.min(Camera.pos[0],10);
				Camera.pos[1] += Gui.lookAt[1] * 0.1;
				//Camera.pos[0] = math.min(Camera.pos[1],10);
				Camera.pos[2] += Gui.lookAt[2] * 0.1;
				//Camera.pos[0] = math.min(Camera.pos[2],20);
				Gui.sampleCount = 0;
				break;
			case 83://s
				Gui.polarToVector();
				Camera.pos[0] -= Gui.lookAt[0] * 0.1;
				// Camera.pos[0] = math.max(Camera.pos[0],-10);
				Camera.pos[1] -= Gui.lookAt[1] * 0.1;
				// Camera.pos[0] = math.max(Camera.pos[1],-10);
				Camera.pos[2] -= Gui.lookAt[2] * 0.1;
				// Camera.pos[0] = math.max(Camera.pos[2],-20);
				Gui.sampleCount = 0;
				break;
			case 65://a
				var vec = Gui.getLeftRightVector(0);
				Camera.pos[0] += vec[0]*0.1;
				Camera.pos[1] += vec[1]*0.1;
				Camera.pos[2] += vec[2]*0.1;
				Gui.sampleCount = 0;
				break;
			case 68://d
				var vec = Gui.getLeftRightVector(1);
				Camera.pos[0] += vec[0]*0.1;
				Camera.pos[1] += vec[1]*0.1;
				Camera.pos[2] += vec[2]*0.1;
				Gui.sampleCount = 0;
				break;

		}
		Camera.pos[0] = math.min(math.max(Camera.pos[0],-10),10);
		Camera.pos[1] = math.min(math.max(Camera.pos[1],-10),10);
		Camera.pos[2] = math.min(math.max(Camera.pos[2],-20),20);

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

		// Pool texture
		if (Render.texImage[2].tex) {
			gl.activeTexture(gl.TEXTURE6);
			gl.uniform1i(Render.program.poolTexLoc, 6);
			gl.bindTexture(gl.TEXTURE_2D,Render.texImage[2].tex);
		}
		Camera.getRTrans();//update translate matrix
		Gui.sampleCount++;
		//Gui.sampleCount > 3 ? 0: Gui.sampleCount++;//when there is no motion, samplecount increase with frames rendered to achieve antialiasing.

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
		Gui.prevCounter++;
		if (Gui.prevCounter == 20){
			document.getElementById("fps").innerHTML = "fps:\t" + (20000/(Date.now() - Gui.timePrev20)).toFixed(1);
			Gui.timePrev20 = Date.now();
			Gui.prevCounter = 0;
		}
		Gui.timeNow = Date.now();
		Gui.renderToBuffer();
		Gui.drawToScreen();
		gl.flush();
		window.requestAnimationFrame(Gui.animate);
  }
}