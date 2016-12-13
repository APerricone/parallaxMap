function NoiseTexture(n,canvas)
{
	if(n==undefined) n=8;
	if(canvas==undefined)
	{
		canvas = document.createElement("canvas");
		canvas.width = canvas.height = 256;
	}
	var	c2d = canvas.getContext('2d');
	var rnd = [];
	var n = 8;
	for(var y=0;y<n;y++) 
	{
		rnd[y] = [];
		for(var x=0;x<n;x++) 
			rnd[y][x] = Math.random();
	}
	this.canvas = canvas;
	this.c2d = c2d;
	this.rnd = rnd;
	this.n = n;
}

function smoothStep(v1,v2,t)
{
	t = t * t * t * (t * (t * 6 - 15) + 10);
	return v1*(1-t)+v2*t;
}

NoiseTexture.prototype.Perlin = function(x,y)
{
	var n = this.n;
	var rnd = this.rnd;
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

NoiseTexture.prototype.doTxt = function(nOct,fn)
{
	var n = this.n;
	var rnd = this.rnd;
	for(var y=0;y<this.canvas.height;y++)
		for(var x=0;x<this.canvas.width;x++)
		{
			var l = 256/n;
			var v = 0;
			var h = 0.5;
			for(var o=0;o<nOct;o++)
			{
				v += this.Perlin(x/l,y/l)*h;
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
	this.doTxt(nOct,function(x,y,v)
	{
		if(v>max) max=v;
		if(v<min) min=v;
	});
	return [min,max];
}

NoiseTexture.prototype.render = function(nOct,max,min)
{
	if(max==undefined)
	{
		var tmp = this.getMinMax(nOct);
		min = tmp[0];
		max = tmp[1];
	}
	var c2d = this.c2d;
	this.doTxt(nOct,function(x,y,v)
	{
		var c = Math.round(v*255/max);
		c2d.fillStyle= 'rgb('+c+','+c+','+c+')';
		c2d.fillRect(x,y,1,1);
	});
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
		var v = vector.normalize([px-nx,py-ny,10]);
		c2d.fillStyle= 'rgb('+Math.round((v[0]+1)*127.5)+','+Math.round((v[1]+1)*127.5)+','+Math.round((v[2]+1)*127.5)+')';
		c2d.fillRect(x,y,1,1);
	}
	return textureFromCanvas(gl,canvasTmp);
}

