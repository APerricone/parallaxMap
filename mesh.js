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
	
	var tc = this;
	loadProgram(gl,"mesh.vs","mesh.fs",function(p)
	{
		tc.program = p;
		tc.posLocation = gl.getAttribLocation(tc.program, "pos");
		tc.pvMatrixUniform = gl.getUniformLocation(tc.program, "uPVMatrix");
		tc.invMatrixUniform = gl.getUniformLocation(tc.program, "uInvMatrix");
		tc.screenSizeUniform = gl.getUniformLocation(tc.program, "uScreenSize");
		
		
		var uPlane = [1/1.6,0,0,0.5]; // u = dot(uPlane,vec4(P,1)
		var vPlane = [0,1/1.6,0,0.5]; // v = dot(vPlane,vec4(P,1)
		var plane1 = [0,0,1,0];  		// plane0 = plane containes the triangle and the points with height 1 -> vec4(P,-1) * plane1 = 0
		var plane0 = [0,0,1,-0.4];		// plane1 = plane containes the points with height 0 -> vec4(P,-1) * plane0 = 0
		
		gl.useProgram(tc.program);	
		gl.uniform4fv(gl.getUniformLocation(tc.program, "uPlane1"), new Float32Array(uPlane));
		gl.uniform4fv(gl.getUniformLocation(tc.program, "vPlane1"), new Float32Array(vPlane));
		//var uPlane = [1/1.4,0,0,0.5]; // u = dot(uPlane,vec4(P,1)
		//var vPlane = [0,1/1.4,0,0.5]; // v = dot(vPlane,vec4(P,1)
		gl.uniform4fv(gl.getUniformLocation(tc.program, "uPlane0"), new Float32Array(uPlane));
		gl.uniform4fv(gl.getUniformLocation(tc.program, "vPlane0"), new Float32Array(vPlane));
		gl.uniform4fv(gl.getUniformLocation(tc.program, "plane1"), new Float32Array(plane1));
		gl.uniform4fv(gl.getUniformLocation(tc.program, "plane0"), new Float32Array(plane0));
		
		gl.uniform1i(gl.getUniformLocation(tc.program, "sDepthTxt"),0);
		gl.uniform1i(gl.getUniformLocation(tc.program, "sNormalTxt"),1);
		
		gl.uniformMatrix4fv(gl.getUniformLocation(tc.program, "uModelMatrix"), false, 
			new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
	
		onDone();
	});
	//var txt = gl.getUniformLocation(this.program, "uTxt");
	//gl.uniform1i(txt, false, matrix);
	
	var canvasTmp = document.createElement("canvas");
	canvasTmp.width = canvasTmp.height = 256;
	var	c2d = canvasTmp.getContext('2d');
	c2d.fillStyle= '#F00'; 
	c2d.fillRect(0,0,256,256);
	var rnd = [];
	var n = 8;
	for(var y=0;y<n;y++) 
	{
		rnd[y] = [];
		for(var x=0;x<n;x++) 
			rnd[y][x] = Math.random();
	}
	function smoothStep(v1,v2,t)
	{
		t = t * t * t * (t * (t * 6 - 15) + 10);
		return v1*(1-t)+v2*t;
	}
	function Perlin(x,y)
	{
		var tx = x%1;
		var ty = y%1;
		x=Math.floor(x)%n;
		y=Math.floor(y)%n;
		var x1 = (x+1)%n;
		var y1 = (y+1)%n;
		var v1 = smoothStep(rnd[y][x],rnd[y][x1],tx);
		var v2 = smoothStep(rnd[y1][x],rnd[y1][x1],tx);
		return smoothStep(v1,v2,ty);
	}
	function doTxt(fn)
	{
		for(var y=0;y<256;y++)
			for(var x=0;x<256;x++)
			{
				var l = 256/n;
				var v = 0;
				var h = 0.5;
				for(var o=0;o<8;o++)
				{
					v += Perlin(x/l,y/l)*h;
					l/=2;
					h/=2;
				}
				fn(x,y,v);
			}
	}
	var max = 0;
	doTxt(function(x,y,v)
	{
		if(v>max) max=v;
	});
	doTxt(function(x,y,v)
	{
		var c = Math.round(v*255/max);
		c2d.fillStyle= 'rgb('+c+','+c+','+c+')';
		c2d.fillRect(x,y,1,1);
	});
	this.depthTexture = [];
	this.normTexture = [];
	this.depthTexture[0] = textureFromCanvas(gl, canvasTmp);
	this.normTexture[0] = normalFromCanvas(gl, canvasTmp,c2d);

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
	this.depthTexture[1] = textureFromCanvas(gl, canvasTmp);	
	this.normTexture[1] = normalFromCanvas(gl, canvasTmp,c2d);
}

