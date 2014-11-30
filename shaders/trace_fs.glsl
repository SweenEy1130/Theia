precision mediump float;
//data structures
struct Camera{
	vec3 pos,rotv;
	float fov_factor;//tan( radians( fov /2.0) ) ;
	vec2 res;
};
struct Ray{
	vec3 dir;
	vec3 origin;
};
struct Sphere{
	vec3 pos;
	float rad;
	int mt;
};
struct Box{
	vec3 min,max;
	int mt;
};
struct Material{ //BRDF or something
	//here we use ka,kd,ks for test
	vec3 ka,kd,ks;
	float ns;
};
struct Hit{
	vec3 pos;
	vec3 norm;
	vec2 uv;//texture coord
	int mt;//point to 
};
const int LIGHT_AREA = 1;
struct Light{
	vec3 posOrDir;//positional light use pos while directional light use direction
	vec3 size;//radius for sphere light
	bool isDirectional;
	int type;//sphere light or area light
	vec3 Is;//specular intensity
	vec3 Id;//diffuse intensity
};

uniform Camera camera;
uniform mat3 trans;
uniform float sampleCount;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform highp float globTime;
//const setting
const int BOUNCE = 3;//max bounce time
const float EPSILON = 0.001;//tolerance
const float INFINITY = 10000.;
const int X = 0, Y = 1, Z = 2;
const int SAMPLE_NUM = 1;
float msample = sqrt(float(SAMPLE_NUM));
float s;//seed for random generator

//temporal vars should be uniforms
const Light light1 = Light(vec3(-10, 9, -1), vec3(0, 2, 1), false, LIGHT_AREA, vec3(1.), vec3(1.));
const Box room = Box(vec3(-10, -10, -20), vec3(10, 10, 20), 0);
Material material[4];//we use dummyMtl to init these 2 mt
const int SPHERE_NUM = 5;
Sphere sphere[SPHERE_NUM];

//some uti
mat3 getRotMat(float degree, int choice){
	float rad = radians(degree);
	if(choice == X)
		return 	mat3(1, 0, 0, 0, cos(rad), -sin(rad), 0, sin(rad), cos(rad));
	else if ( choice == Y )
		return mat3(cos(rad), 0, sin(rad), 0, 1, 0, -sin(rad), 0, cos(rad));
	else return mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);
}

//random function from [Antialiasing by Justaway]
void srand(vec2 p){
	s =sin(dot(p,vec2(423.62431,321.54323)));
}
float rand(){
	s=fract(s*32322.65432+0.12333);
	return abs(fract(s));
}

vec2 randOffset(float sampleCount){
    sampleCount = mod(sampleCount,float(SAMPLE_NUM));
	vec2 offset = vec2(floor(sampleCount/msample),mod(sampleCount,msample));
	offset += vec2(rand(), rand());
	offset /= msample;
	return offset;
}

bool intersectBox(Ray eyeRay,Box box, out float dist){//ray box intersect
	vec3 tMin = (box.min - eyeRay.origin) / eyeRay.dir;
	vec3 tMax = (box.max - eyeRay.origin) / eyeRay.dir;
	vec3 t1 = min(tMin, tMax);
	vec3 t2 = max(tMin, tMax);
	float tNear = max(max(t1.x, t1.y), t1.z);
	float tFar = min(min(t2.x, t2.y), t2.z);
	dist = tFar;
	if(tNear <= tFar && tFar >= 0.)
		return true;
	return false;
}

vec3 normalForBox(vec3 hit, Box box){
	if(hit.x < box.min.x + EPSILON ) return vec3(-1.0, 0.0, 0.0);//box left
	else if(hit.x > box.max.x -  EPSILON) return vec3(1.0, 0.0, 0.0);//box right
	else if(hit.y < box.min.y +  EPSILON ) return vec3(0.0, -1.0, 0.0);//box bottom
	else if(hit.y > box.max.y - EPSILON) return vec3(0.0, 1.0, 0.0);//box top
	else if(hit.z < box.min.z + EPSILON ) return vec3(0.0, 0.0, -1.0);//box front
	else return vec3(0.0, 0.0, 1.0);//box back
	return vec3(0.0, 0.0, 1.0);
}

bool intersectSphere(Sphere sphere, Ray eyeRay, out float dist) {
	vec3 c = sphere.pos - eyeRay.origin;
	float b = dot(eyeRay.dir, c);
	if(b < 0.0)
	return false;
	float d = dot(c, c) - b*b;
	if(d < 0.0 || d > sphere.rad * sphere.rad)
	return false;
	dist = b- sqrt(sphere.rad * sphere.rad- d);
	return true;
}

bool hitSomething(Ray eyeRay, out Hit hit, bool once){
	float mDist = INFINITY, dist = INFINITY;
	vec3 objPos;
	//hit spheres
	for(int i = 0; i < SPHERE_NUM; i++){
		intersectSphere(sphere[i], eyeRay, dist);
		if(dist < mDist){
			if(once) //shadow ray
				return true;
			mDist = dist;
			objPos = sphere[i].pos;
			hit.mt = sphere[i].mt;
		}
	}
	if(mDist == INFINITY)//hit nothing
		return false;
	hit.pos = eyeRay.origin + mDist * eyeRay.dir;
	hit.norm = normalize(hit.pos - objPos);
	return true;
}

