function loadProgram(gl,vsUrl,fsUrl,fn)
{
	var vs = undefined,fs = undefined;
	function onLoad()
	{
		if(vs==undefined || fs==undefined)
			return;
		fn(compile(gl,vs,fs));
	}
	var xhr = new XMLHttpRequest();
	xhr.open('GET', vsUrl, true);
	xhr.onload = function(e) {
		if(xhr.status==200)
		{
			vs = xhr.response;
			onLoad()
		}			
		else
			alert("unable to download "+vsUrl)
	};	 
	xhr.send();	
	var xhr2 = new XMLHttpRequest();
	xhr2.open('GET', fsUrl, true);
	xhr2.onload = function(e) {
		if(xhr2.status==200)
		{
			fs = xhr2.response;
			onLoad()
		}			
		else
			alert("unable to download "+fsUrl)
	};	 
	xhr2.send();	
}

function compile(gl,vs,fs)
{
	var vShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vShader, vs);
	gl.compileShader(vShader);
	console.log("compile vertex shader...");
	console.log(gl.getShaderInfoLog(vShader));
	var fShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fShader, fs);
	gl.compileShader(fShader);
	console.log("compile fragment shader...");
	console.log(gl.getShaderInfoLog(fShader));
	var program = gl.createProgram();
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);	
	console.log("linking...");
	console.log(gl.getProgramInfoLog(program));	
	return program;
}
