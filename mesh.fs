#extension GL_EXT_frag_depth : enable
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D sNormalTxt;
uniform mat4 uInvTransModelMatrix;
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
		vec3 n = texture2D(sNormalTxt,uv).xyz * vec3(2.0) - vec3(1.0);
		n = (uInvTransModelMatrix * vec4(n,0)).xyz;
		float l = clamp(dot(n,vec3(0.4,0.8,0.5)),0.0,1.0);
		l = l * 0.8 + 0.2;
		gl_FragColor = vec4(l,l,l,1);
		#if GL_EXT_frag_depth
			vec4 screenPos = uPVMatrix * vec4(pos,1);  
			screenPos/=screenPos.w;
			gl_FragDepthEXT = (screenPos.z+1.0)/2.0;
		#endif 
	} else
		discard;
}

