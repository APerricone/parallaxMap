#extension GL_EXT_frag_depth : enable
#ifdef GL_ES
precision highp float;
#endif
uniform sampler2D sDepthTxt;
uniform sampler2D sNormalTxt;

uniform mat4 uPVMatrix;
uniform mat4 uInvPVMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uInvTransModelMatrix;

/*flat */varying vec4 uPlane0;
/*flat */varying vec4 vPlane0;
/*flat */varying vec4 uPlane1;
/*flat */varying vec4 vPlane1;

/*flat */varying vec4 plane0;
/*flat */varying vec4 plane1;

uniform vec2 uScreenSize;

vec3 linePlane(vec3 a,vec3 b,vec4 plane)
{
	// dot(vec4(P,-1),plane) = 0
	// P = a + t * (b-a)
	// found plane . (a+t*(b-a),-1) = 0
	// plane . (a,-1) + plane . (t*(b-a),0) = 0
	// plane . (a,-1) + t * plane . ((b-a),0) = 0
	// t = - plane . (a,-1) / plane . (b-a,0) 
	vec3 dir = b-a;
	float t = -dot(plane,vec4(a,-1.0)) / dot(plane,vec4(dir,0.0));
	return mix(a,b,t);
}

float GetCollision(float v0,float v1,float u0,float u1)
{
	// v0 + (v1-v0)t = u0 + (u1-u0)t
	// (v1-v0-u1+u0)*t = u0-v0
	return (u0-v0)/(v1-v0-u1+u0);
}
#define EPS 1e-10
#define N_STEP 16.0
#define STEP (1.0/N_STEP)
void main() 
{
	vec2 screenPos = (gl_FragCoord.xy/uScreenSize)*2.0-vec2(1.0);
	vec4 posA = uInvPVMatrix * vec4( screenPos,0,1 ); 
	vec4 posB = uInvPVMatrix * vec4( screenPos,1,1 ); 
	posA/=posA.w;
	posB/=posB.w;
	vec3 pos0 = linePlane(posA.xyz,posB.xyz,plane0);
	vec3 pos1 = linePlane(posA.xyz,posB.xyz,plane1);
	//vec4 s0 = uPVMatrix * vec4(pos0,1); s0/=s0.w; 
	//vec4 s1 = uPVMatrix * vec4(pos1,1); s1/=s1.w; 
	vec3 txt0 = vec3(dot(uPlane0,vec4(pos0,1)),dot(vPlane0,vec4(pos0,1)),pos0.z);
	vec3 txt1 = vec3(dot(uPlane1,vec4(pos1,1)),dot(vPlane1,vec4(pos1,1)),pos1.z);
	vec3 result = vec3(-0.5);
	float t,nt;
	float h0, h1; 
	vec3 uv0,uv1,finalPos;
	t=nt=1.0;
	uv0=uv1=txt1;
	h0=h1=texture2D(sDepthTxt,txt1.xy).x; 	
	for(int i=0;i<int(N_STEP);i++)
	{
		t=nt;
		uv1 = uv0;
		h1=h0;
		nt = t- STEP;
		uv0 = mix(txt0,txt1,nt);
		h0 = texture2D(sDepthTxt,uv0.xy).x; 
		float r = GetCollision(h0,h1,nt,t);
		if( r>=0.0-EPS && r<=1.0+EPS)
		{
			result = mix(uv0,uv1,r);
			//if(result.x>=0.0 && result.y>=0.0 && result.x<=1.0 && result.y<=1.0 )
			if(all(greaterThanEqual(result.xy,vec2(0.0))) && all(lessThanEqual(result.xy,vec2(1.0))))
			{
				finalPos = mix(pos0,pos1,nt+r*STEP);
				break;
			}
			else
				result = vec3(1.5);
		}
	}
	
	if(all(greaterThanEqual(result.xy,vec2(0.0))) && all(lessThanEqual(result.xy,vec2(1.0))))
	{
		vec3 n = texture2D(sNormalTxt,result.xy).xyz * vec3(2.0) - vec3(1.0);
		n = (uInvTransModelMatrix * vec4(n,0)).xyz;
		float l = clamp(dot(n,vec3(0.4,0.8,0.5)),0.0,1.0);
		l = l * 0.8 + 0.2;
		gl_FragColor = vec4(l,l,l,1);
		//#if GL_EXT_frag_depth
		//vec4 screenPos = uPVMatrix * vec4(pos1,1);  
		//screenPos/=screenPos.w;
		//gl_FragDepthEXT = screenPos.z;
		////#endif 
		//gl_FragColor = vec4(screenPos.xyz,1);
	}
	else
		discard;
		//gl_FragColor = vec4(result,1); 
	//gl_FragColor = vec4(h0,h0,h0,1.0);
	//gl_FragColor = vec4(txt1.xy,0,1.0);
}

