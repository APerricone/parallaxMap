#extension GL_EXT_frag_depth : enable
#ifdef GL_ES
precision highp float;
#endif
uniform mat4 uPVMatrix;

#include "parallax.fs_i"

void main() 
{
	vec3 pos;
	vec2 uv;
	float t;
	if(parallax(pos,uv,t))
	{
		gl_FragColor = vec4(1);
		#if GL_EXT_frag_depth
			vec4 screenPos = uPVMatrix * vec4(pos,1);  
			screenPos/=screenPos.w;
			gl_FragDepthEXT = (screenPos.z+1.0)/2.0;
		#endif 
	} else
		discard;
}

