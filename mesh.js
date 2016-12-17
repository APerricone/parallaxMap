function Mesh(gl,onDone)
{
	this.gl =gl;
	this.vBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		 0.8, 0.8, 0, //0 
		-0.8, 0.8, 0, //1
		 0.8,-0.8, 0, //2
		-0.8,-0.8, 0, //3
		 0.8, 0.8,-0.4, //4 
		-0.8, 0.8,-0.4, //5
		 0.8,-0.8,-0.4, //6
		-0.8,-0.8,-0.4  //7
	]), gl.STATIC_DRAW);
	this.iBuff = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuff);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array([
		0,1,2, 2,1,3, 
		0,4,1, 1,4,5,
		1,5,3, 3,5,7,
		3,7,2, 2,7,6,
		2,6,0, 0,6,4]), gl.STATIC_DRAW);
	
	this.iBuffDebug = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuffDebug);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array([
		0,1, 1,2, 2,0, 1,3, 3,2,
		0,4, 4,1, 4,5, 5,1, 
		5,3, 5,7, 7,3,
		7,2, 7,6, 6,2, 
		6,0, 6,4, 0,7]), gl.STATIC_DRAW);
	var tc = this;
	loadProgram(gl,"mesh.vs","mesh.fs",function(p)
	{
		tc.program = p;
		tc.posLocation = gl.getAttribLocation(tc.program, "pos");
		tc.pvMatrixUniform = gl.getUniformLocation(tc.program, "uPVMatrix");
		tc.invPVMatrixUniform = gl.getUniformLocation(tc.program, "uInvPVMatrix");
		tc.screenSizeUniform = gl.getUniformLocation(tc.program, "uScreenSize");
		tc.uModelMatrix = gl.getUniformLocation(tc.program, "uModelMatrix");
		tc.uInvTransModelMatrix = gl.getUniformLocation(tc.program, "uInvTransModelMatrix");
		gl.useProgram(tc.program);	
		gl.uniform1i(gl.getUniformLocation(tc.program, "sDepthTxt"),0);
		gl.uniform1i(gl.getUniformLocation(tc.program, "sNormalTxt"),1);

		tc.setPlane();
		onDone();
	});
	//var txt = gl.getUniformLocation(this.program, "uTxt");
	//gl.uniform1i(txt, false, matrix);
	
	var canvasTmp = document.createElement("canvas");
	canvasTmp.width = canvasTmp.height = 256;
	var	c2d = canvasTmp.getContext('2d');
	var tmp = new NoiseTexture(8);
	for(var i=0;i<8;i++)
	{
		tmp.rnd[i][0] = tmp.rnd[0][i] ;
	}
	
	tmp.render(canvasTmp,8,false);
	this.depthTexture = [];
	this.normTexture = [];
	this.depthTexture[0] = textureFromCanvas(gl, canvasTmp);
	this.normTexture[0] = normalFromCanvas(gl, canvasTmp,c2d);
	tmp.render(canvasTmp,8,true);
	this.depthTexture[1] = textureFromCanvas(gl, canvasTmp);
	this.normTexture[1] = normalFromCanvas(gl, canvasTmp,c2d);

	c2d.fillStyle = '#000';
	c2d.fillRect(0,0,256,256);
	c2d.fillStyle = '#FFF';
	for(var y=0;y<256;y+=64)
	{
		c2d.fillRect(-32+4, 0+4+y, 64-8, 32-8);
		c2d.fillRect( 32+4, 0+4+y, 64-8, 32-8);
		c2d.fillRect( 96+4, 0+4+y, 64-8, 32-8);
		c2d.fillRect(160+4, 0+4+y, 64-8, 32-8);
		c2d.fillRect(224+4, 0+4+y, 64-8, 32-8);
		c2d.fillRect(  0+4,32+4+y, 64-8, 32-8);
		c2d.fillRect( 64+4,32+4+y, 64-8, 32-8);
		c2d.fillRect(128+4,32+4+y, 64-8, 32-8);
		c2d.fillRect(192+4,32+4+y, 64-8, 32-8);
	}
	this.depthTexture[2] = textureFromCanvas(gl, canvasTmp);	
	this.normTexture[2] = normalFromCanvas(gl, canvasTmp,c2d);
	c2d.fillStyle = '#000';
	c2d.fillRect(0,0,256,256);
	c2d.fillStyle = '#FFF';
	for(var r=16;r>0;r--)
	{
		var c = Math.round(255*Math.sqrt(1-r/16));
		c2d.fillStyle = 'rgb('+c+','+c+','+c+')';
		for(var y=32;y<256;y+=64)
			for(var x=32;x<256;x+=64)
		{
			//c2d.fillRect(x-16, y-16, 32, 32);
			c2d.beginPath();
			c2d.arc(x,y,r*2,0,Math.PI*2);
			c2d.fill();
		}
	}
	this.depthTexture[3] = textureFromCanvas(gl, canvasTmp);	
	this.normTexture[3] = normalFromCanvas(gl, canvasTmp,c2d);

	
	this.debugProgram = compile(gl,
	"attribute vec3 pos;\n" +
	"uniform mat4 uPVMatrix;\n"+
	"uniform mat4 uModelMatrix;\n"+
	"varying vec3 cc;\n"+
	"void main() {	cc=pos; gl_Position = uPVMatrix * uModelMatrix * vec4(pos,1); }",
	"#ifdef GL_ES\n"+
	"precision highp float;\n"+
	"#endif\n"+
	"varying vec3 cc;\n"+
	"void main() { gl_FragColor = vec4(1.0); }");
	this.debugProgram.posLocation = gl.getAttribLocation(this.debugProgram, "pos");
	this.debugProgram.pvMatrixUniform = gl.getUniformLocation(this.debugProgram, "uPVMatrix");
	this.debugProgram.uModelMatrix = gl.getUniformLocation(this.debugProgram, "uModelMatrix");

	this.matrices = [];
	this.model = 0;
	this.changeTxt = 100;
}

