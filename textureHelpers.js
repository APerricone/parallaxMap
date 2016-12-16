function NoiseTexture(n)
{
	if(n==undefined) n=8;
	var rnd = [];
	var n = 8;
	for(var y=0;y<n;y++) 
	{
		rnd[y] = [];
		for(var x=0;x<n;x++) 
			rnd[y][x] = Math.random();
	}
	this.rnd = rnd;
	this.n = n;
}

function smoothStep(v1,v2,t)
{
	t = t * t * t * (t * (t * 6 - 15) + 10);
	return v1*(1-t)+v2*t;
}

NoiseTexture.prototype.Perlin = function(x,y,l,doTop)
{
	var n = this.n;
	var rnd = this.rnd;
	var x0 = x/l;
	var y0 = y/l;
	var tx = x0%1;
	var ty = y0%1;
	x0=Math.floor(x0)%n;
	y0=Math.floor(y0)%n;
	var x1 = (x0+1)%n;
	var y1 = (y0+1)%n;
	var v00 = rnd[y0][x0];
	var v01 = rnd[y0][x1];
	var v10 = rnd[y1][x0];
	var v11 = rnd[y1][x1];
	if(doTop)
	{
		if(x<l)
		{
			v00 = rnd[0][y0];
			v10 = rnd[0][y1];
		}
		if(x>256-l)
		{
			y0 = (255-y)/l;
			y0 = Math.floor(y0)%n;
			y1 = (y0+1)%n;
			v01 = rnd[0][y1];
			v11 = rnd[0][y0];
			
		}
		if(y<l)
		{
			x0 = (255-x)/l;
			x0 = Math.floor(x0)%n;
			x1 = (x0+1)%n;
			v00 = rnd[0][x1];
			v01 = rnd[0][x0];
		}
	}
	var v1 = smoothStep(v00,v01,tx);
	var v2 = smoothStep(v10,v11,tx);
	return smoothStep(v1,v2,ty);
}

NoiseTexture.prototype.doTxt = function(nOct,doTop,fn)
{
	var n = this.n;
	var rnd = this.rnd;
	for(var y=0;y<256;y++)
		for(var x=0;x<256;x++)
		{
			var l = 256/n;
			var v = 0;
			var h = 0.5;
			for(var o=0;o<nOct;o++)
			{
				v += this.Perlin(x,y,l,doTop)*h;
				l/=2;
				h/=2;
			}
			fn(x,y,v);
		}
}

NoiseTexture.prototype.getMinMax = function(nOct)
{
	var max = 0;
	var min = 1;
	this.doTxt(nOct,false,function(x,y,v)
	{
		if(v>max) max=v;
		if(v<min) min=v;
	});
	return [min,max];
}

NoiseTexture.prototype.render = function(canvas,nOct,doTop,max,min)
{
	if(canvas==undefined)
	{
		canvas = document.createElement("canvas");
	}
	canvas.width = canvas.height = 256;
	var	c2d = canvas.getContext('2d');
	
	if(max==undefined)
	{
		var tmp = this.getMinMax(nOct);
		min = tmp[0];
		max = tmp[1];
	}
	this.doTxt(nOct,doTop,function(x,y,v)
	{
		var c = Math.round(v*255/max);
		c2d.fillStyle= 'rgb('+c+','+c+','+c+')';
		c2d.fillRect(x,y,1,1);
	});
	/*
	c2d.fillStyle= '#FFF';
	c2d.font="20px Georgia";
	var dim = 256;
	c2d.fillText("TOP",dim/2,20);
	c2d.fillText("LEFT",2,100);
	c2d.fillText("BOTTOM",100,dim-2);
	c2d.fillText("RIGHT",dim-c2d.measureText("RIGHT").width-2,100);
//*/
}

function textureFromCanvas(gl,canvasTmp)
{
	var txt = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, txt);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
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
		var v = vector.normalize([px-nx,ny-py,10]);
		c2d.fillStyle= 'rgb('+Math.round((v[0]+1)*127.5)+','+Math.round((v[1]+1)*127.5)+','+Math.round((v[2]+1)*127.5)+')';
		c2d.fillRect(x,y,1,1);
	}
	return textureFromCanvas(gl,canvasTmp);
}

