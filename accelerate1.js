/**
 * accelerate.js
 * generate data structure for bounding box
 * acculate a ray hit with which triangle
 * update data structu
 */
 const vec3 roomMin = vec3(-10, -10, -20), roomMax = vec3(10, 10, 20);
 const var voxelLength = 1;
 var accelerateData = new Array();
 mat3 tri = mat3(
 	2.3,4.2,7.4,
 	-2,-4.2,-9,
 	8.9,7.3,2.1
 );
 void AbuilDat(){}

 boolean AtriHitCube(mat3 tri, vec3 cubeCore, var length){
 	vec3 vertexCube1,vertexCube2,vertexCube3,vertexCube4;
 	for (var i = 0; i < 6 ; ++i)
 	{
 		if(i == 0)
 		{
 			vertexCube1 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 			vertexCube2 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube3 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 			vertexCube4 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 		}
 		else if(i == 1)
 		{
 			vertexCube1 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 			vertexCube2 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube3 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 			vertexCube4 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 		}
 		else if(i == 2)
 		{
 			vertexCube1 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 			vertexCube2 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube3 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube4 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 		}
 		else if(i == 3)
 		{
 			vertexCube1 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 			vertexCube2 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 			vertexCube3 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 			vertexCube4 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 		}
 		else if(i == 4)
 		{
 			vertexCube1 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 			vertexCube2 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z - length/2);
 			vertexCube3 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 			vertexCube4 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z - length/2);
 		}
 		else 
 		{
 			vertexCube1 = vec3(cubeCore.x - length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube2 = vec3(cubeCore.x + length/2,cubeCore.y - length/2,cubeCore.z + length/2);
 			vertexCube3 = vec3(cubeCore.x + length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 			vertexCube4 = vec3(cubeCore.x - length/2,cubeCore.y + length/2,cubeCore.z + length/2);
 		}

 		vec3 TriVer1 = vec3(tri[0][0],tri[0][1],tri[0][2]);
 		vec3 TriVer2 = vec3(tri[1][0],tri[1][1],tri[1][2]);
 		vec3 TriVer3 = vec3(tri[2][0],tri[2][1],tri[2][2]);
 		vec3 hitPoint;
 		if(AsegmentInterTri(tri,vertexCube1,vertexCube2,hitPoint) ||
 			AsegmentInterTri(tri,vertexCube2,vertexCube3,hitPoint) ||
 			AsegmentInterTri(tri,vertexCube1,vertexCube4,hitPoint) ||
 			AsegmentInterTri(tri,vertexCube3,vertexCube4,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube2.x,vertexCube2.y,vertexCube2.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer1,TriVer2,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube2.x,vertexCube2.y,vertexCube2.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer3,TriVer2,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube2.x,vertexCube2.y,vertexCube2.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer1,TriVer3,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube4.x,vertexCube4.y,vertexCube4.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer1,TriVer2,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube4.x,vertexCube4.y,vertexCube4.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer3,TriVer2,hitPoint) ||
 			AsegmentInterTri(mat3(vertexCube1.x,vertexCube1.y,vertexCube1.z,vertexCube4.x,vertexCube4.y,vertexCube4.z,vertexCube3.x,vertexCube3.y,vertexCube3.z),TriVer1,TriVer3,hitPoint)）
 			return true；
 	}
 	return false;
 }

 boolean AsegmentInterTri(mat tri, vec3 vertex1, vec3 vertex2, out vec3 hitPoint){
	var a = (tri[1][1] - tri[0][1]) * (tri[2][2] - tri[0][2]) - (tri[2][1] - tri[0][1]) * (tri[1][2] - tri[0][2]);
 	var b = (tri[1][2] - tri[0][2]) * (tri[2][0] - tri[0][0]) - (tri[2][2] - tri[0][2]) * (tri[1][0] - tri[0][0]);
 	var c = (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1]);
 	vec3 norm = vertex1 - vertex2;
 	var vpt = norm.x * a + norm.y * b + norm.z * c;
 	if(vpt == 0)
 		return false;
 	else
 	{
 		var t = ((tri[0][0] - vertex1.x) * a + (tri[0][1] - vertex1.y) * b + (tri[0][2] - vertex1.z) * c) / vpt;
 		vec3 inter(vertex1.x + norm.x * t, vertex1.y + norm.y * t, vertex1.z + norm.z * t);
 		hitPoint = inter;
 		var min,max
 		if(vertex1.x < vertex2.x)
 		{	min = vertex1.x;	max = vertex2.x; }
 		else
 		{	min = vertex2.x;	max = vertex2.x; }
 		if(inter.x < min || inter.x > max)
 			return false;
 		if(tri[0][2] != tri[1][2])
 			return ApointInTri(vec2(tri[0][0],vec3[0][1]),vec2(tri[1][0],tri[1][1]),vec2(tri[2][0],tri[2][1]),vec2(inter.x,inter.y));
 		else if(tri[0][1] != tri[1][1])
 			return ApointInTri(vec2(tri[0][0],vec3[0][2]),vec2(tri[1][0],tri[1][2]),vec2(tri[2][0],tri[2][2]),vec2(inter.x,inter.z));
 		else
 			return ApointInTri(vec2(tri[0][2],vec3[0][1]),vec2(tri[1][2],tri[1][1]),vec2(tri[2][2],tri[2][1]),vec2(inter.z,inter.y));
 	} 
 }

 boolean ApointInTri(vec2 A, vec2 B, vec2 C, vec2 P){
 	vec2 v0 = C - A;
 	vec2 v1 = B - A;
 	vec2 v2 = P - A;

 	var dot00 = v0.x * v0.x + v0.y * v0.y;
 	var dot01 = v0.x * v1.x + v0.y * v1.y;
 	var dot01 = v0.x * v2.x + v0.y * v2.y;
 	var dot11 = v1.x * v1.x + v1.y * v1.y;
 	var dot12 = v1.x * v2.x + v1.y * v2.y;

 	var inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);
 	var u = (dot11 * dot02 - dot01 * dot12) * inverDeno;
 	if(u < 0 || u > 1)
 		return false;
 	var v = (dot00 * dot12 - dot01 * dot02) * inverDeno;
 	if(v < 0 || v > 1)
 		return false;
 	return u + v <= 1;
 }

 void AbuilData(){
 	for(int i = 0 ; i < ((roomMax.x - roomMin.x) * (roomMax.y - roomMin.y) * (roomMax.z - roomMax.z)) / (voxelLength * voxelLength))
 		accelerateData[i] = new Array();

 	//for each triangle %%%

 	var minX,maxX,minY,minY,minZ,maxZ;
 	minX = min(tri[0][0],tri[1][0],tri[2][0]);
 	maxX = max(tri[0][0],tri[1][0],tri[2][0]);
 	minY = min(tri[0][1],tri[1][1],tri[2][1]);
 	maxY = max(tri[0][1],tri[1][1],tri[2][1]);
 	minZ = min(tri[0][2],tri[1][2],tri[2][2]);
 	maxZ = max(tri[0][2],tri[1][2],tri[2][2]);
 	vec3 minCore,maxCore;
 	if(minX < (int)(minX-roomMin.x) * voxelLength + roomMin.x)
 		minCore.x = (int)(minX-roomMin.x) * voxelLength + roomMin.x - voxelLength/2;
 	else
 		minCore.x = (int)(minX-roomMin.x) * voxelLength + roomMin.x + voxelLength/2;

 	if(maxX < (int)(maxX-roomMin.x) * voxelLength + roomMin.x)
 		maxCore.x = (int)(maxX-roomMin.x) * voxelLength + roomMin.x - voxelLength/2;
 	else
 		maxCore.x = (int)(maxX-roomMin.x) * voxelLength + roomMin.x + voxelLength/2;

 	if(minY < (int)(minY-roomMin.y) * voxelLength + roomMin.y)
 		minCore.y = (int)(minY-roomMin.y) * voxelLength + roomMin.y - voxelLength/2;
 	else
 		minCore.y = (int)(minY-roomMin.y) * voxelLength + roomMin.y + voxelLength/2;

 	if(maxY < (int)(maxY-roomMin.y) * voxelLength + roomMin.y)
 		maxCore.y = (int)(maxY-roomMin.y) * voxelLength + roomMin.y - voxelLength/2;
 	else
 		maxCore.y = (int)(maxY-roomMin.y) * voxelLength + roomMin.y + voxelLength/2;

 	if(minZ < (int)(minZ-roomMin.z) * voxelLength + roomMin.z)
 		minCore.z = (int)(minZ-roomMin.z) * voxelLength + roomMin.z - voxelLength/2;
 	else
 		minCore.z = (int)(minZ-roomMin.z) * voxelLength + roomMin.z + voxelLength/2;

 	if(maxZ < (int)(maxZ-roomMin.z) * voxelLength + roomMin.z)
 		maxCore.z = (int)(maxZ-roomMin.z) * voxelLength + roomMin.z - voxelLength/2;
 	else
 		maxCore.z = (int)(maxZ-roomMin.z) * voxelLength + roomMin.z + voxelLength/2;

 	var perX = (roomMax.x - roomMin.x)/voxelLength;
 	var perY = (roomMax.y - roomMin.y)/voxelLength;
 	for(int x = minCore.x ; x <= maxCore.x ; x += voxelLength)
 		for(int y = minCore.y ; y <= maxCore.y ; y += voxelLength)
 			for(int z = minCore.z ; z <= maxCore.z ; z += voxelLength){
 				if(AtriHitCube(tri,vec3(x,y,z),voxelLength)){
 					var voxelID = (z-roomMin.z)/voxelLength * perX * perY + (y - roomMin.y)/voxelLength * perX + (x - roomMin.x)/voxelLength;
 					accelerateData[voxelID][accelerateData[voxelID].length] = 0; //%%%
 				}
 			}
 }

 void AintersectBox(vec3 origin, vec3 dir, out vec3 hit, out vec3 hitNormal, out boolean hitW){
 	var perX = dir.x / Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
 	var perY = dir.y / Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
 	var perZ = dir.z / Math.sqrt(dir.x * dir.x + dir.y * dir.y + dir.z * dir.z);
 	vec3 core,hitPoint;
 	var model;

 	if(origin.x < (int)(origin.x-roomMin.x) * voxelLength + roomMin.x)
 		core.x = (int)(origin.x-roomMin.x) * voxelLength + roomMin.x - voxelLength/2;
 	else
 		core.x = (int)(origin.x-roomMin.x) * voxelLength + roomMin.x + voxelLength/2;

 	if(origin.y < (int)(origin.y-roomMin.y) * voxelLength + roomMin.y)
 		core.y = (int)(origin.y-roomMin.y) * voxelLength + roomMin.y - voxelLength/2;
 	else
 		core.y = (int)(origin.y-roomMin.y) * voxelLength + roomMin.y + voxelLength/2;

 	if(origin.z < (int)(origin.z-roomMin.z) * voxelLength + roomMin.z)
 		core.z = (int)(origin.z-roomMin.z) * voxelLength + roomMin.z - voxelLength/2;
 	else
 		core.z = (int)(origin.z-roomMin.z) * voxelLength + roomMin.z + voxelLength/2;

 	AsegmentInterCore(origin, vec3(origin.x+perX, origin.y+perY, origin.z+perZ),core,hitPoint,model, -1);
 	while(1){
 		if(model == 0)
 			core.x += voxelLength;
 		else if(model == 1)
 			core.x -= voxelLength;
 		else if(model == 2)
 			core.y += voxelLength;
 		else if(model == 3)
 			core.y -= voxelLength;
 		else if(model == 4)
 			core.z += voxelLength;
 		else
 			core.z -= voxelLength;
 		if(core.x > roomMax.x || core.x < roomMin.x || core.y > roomMax.y || core.y < roomMin.y || core.z > roomMax.z || core.z < roomMin.z)
 		{ hit = false; return; }
 		var perx = (roomMax.x - roomMin.x)/voxelLength;
 		var pery = (roomMax.y - roomMin.y)/voxelLength;
 		var voxelID = (core.z-roomMin.z)/voxelLength * perx * pery + (core.y - roomMin.y)/voxelLength * perx + (core.x - roomMin.x)/voxelLength;
 		if(accelerateData[voxelID].voxelLength == 0)
 			AsegmentInterCore(hitPoint, vec3(hitPoint.x+perX, hitPoint.y+perY, hitPoint.z+perZ),core,hitPoint,model, model);
 		else
 		{
 			//%%% get each tri in accelerateData[voxelID]
 			//%%% z buffer
 			vec hitTri;
 			if(AsegmentInterTri(tri, hitPoint, vec3(hitPoint.x+perX, hitPoint.y+perY, hitPoint.z+perZ),hitTri))
 			{
 				hitW = true;
 				hit = hitTri;
 				var a = (tri[1][1] - tri[0][1]) * (tri[2][2] - tri[0][2]) - (tri[2][1] - tri[0][1]) * (tri[1][2] - tri[0][2]);
 				var b = (tri[1][2] - tri[0][2]) * (tri[2][0] - tri[0][0]) - (tri[2][2] - tri[0][2]) * (tri[1][0] - tri[0][0]);
 				var c = (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[2][0] - tri[0][0]) * (tri[1][1] - tri[0][1]);
 				hitNormal = vec3(a,b,c);
 				return;
 			}
 		}		
 	}
 }

 void AsegmentInterCore(vec3 origin,vec3 point,vec3 core, out vec3 hitPoi, out var model, val lastModel){
 	vec3 hitPoint;
 	if(lastModel != 1 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 0; //+x
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 1 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 0; //+x
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 0 && AsegmentInterTri(mat(core.x - voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 1; //-x
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 0 && AsegmentInterTri(mat(core.x - voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 1; //-x
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 3 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2,
 							core.x - voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 2; //+y
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 3 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 2; //+y
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 2 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 3; //-y
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 2 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 3; //-y
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 5 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2), origin, point, hitPoint))
 	{
 		model = 4; //+z
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 5 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y + voxelLength/2, core.z + voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z + voxelLength/2), origin, point, hitPoint))
 	{
 		model = 4; //+z
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 4 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2,
 							core.x + voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 5; //-z
 		hitPoi = hitPoint;
 	}
 	else if(lastModel != 4 && AsegmentInterTri(mat(core.x + voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2,
 							core.x - voxelLength/2, core.y + voxelLength/2, core.z - voxelLength/2,
 							core.x - voxelLength/2, core.y - voxelLength/2, core.z - voxelLength/2), origin, point, hitPoint))
 	{
 		model = 5; //-z
 		hitPoi = hitPoint;
 	}
 }





