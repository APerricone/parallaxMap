function main()
{
	var c = document.createElement("canvas");
	document.body.appendChild(c);
	var	 gl = c.getContext('webgl');
	if(gl === null )
	{
		alert("WebGL not supported");
				throw "error";
	}
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.getExtension("EXT_frag_depth");
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	var mesh = new Mesh(gl,draw);
	var camera = new Camera();
	var shadow = new Shadow(gl);
	shadow.setBBox([-1.1,-1.1,-1.1],[1.1,1.1,1.1]);
	
	var down = false;
	var exX,exY;
	var alpha=0, beta=0, dist = 7;
	camera.pos = [0,0,dist];
	camera.look = [0,0,-0.2];
	camera.nearPlane = dist-2;
	camera.farPlane = dist+2;
	camera.persp = true;
	camera.fovDeg = 35;

	
	c.onmousedown = function(e)
	{
		down = true;
		exX =e.screenX;
		exY =e.screenY;
	};
	c.onmouseup = function() { down = false; };
	c.onmouseout = function() { down = false; };
	function SetCamera()
	{
		if(beta>1.5) beta=1.5;
		if(beta<-1.5) beta=-1.5;
		var sa = Math.sin(alpha);
		var ca = Math.cos(alpha);
		var sb = Math.sin(beta);
		var cb = Math.cos(beta);
		camera.pos = [dist*cb*sa,dist*sb,dist*cb*ca];
		camera.nearPlane = dist-2;
		camera.farPlane = dist+2;
	}
	c.onmousemove = function(e)
	{
		if( down )
		{
			var deltax =e.screenX-exX;
			var deltay =e.screenY-exY;
			alpha+=deltax/100;
			beta-=deltay/100;
			SetCamera();
			
			exX =e.screenX;
			exY =e.screenY;
			draw();
		}
	};
	c.onmousewheel = function(e)
	{
		e.wheelDelta = e.detail ? e.detail*(-1) : e.wheelDelta;
		if( e.wheelDelta > 0)
			dist += 1;
		else
			dist -= 1;
		if(dist<3) dist = 3;
		SetCamera();
		draw();
	};
	var selText = document.getElementById('texture');
	selText.onchange = draw;
	var selModel= document.getElementById('model');
	selModel.onchange = draw;
	var selWire = document.getElementById('wire');
	selWire.onchange = draw;
	function draw()
	{
		shadow.setForRender();
		mesh.drawShadow(shadow.camera.viewProj, shadow.camera.invViewProj,
						shadow.dim,shadow.dim)
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0,0,c.width,c.height);
		gl.clearColor(0.4, 0.4, 0.7, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		mesh.draw(camera.viewProj,camera.invViewProj,
			//shadow.camera.viewProj, shadow.camera.invViewProj,
			c.width,c.height,
			parseInt(selText.value),parseInt(selModel.value),
			shadow.shadowMap,shadow.camera.viewProj);
		if(selWire.checked)
			mesh.drawDebug(camera.viewProj);
			//mesh.drawDebug(shadow.camera.viewProj)
	}

	function onResize()
	{
		c.width = innerWidth - 16;
		c.height = innerHeight - 16;
		camera.aspectRatio = c.width / c.height;
		draw();
	}
	window.onresize=onResize;

	onResize();
};