function textureFromCanvas(gl,canvasTmp)
{
	var txt = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, txt);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,  canvasTmp);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return txt;
}

function normalFromCanvas(gl,canvasTmp,c2d)
{
	var w = canvasTmp.width;
	var h = canvasTmp.height;
	var img = c2d.getImageData(0,0,w,h);
	var idx=0;
	function getPixel(x,y)
	{
		if(x<0) x+=w; //x=0;
		if(x>=w) x-=w; //x=w-1;
		if(y<0) y+=h; // y=0;
		if(y>=h) y-=h; //y=h-1;
		return img.data[(y*w+x)*4];
	}
		
	for(var y=0;y<h;y++)
		for(var x=0;x<w;x++)
	{
		var px = getPixel(x-1,y);
		var nx = getPixel(x+1,y);
		var py = getPixel(x,y-1);
		var ny = getPixel(x,y+1);
		var v = v_normalize([nx-px,ny-py,10]);
		c2d.fillStyle= 'rgb('+Math.round((v[0]+1)*127.5)+','+Math.round((v[1]+1)*127.5)+','+Math.round((v[2]+1)*127.5)+')';
		c2d.fillRect(x,y,1,1);
	}
	return textureFromCanvas(gl,canvasTmp);
}

Mesh.prototype.setPlane = function()
{
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
	this.matrices = [];
	this.matrices[0] = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
	this.txtIdx = [0];

	var uPlane = new Float32Array([1/1.6,0,0,0.5]); // u = dot(uPlane,vec4(P,1)
	var vPlane = new Float32Array([0,1/1.6,0,0.5]); // v = dot(vPlane,vec4(P,1)
	var plane1 = new Float32Array([0,0,1,0]);  		// plane0 = plane containes the triangle and the points with height 1 -> vec4(P,-1) * plane1 = 0
	var plane0 = new Float32Array([0,0,1,-0.4]);		// plane1 = plane containes the points with height 0 -> vec4(P,-1) * plane0 = 0
		
	gl.useProgram(this.program);	
	gl.uniform4fv(gl.getUniformLocation(this.program, "uPlane1"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "vPlane1"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "uPlane0"), uPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "vPlane0"), vPlane);
	gl.uniform4fv(gl.getUniformLocation(this.program, "plane1"), plane1);
	gl.uniform4fv(gl.getUniformLocation(this.program, "plane0"), plane0);
}

Mesh.prototype.draw = function(matrix,invMat,w,h,txt)
{
	if(this.program == undefined) return;
	var gl=this.gl;
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.iBuff);
	gl.useProgram(this.program);	
	gl.uniformMatrix4fv(this.pvMatrixUniform, false, matrix);
	gl.uniformMatrix4fv(this.invMatrixUniform, false, invMat);
	gl.uniform2fv(this.screenSizeUniform, new Float32Array([w,h]));
	gl.uniform2fv(this.screenSizeUniform, new Float32Array([w,h]));
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.depthTexture[txt]);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, this.normTexture[txt]);

	gl.enableVertexAttribArray(this.posLocation);
	gl.vertexAttribPointer(this.posLocation, 3, gl.FLOAT, false, 0, 0);
	gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_BYTE, 0);

}