vec3 ambient(vec3 color){
	return color;
}
vec3 diffuse(vec3 L, vec3 N, vec3 Id){
	return dot(L, N) * Id;
}
vec3 specular(vec3 L, vec3 N, vec3 V, vec3 Is){
	vec3 R = reflect(L, N);
	return pow(max(dot(R, V), 0.0), 30.) * Is;
}

//simple map test !!!
vec2 mapfoo(vec3 pos){
	pos.x = 0.0;//no use
	pos.y /= room.max.y - room.min.y;
	pos.z /= room.max.z - room.min.z;
	pos += 0.5;
	pos.y = 1.0 - pos.y;
	return pos.yz;
}

vec3 lightAt(Hit hit, vec3 N, vec3 V)//calculate light at a object point
{
	vec3 ka, kd, ks;
	vec3 L = normalize(light1.posOrDir - hit.pos);//use point light
	vec3 R = reflect(L, N);
	vec3 c = vec3(0);

	for(int i = 0; i < 3;i++){
		if(hit.mt == i){
			ka = material[i].ka;
			kd = material[i].kd;
			ks = material[i].ks;
			break;
		}
	}
	c += ambient(vec3(0.2)) * ka;
    //shadow
    vec3 offset = vec3(randOffset(sampleCount), 0);
    float dist = -1.;
    Ray shadowRay = Ray(normalize(light1.posOrDir+offset*light1.size-hit.pos), hit.pos);
    Hit sHit;
    if(hitSomething(shadowRay, sHit, true))
       return c;
    c += diffuse(L, N, light1.Id )* kd ;
    c += specular(L, N, V, light1.Is )*  ks ;		
	return c;
}

int dummySetMtl0(Hit hit){//set material for bounding box
	if(abs(hit.norm.x) == 1.0){
		material[0].kd = material[0].ka = texture2D(tex1, mapfoo(hit.pos)).xyz;
		return 0;
	}
	if(abs(hit.norm.y) == 1.0){
		return 1;
	}
	return 2;
}
void dummyLoadData(){
	//material[0] use texture to change
	material[0].ka = vec3(0.2);//ambient
    material[1] = Material(vec3(0.2),vec3(0.945,0.,0.149),vec3(0),32.);
	material[2] = Material(vec3(0.2),vec3(0.231,0.855,0.),vec3(0.),32.);
	material[3] = Material(vec3(0.1),vec3(0.5),vec3(0.51),32.);

	sphere[0] = Sphere(vec3(0, 0, 0), 1.,3);
	sphere[1] = Sphere(vec3(1, 1, 1), 1.,3);
	sphere[2] = Sphere(vec3(3, -2, -2), 1.,3);
	sphere[3] = Sphere(vec3(-5, 0, -2), 1.,3);
	sphere[4] = Sphere(vec3(5, -2, -2), 1.,3);
}

vec3 intersect(Ray eyeRay){//main ray bounce function
	vec3 color = vec3(0),ncolor;
	Hit hit;
	bool stop = false;
	float dist;
	
	for(int i = 0; i < BOUNCE; i++){
		if(stop)
			break;
		if(hitSomething(eyeRay, hit, false)){
			ncolor = lightAt(hit, hit.norm, eyeRay.dir);
		}
		else{//hit bounding box
			if(intersectBox(eyeRay, room, dist)){
				hit.pos = eyeRay.origin + dist * eyeRay.dir;
				hit.norm = normalForBox(hit.pos, room);
				hit.mt = dummySetMtl0(hit);
				ncolor = lightAt(hit, -hit.norm, eyeRay.dir);//calculate inner color
			}
			stop = true;
		}
		color = i==0 ? ncolor : color * 0.5 +  ncolor * 0.5;
		//fire new ray
		eyeRay.origin = hit.pos;
		eyeRay.dir = reflect(eyeRay.dir, hit.norm);
	}
	return color;
}



void main(void) {
	vec3 color = vec3(0) , pColor;
	vec2 offset;
	vec2 seed = gl_FragCoord.xy/camera.res+globTime;
    //init operation
	srand(seed);//feed random generator
    dummyLoadData();
    //fire random ray
	offset = randOffset(sampleCount);
	Ray eyeRay = Ray(trans*vec3((gl_FragCoord.xy+offset-camera.res/2.)/camera.res.yy * camera.fov_factor,1),camera.pos);//fire eye ray
	eyeRay.dir = normalize(eyeRay.dir);
	pColor = texture2D(tex0, gl_FragCoord.xy/camera.res).rgb;
	color = intersect(eyeRay);	
	gl_FragColor = vec4(mix(pColor,color,1./sampleCount), 1);
	//gl_FragColor = vec4(vec3(offset.x), 1);
}