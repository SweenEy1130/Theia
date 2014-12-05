var Accel  = {
	roomMin : null,
	roomMax : null,
	voxelLength : 1,
	accelerateData : null,
	tri : null,  //%%%

 	InitAcc : function(){
 		roomMin = new Array();
 		roomMin[0] = -10;
 		roomMin[1] = -10;
 		roomMin[2] = -20;

 		roomMax = new Array();
 		roomMax[0] = 10;
 		roomMax[1] = 10;
 		roomMax[2] = 20;

 		tri = new Array();
 		tri[0] = 1.5;
 		tri[1] = 0.5;
 		tri[2] = -0.5;
 		tri[3] = -0.5;
 		tri[4] = 0.5;
 		tri[5] = 2.5;
 		tri[6] = 0.5;
 		tri[7] = -0.5;
 		tri[8] = -0.5;

 		accelerateData = new Array();
 	},

 	Min : function(a,b,c){
 		var d;
 		if(a < b)
 			d = a; 
 		else
 			d = b;	

 		if(d < c)
 			return d; 
 		else
 			return c; 
 	},
    
    Max : function(a,b,c){
 		var d;
 		if(a > b)
 			d = a; 
 		else
 			d = b;	

 		if(d > c)
 			return d; 
 		else
 			return c; 
 	},

 	AbuiData : function(){

 		for(var i = 0 ; i < ((roomMax[0] - roomMin[0]) * (roomMax[1] - roomMin[1]) * (roomMax[2] - roomMin[2])) / (this.voxelLength * this.voxelLength) ; ++i)
 		{ accelerateData[i] = new Array(); };

 		var min,max;
 		min = new Array();
 		max = new Array();
 		min[0] = this.Min(tri[0],tri[3],tri[6]);
 		max[0] = this.Max(tri[0],tri[3],tri[6]);
 		min[1] = this.Min(tri[1],tri[4],tri[7]);
 		max[1] = this.Max(tri[1],tri[4],tri[7]);
 		min[2] = this.Min(tri[2],tri[5],tri[8]);
 		max[2] = this.Max(tri[2],tri[5],tri[8]);  

 		var minCore,maxCore;
 		minCore = new Array();
 		maxCore = new Array();
 		for(var i = 0 ; i < 3 ; ++i)
 		{
 			minCore[i] = parseInt((min[i]-roomMin[i])/this.voxelLength) * this.voxelLength + roomMin[i] + this.voxelLength/2;
			maxCore[i] = parseInt((max[i]-roomMin[i])/this.voxelLength) * this.voxelLength + roomMin[i] + this.voxelLength/2;
 		}

 //   document.write(minCore[0] + ','+ minCore[1] + ','+ minCore[2] + ','+ maxCore[0] + ','+ maxCore[1] + ','+ maxCore[2]);
    
 		var perX = parseInt((roomMax[0] - roomMin[0]) / this.voxelLength);
 		var perY = parseInt((roomMax[1] - roomMin[1]) / this.voxelLength);

 		for(var x = minCore[0] ; x <= maxCore[0] ; x += this.voxelLength){  
 			for(var y = minCore[1] ; y <= maxCore[1] ; y += this.voxelLength){ 
    		for(var z = minCore[2] ; z <= maxCore[2] ; z += this.voxelLength){ 
      		var xyz = new Array();
 					xyz[0] = x;
 					xyz[1] = y;
 					xyz[2] = z; 
 					if(this.AtriHitCube(tri,xyz)){ 
            var voxelID = parseInt((z-roomMin[2]-this.voxelLength/2)/this.voxelLength) * perX * perY + parseInt((y - roomMin[1] - this.voxelLength/2)/this.voxelLength) * perX + parseInt((x - roomMin[0] - this.voxelLength/2)/this.voxelLength);
 						accelerateData[voxelID][accelerateData[voxelID].length] = 0; //%%%
 					}
  		  }
      }
    }	 
 	},

 	AtriHitCube : function(tri, cubeCore){  
 		var vertex,core;
 		vertex = new Array();
 		vertex[0] = new Array();
 		vertex[1] = new Array();
 		vertex[2] = new Array();
 		vertex[3] = new Array();
 		core = new Array();

 		for(var i = 0 ; i < 6 ; ++i)   
 		{  
 			core[0] = cubeCore[0];
 			core[1] = cubeCore[1];
 			core[2] = cubeCore[2];
 			var sign,sign1;
 			if(i % 2 == 0)
 				sign = 1;
 			else
 				sign = -1;
 			core[parseInt(i/2)] = core[parseInt(i/2)] + sign * this.voxelLength/2;

 			for(var m = 0 ; m < 4 ; ++m)
 			{
 				if(m % 2 == 0)
 					sign = 1;
 				else
 					sign = -1;

 				if(parseInt(m/2) % 2 == 0)
 					sign1 = 1;
 				else
 					sign1 = -1;

 				vertex[m][parseInt(i/2)%3] = core[parseInt(i/2)%3];
 				vertex[m][parseInt(i/2+1)%3] = core[parseInt(i/2+1)%3] + sign * this.voxelLength/2;
 				vertex[m][parseInt(i/2+2)%3] = core[parseInt(i/2+2)%3] + sign1 * this.voxelLength/2;
 			}

			var triVertex = new Array();
 			for(var j = 0 ; j < 3 ; ++j)
 			{
 				triVertex[j] = new Array();
 				triVertex[j][0] = tri[i*3];
 				triVertex[j][0] = tri[i*3+1];
 				triVertex[j][0] = tri[i*3+2];
 			}	

 			if(this.AsegmentInterTri(tri,vertex[0],vertex[1])[0] ||
 				this.AsegmentInterTri(tri,vertex[0],vertex[2])[0] ||
 				this.AsegmentInterTri(tri,vertex[1],vertex[3])[0] ||
 				this.AsegmentInterTri(tri,vertex[2],vertex[3])[0])
 					return true;

 			var triOfFace = new Array();
 			for(var m  = 0 ; m < 3 ; ++m)
 				for(var n = 0 ; n < 3 ; ++n)
 					triOfFace[m*3+n] = vertex[m][n];

  		for(var m = 0 ; m < 3 ; ++m)
 				if(this.AsegmentInterTri(triOfFace,triVertex[m],triVertex[(m+1)%3])[0])
 					return true;
 	
 			for(var m  = 0 ; m < 3 ; ++m)
 				for(var n = 0 ; n < 3 ; ++n)
 					triOfFace[m*3 + n] = vertex[(m+1)%4][n];

 			for(var m = 0 ; m < 3 ; ++m)
 				if(this.AsegmentInterTri(triOfFace,triVertex[m],triVertex[(m+1)%3])[0])
 					return true;  
 		} 
    return false; 
 	},

 	AsegmentInterTri : function(tri, point1, point2){ 
 		var result = new Array();
 		var a = (tri[4] - tri[1]) * (tri[8] - tri[2]) - (tri[7] - tri[1]) * (tri[5] - tri[2]);
 		var b = (tri[5] - tri[2]) * (tri[6] - tri[0]) - (tri[8] - tri[2]) * (tri[3] - tri[0]);
 		var c = (tri[3] - tri[0]) * (tri[7] - tri[1]) - (tri[6] - tri[0]) * (tri[4] - tri[1]);
 	
 		var norm = new Array();
 		norm[0] = point1[0] - point2[0];
 		norm[1] = point1[1] - point2[1];
 		norm[2] = point1[2] - point2[2];
	
 		var vpt = norm[0] * a + norm[1] * b + norm[2] * c;
 		result[0] = false;
 		if(vpt == 0)
 			return result;
 		else{
 			var t = ((tri[0] - point1[0]) * a + (tri[1] - point1[1]) *  b + (tri[2] - point1[2]) * c) / vpt;
 			result[1] = new Array(); 
 			result[1][0] = point1[0] + norm[0] * t;
 			result[1][1] = point1[1] + norm[1] * t;
 			result[1][2] = point1[2] + norm[2] * t;
 			var min,max;
 			if(point1[0] < point2[0])
 			{ 	min = point1[0]; max = point2[0]; }
 			else
 			{	min = point2[0]; max = point1[0]; }
 			if(result[1][0] < min || result[1][0] > max)
 			{ 	result[0] = false; return result; }

      var triPoint = new Array();
      for(var i = 0 ; i < 3 ; ++i)
      {
        triPoint[i] = new Array();
        triPoint[i][0] = tri[i*3];
        triPoint[i][1] = tri[i*3+1];
        triPoint[i][2] = tri[i*3+2];
      }
 			result[0] = this.ApointInTri(triPoint[0],triPoint[1],triPoint[2],result[1]);
 			return result;	
		}
  },

  ApointInTri : function(A,B,C,P){
  	var v1,v2,v0;
  	v0 = new Array();
  	v1 = new Array();
  	v2 = new Array();
  	for(var i = 0 ; i < 3 ; ++i)
  	{	
  		v0[i] = C[i] - A[i];
 		v1[i] = B[i] - A[i];
  		v2[i] = P[i] - A[i];
  	}

 	  var dot00 = v0[0] * v0[0] + v0[1] * v0[1];
	  var dot01 = v0[0] * v1[0] + v0[1] * v1[1];
  	var dot02 = v0[0] * v2[0] + v0[1] * v2[1];
  	var dot11 = v1[0] * v1[0] + v1[1] * v1[1];
  	var dot12 = v1[0] * v2[0] + v1[1] * v2[1];

  	var inverDeno = 1 / (dot00 * dot11 - dot01 * dot01);
  	var u = (dot11 * dot02 - dot01 * dot12) * inverDeno;
 	if(u < 0 || u > 1)
 		return false;
 	var v = (dot00 * dot12 - dot01 * dot02) * inverDeno;
 	if(v < 0 || v > 1)
 		return false;
 	return Boolean(u + v <= 1);
  },

  AintersectBox : function(origin,dir){   
      var result = new Array();
      result[0] = new Array();
      result[1] = new Array();
      result[2] = false;

      var perX = 3 * this.voxelLength * dir[0] / Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
      var perY = 3 * this.voxelLength * dir[1] / Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
      var perZ = 3 * this.voxelLength * dir[2] / Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
      var core = new Array(), hitPoint = new Array();
      var model;

      for(var i = 0 ; i < 3 ; ++i)
        core[i] = parseInt((origin[i]-roomMin[i])/this.voxelLength) * this.voxelLength + roomMin[i] + this.voxelLength/2;
      
      var nextPoint = new Array();
      nextPoint[0] = origin[0] + perX;
      nextPoint[1] = origin[1] + perY;
      nextPoint[2] = origin[2] + perZ;
      var interCore = this.AsementInterCore(origin,nextPoint,core,-1);   
      while(1){
        if(interCore == false)
            return result;
        var sign ;
        if(interCore[1] % 2 == 0)
          sign = 1;
        else 
          sign = -1;
        core[parseInt(interCore[1]/2)]  =  core[parseInt(interCore[1]/2)] + sign * this.voxelLength;
        if(core[0] > roomMax[0] || core[0] < roomMin[0] || core[1] > roomMax[1] || core[1] < roomMin[1] || core[2] > roomMax[2] || core[2] < roomMin[2])
          return result;
        var perx = parseInt((roomMax[0] - roomMin[0])/this.voxelLength);
        var pery = parseInt((roomMax[1] - roomMin[1])/this.voxelLength);
        var voxelID = parseInt((core[2]-roomMin[2])/this.voxelLength * perx * pery) + parseInt((core[1] - roomMin[1])/this.voxelLength * perx) + parseInt((core[0] - roomMin[0])/this.voxelLength);
        nextPoint[0] = interCore[0] + perX;
        nextPoint[1] = interCore[1] + perY;
        nextPoint[2] = interCore[2] + perZ;
        if(accelerateData[voxelID].length == 0){        
            interCore = AsegmentInterCore(interCore[0], nextPoint,core,interCore[1]);
        }
        else{
          //%%% get each tri in accelerateData[voxelID]
          //%%% z buffer
          var interTri = AsegmentInterTri(tri, interCore[0],nextPoint);
          if(interTri[0])
          {
            result[2] = true;
            var a = (tri[4] - tri[1]) * (tri[8] - tri[2]) - (tri[7] - tri[1]) * (tri[5] - tri[2]);
            var b = (tri[5] - tri[2]) * (tri[6] - tri[0]) - (tri[8] - tri[2]) * (tri[3] - tri[0]);
            var c = (tri[3] - tri[0]) * (tri[7] - tri[1]) - (tri[6] - tri[0]) * (tri[4] - tri[1]);
            result[1][0] = a;
            result[1][1] = b;
            result[1][2] = c;
            result [0] = interTri[1];
            return result;
          }
        }   
      }  
  },

  AsementInterCore : function (origin,point,core,model){
      for(var i = 0 ; i < 3 ; ++i)
        if(origin[i] < core[i] - this.voxelLength/2 || origin[i] > core[i] + this.voxelLength/2)
          return false;
      var result = new Array();
      result[0] = new Array();

      var vertex = new Array();
      vertex[0] = new Array();
      vertex[1] = new Array();
      vertex[2] = new Array();
      vertex[3] = new Array();

      var tempCore = new Array();
      for(var i = 0 ; i < 6 ; ++i)
      {
       if(parseInt(model / 2) == parseInt(i / 2) && model != i)
          continue;
        tempCore[0] = core[0];
        tempCore[1] = core[1];
        tempCore[2] = core[2];

        var sign,sign1;
        if(i % 2 == 0)
          sign = 1;
        else
          sign = -1;
        tempCore[parseInt(i/2)] = tempCore[parseInt(i/2)] + sign * this.voxelLength/2;
 
        for(var m = 0 ; m < 4 ; ++m)
        {
          if(m % 2 == 0)
            sign = 1;
          else
            sign = -1;

          if(parseInt(m/2) % 2 == 0)
             sign1 = 1;
          else
            sign1 = -1;

          vertex[m][parseInt(i/2)%3] = core[parseInt(i/2)%3];
          vertex[m][parseInt(i/2+1)%3] = core[parseInt(i/2+1)%3] + sign * this.voxelLength/2;
          vertex[m][parseInt(i/2+2)%3] = core[parseInt(i/2+2)%3] + sign1 * this.voxelLength/2;
        }
          var triOfFace = new Array();
          for(var p = 0 ; p < 2 ; ++p){
            for(var m  = 0 ; m < 3 ; ++m)
            {  for(var n = 0 ; n < 3 ; ++n)
                triOfFace[m*3+n] = vertex[(m+p)%4][n]; }

            var segTriR = this.AsegmentInterTri(triOfFace,origin,point);
            if(segTriR[0])
            {
              result[0] = segTriR[1];
              result[1] = i;
              return result;
            }  
          }  
      }
      return false;
  },
};

