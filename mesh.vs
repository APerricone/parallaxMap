attribute vec3 pos;
uniform mat4 uPVMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uInvTransModelMatrix;

uniform vec4 u_uPlane0;
uniform vec4 u_vPlane0;
uniform vec4 u_uPlane1;
uniform vec4 u_vPlane1;

uniform vec4 u_plane0;
uniform vec4 u_plane1;

varying vec4 uPlane0;
varying vec4 vPlane0;
varying vec4 uPlane1;
varying vec4 vPlane1;

varying vec4 plane0;
varying vec4 plane1;



void main() 
{ 
	vec4 sPos = uPVMatrix * uModelMatrix * vec4(pos,1);  
	gl_Position = sPos;

	uPlane0 = uInvTransModelMatrix * u_uPlane0;
	vPlane0 = uInvTransModelMatrix * u_vPlane0;
	uPlane1 = uInvTransModelMatrix * u_uPlane1;
	vPlane1 = uInvTransModelMatrix * u_vPlane1;
	
	plane0 = uInvTransModelMatrix * u_plane0;
	plane1 = uInvTransModelMatrix * u_plane1;
}
