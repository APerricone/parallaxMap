function myGet(url,onLoaded,extraData)
{
	var xhr = new XMLHttpRequest();
	xhr.extraData = extraData;
	xhr.open('GET', url, true);
	xhr.onload = function(e) {
		if(xhr.status==200)
		{
			var regex = /#include "([^"]*)"/g;
			var text = xhr.response;
			var m = regex.exec(text);
			var n=0;
			while(m)
			{
				n++;
				myGet(m[1],function(inc,mData)
				{
					text=text.replace(mData[0],inc);
					n--;
					if(n==0)
						onLoaded(text,extraData);
				},m);
				m = regex.exec(text);
			}
			if(n==0)
				onLoaded(text,extraData);
		}			
		else
			alert("unable to download "+url)
	};	 
	xhr.send();	
}

function loadProgram(gl,vsUrl,fsUrl,fn)
{
	var vs = undefined,fs = undefined;
	function onLoad()
	{
		if(vs==undefined || fs==undefined)
			return;
		fn(compile(gl,vs,fs));
	}
	myGet(vsUrl,function(resp)
		{
			vs = resp;
			onLoad()
		});	 
	myGet(fsUrl,function(resp)
		{
			fs = resp;
			onLoad()
		});	 
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