Mesh.prototype.setPlane = function()
{
	var gl=this.gl;

	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		 1.0, 1.0, 0, //0 
		-1.0, 1.0, 0, //1
		 1.0,-1.0, 0, //2
		-1.0,-1.0, 0, //3
		 1.0, 1.0,-0.4, //4 
		-1.0, 1.0,-0.4, //5
		 1.0,-1.0,-0.4, //6
		-1.0,-1.0,-0.4  //7
	]), gl.STATIC_DRAW);
	this.matrices = [];
	this.matrices[0] = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
	this.itMatrices = [];
	for(var i=0;i<this.matrices.length;i++)
	{
		this.itMatrices[i] = new Float32Array(matrix.transpose(matrix.inverse(this.matrices[i])))
	}
	this.txtIdx = [0];

	var uPlane = new Float32Array([1/2.0,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/2.0,0,0.5]); // v = dot(vPlane,vec4(P,1)
	var plane1 = new Float32Array([0,0,1,0]);  		// plane0 = plane containes the triangle and the points with height 1 -> vec4(P,-1) * plane1 = 0
	var plane0 = new Float32Array([0,0,1,-0.4]);		// plane1 = plane containes the points with height 0 -> vec4(P,-1) * plane0 = 0
		
	gl.useProgram(this.program);	
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane1"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane1"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane0"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane0"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane1"), plane1);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane0"), plane0);
	this.changeTxt = 100;
}

Mesh.prototype.setCube = function()
{
	var gl=this.gl;

	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		 1.0, 1.0, 1.0, //0 
		-1.0, 1.0, 1.0, //1
		 1.0,-1.0, 1.0, //2
		-1.0,-1.0, 1.0, //3
		 0.9, 0.9, 0.9, //4 
		-0.9, 0.9, 0.9, //5
		 0.9,-0.9, 0.9, //6
		-0.9,-0.9, 0.9  //7
	]), gl.STATIC_DRAW);

	var uPlane = new Float32Array([1/2.0,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/2.0,0,0.5]); // v = dot(vPlane,vec4(P,1)
	var plane1 = new Float32Array([0,0,1,1]);  		// plane0 = plane containes the triangle and the points with height 1 -> vec4(P,-1) * plane1 = 0
	var plane0 = new Float32Array([0,0,1,0.9]);		// plane1 = plane containes the points with height 0 -> vec4(P,-1) * plane0 = 0
		
	gl.useProgram(this.program);	
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane1"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane1"), vPlane);
	var uPlane = new Float32Array([1/1.8,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/1.8,0,0.5]); // v = dot(vPlane,vec4(P,1)
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane0"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane0"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane1"), plane1);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane0"), plane0);

	this.matrices = [];
	this.matrices.push(new Float32Array(matrix.identity(4)));
	this.matrices.push(new Float32Array(matrix.rotate_y(Math.PI/2,4)));
	this.matrices.push(new Float32Array(matrix.rotate_y(-Math.PI/2,4)));
	this.matrices.push(new Float32Array(matrix.rotate_y(Math.PI,4)));
	this.matrices.push(new Float32Array(matrix.rotate_x(Math.PI/2,4)));
	this.matrices.push(new Float32Array(matrix.rotate_x(-Math.PI/2,4)));
	this.itMatrices = [];
	for(var i=0;i<this.matrices.length;i++)
	{
		this.itMatrices[i] = new Float32Array(matrix.transpose(matrix.inverse(this.matrices[i])))
	}
	this.changeTxt = 4;
	
}

