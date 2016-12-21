function Shadow(gl)
{
	this.dim = 512;
	this.gl = gl;
	var ext = gl.getExtension("WEBGL_depth_texture");
	
	this.shadowMap = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.shadowMap);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.dim, this.dim, 0,gl.DEPTH_COMPONENT,gl.UNSIGNED_SHORT,null);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	var colorBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, colorBuffer );
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGB565, this.dim, this.dim);

	
	this.frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowMap, 0);
	
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	this.camera = new Camera();
	this.camera.ortho = true;
	
	this.dir = vector. normalize([-0.4,-0.8,-0.5]);
}

// move it on camera?
Shadow.prototype.setBBox = function(min,max)
{
	var center = vector.scale(vector.add(min,max),0.5);
	var diag = vector.sub(max,min)
	var len = Math.sqrt(vector.dot(diag,diag)); //vector.length(diag)
	this.camera.look = center;
	this.camera.pos = vector.sub( center, vector.scale(this.dir, len) )
	this.camera.nearPlane = len * 0.5;
	this.camera.farPlane = this.camera.nearPlane + len;
	this.camera.height = len;
}

Shadow.prototype.setForRender = function()
{
	var gl = this.gl;
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
	gl.viewport(0,0,this.dim,this.dim);
	gl.clearColor(0,0,0,1);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)		
}
