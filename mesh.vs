attribute vec3 pos;
uniform mat4 uPVMatrix;
uniform mat4 uModelMatrix;

void main() 
{ 
	vec4 sPos = uPVMatrix * uModelMatrix * vec4(pos,1);  
	gl_Position = sPos;
}