Mesh.prototype.setSphere = function()
{
	var gl=this.gl;

	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	var ca = Math.cos(Math.PI/8);
	var sa = Math.sin(Math.PI/8);
	var direx = vector.normalize([sa,sa,ca]);
	
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		 1.0*direx[0], 1.0*direx[1], 1.0*direx[2], //0 
		-1.0*direx[0], 1.0*direx[1], 1.0*direx[2], //1
		 1.0*direx[0],-1.0*direx[1], 1.0*direx[2], //2
		-1.0*direx[0],-1.0*direx[1], 1.0*direx[2], //3
		 0.8*direx[0], 0.8*direx[1], 0.8*direx[2], //4 
		-0.8*direx[0], 0.8*direx[1], 0.8*direx[2], //5
		 0.8*direx[0],-0.8*direx[1], 0.8*direx[2], //6
		-0.8*direx[0],-0.8*direx[1], 0.8*direx[2]  //7
	]), gl.STATIC_DRAW);
	this.txtIdx = [0];

	var uPlane = new Float32Array([1/2.0,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/2.0,0,0.5]); // v = dot(vPlane,vec4(P,1)
	var plane1 = new Float32Array([0,0,1,1]);  		// plane0 = plane containes the triangle and the points with height 1 -> vec4(P,-1) * plane1 = 0
	var plane0 = new Float32Array([0,0,1,0.8]);		// plane1 = plane containes the points with height 0 -> vec4(P,-1) * plane0 = 0
		
	gl.useProgram(this.program);	
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane1"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane1"), vPlane);
	var uPlane = new Float32Array([1/1.6,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/1.6,0,0.5]); // v = dot(vPlane,vec4(P,1)
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_uPlane0"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_vPlane0"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane1"), plane1);
	gl.uniform4fv(gl.getUniformLocation(this.program, "u_plane0"), plane0);

	this.matrices = [];
	var rotMat_y = matrix.rotate_y(Math.PI/4,4);
	var rotMat_x = matrix.rotate_x(Math.PI/8,4);
	var currMat = matrix.identity(4);
	
	currMat = matrix.multiply(currMat,rotMat_x);	this.matrices.push(new Float32Array(currMat));
	for(var i=0;i<7;i++)
	{
		currMat = matrix.multiply(currMat,rotMat_y); 	this.matrices.push(new Float32Array(currMat));
	}
	
	rotMat_x = matrix.rotate_x(-Math.PI/8,4);
	currMat = matrix.identity(4);
	
	currMat = matrix.multiply(currMat,rotMat_x);	this.matrices.push(new Float32Array(currMat));
	for(var i=0;i<7;i++)
	{
		currMat = matrix.multiply(currMat,rotMat_y); 	this.matrices.push(new Float32Array(currMat));
	}

	this.itMatrices = [];
	for(var i=0;i<this.matrices.length;i++)
	{
		this.itMatrices[i] = new Float32Array(matrix.transpose(matrix.inverse(this.matrices[i])))
	}
	
}

Mesh.prototype.draw = function(matrix,invMat,w,h,txt,model)
{
	if(this.program == undefined) return;
	if(this.model!=model)
	{
		this.model=model;
		switch(model)
		{
			case 0: this.setPlane(); break;
			case 1: this.setCube(); break;
			case 2: this.setSphere(); break;
		}
	}
	var gl=this.gl;
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuff);
	gl.useProgram(this.program);	
	gl.uniformMatrix4fv(this.pvMatrixUniform, false, matrix);
	gl.uniformMatrix4fv(this.invPVMatrixUniform, false, invMat);
	gl.uniform2fv(this.screenSizeUniform, new Float32Array([w,h]));
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.depthTexture[txt*2]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, this.normTexture[txt*2]);

	gl.enableVertexAttribArray(this.posLocation);
	gl.vertexAttribPointer(this.posLocation, 3, gl.FLOAT, false, 0, 0);
	for(var i=0;i<this.matrices.length;i++)
	{
		if(i==this.changeTxt)
		{
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.depthTexture[txt*2+1]);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.normTexture[txt*2+1]);
		}
		gl.uniformMatrix4fv(this.uModelMatrix, false, this.matrices[i]);
		gl.uniformMatrix4fv(this.uInvTransModelMatrix, false, this.itMatrices[i]);
		gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_BYTE, 0);
	}
}

Mesh.prototype.drawDebug = function(matrix)
{
	if(this.debugProgram == undefined) return;
	var gl=this.gl;
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuffDebug);
	gl.useProgram(this.debugProgram);	
	gl.enableVertexAttribArray(this.debugProgram.posLocation);
	gl.vertexAttribPointer(this.debugProgram.posLocation, 3, gl.FLOAT, false, 0, 0);
	gl.uniformMatrix4fv(this.debugProgram.pvMatrixUniform, false, matrix);
	
	for(var i=0;i<this.matrices.length;i++)
	{
		gl.uniformMatrix4fv(this.debugProgram.uModelMatrix, false, this.matrices[i]);
		gl.drawElements(gl.LINES, 36, gl.UNSIGNED_BYTE, 0);
	}

//	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuff);
//	gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_BYTE, 0);
}
