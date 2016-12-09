function debugDraw(gl)
{
	this.gl = gl;
	this.program = compile(gl,
	"attribute vec3 pos;\n" +
	"uniform mat4 uPVMatrix;\n"+
	"varying vec3 cc;\n"+
	"void main() {	cc=pos; gl_Position = uPVMatrix *vec4(pos,1); }",
	"#ifdef GL_ES\n"+
	"precision highp float;\n"+
	"#endif\n"+
	"varying vec3 cc;\n"+
	"void main() { gl_FragColor = vec4(cc,1.0); }");
	this.posLocation = gl.getAttribLocation(this.program, "pos");
	this.pvMatrixUniform = gl.getUniformLocation(this.program, "uPVMatrix");

	this.vBuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
		 0.8, 0.8, 0.0,  0.8, 0.8,-0.4,
		-0.8, 0.8, 0.0, -0.8, 0.8,-0.4,
		 0.8,-0.8, 0.0,  0.8,-0.8,-0.4,
		-0.8,-0.8, 0.0, -0.8,-0.8,-0.4,

		 0.8, 0.8, 0.0, -0.8, 0.8, 0.0,
		 0.8,-0.8, 0.0, -0.8,-0.8, 0.0,
		 0.8, 0.8,-0.4, -0.8, 0.8,-0.4,
		 0.8,-0.8,-0.4, -0.8,-0.8,-0.4,

		 0.8, 0.8, 0.0,  0.8,-0.8, 0.0,
		-0.8, 0.8, 0.0, -0.8,-0.8, 0.0,
		 0.8, 0.8,-0.4,  0.8,-0.8,-0.4,
		-0.8, 0.8,-0.4, -0.8,-0.8,-0.4
	]), gl.STATIC_DRAW);
}

debugDraw.prototype.draw = function(matrix)
{
	if(this.program == undefined) return;
	var gl=this.gl;
	gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuff);
	gl.useProgram(this.program);	
	gl.uniformMatrix4fv(this.pvMatrixUniform, false, matrix);

	gl.enableVertexAttribArray(this.posLocation);
	gl.vertexAttribPointer(this.posLocation, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.LINES, 0, 24);	
}
