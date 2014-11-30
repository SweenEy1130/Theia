var Uti = 
{
	radians: function(degree){
		return degree * Math.PI / 180;
	},
	rotateX : function(degree)
	{
		var rad = this.radians(degree);
		return [
		[1, 0, 0],
		[0, Math.cos(rad), -Math.sin(rad)],
		[0, Math.sin(rad), Math.cos(rad)]
		];
	},
	rotateY : function(degree){
		var rad = this.radians(degree);
		return [
		[Math.cos(rad), 0, Math.sin(rad)],
		[0, 1, 0],
		[-Math.sin(rad), 0, Math.cos(rad)]
		];
	},
	crossProduct : function(u, f)
	{
		return [
		u[1] * f[2] - u[2] * f[1],
		u[2] * f[0] - u[0] * f[2],
		u[0] * f[1] - u[1] * f[0]
		];
	},
	normalize : function(u){
		return math.divide(u, math.norm(u));
	},
	flat : function(mat){
		var arr = [];
		for(var i = 0; i < mat.length; i++)
			arr = arr.concat(mat[i]);
		return arr;
	}
}