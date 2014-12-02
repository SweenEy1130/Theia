function parseMtl(url){
	var c;//mtl file string data
	var MaterialTextureData = [];
	//load file
	$.ajax({
		dataType: "text",
		url: url,
 	 		async: false,//synchronically load file
 	 		success: function(data){
 	 			c = data;
 	 		},
 	 		error:function(){
 	 			console.log("unable to load mtl");
 	 		}
 	 	});
	
	if(!c)
		console.log("no material info");
	//parse string
	var e = c.split("\n");
	var a = [];
	for (var W = 0; W < e.length; W++) {
		if (/^\s*newmtl\s/.test(e[W])) {
			a.push(e[W] + "\n");
		} else {
			if (a.length > 0 && !(/^#/.test(e[W]))) {
				a[a.length - 1] += e[W] + "\n";
			}
		}
	}
	var L = [];
	for (var W = 0; W < a.length; W++) {
		L.push(new ObjMaterial(a[W]));
	}
	for (var W = 0; W < L.length; W++) {
        MaterialTextureData.push(L[W].Ka[0], L[W].Ka[1], L[W].Ka[2]);
		MaterialTextureData.push(L[W].Kd[0], L[W].Kd[1], L[W].Kd[2]);
		MaterialTextureData.push(L[W].Ks[0], L[W].Ks[1], L[W].Ks[2]);
        MaterialTextureData.push(L[W].map[0], L[W].map[1], L[W].map[2]);
		MaterialTextureData.push(L[W].illum, L[W].Ns, L[W].d);

	}
	return MaterialTextureData;
}


function ObjMaterial(e) {
    var j = e.split("\n");
    this.Ka = null;
    this.Kd = null;
    this.Ks = null;
    this.illum = 0;
    this.Ns = 0;
    this.map = 0;
    this.d = 1;

    for (var d = 0; d < j.length; d++) {
        if (/^\s*newmtl\s/.test(j[d])) {
            var a = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
            this.Name = a[1];
        }
        if (/^\s*Ka\s/.test(j[d])) {
            var c = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
            this.Ka = new Float32Array([c[1], c[2], c[3]]);
        } else {
            if (/^\s*Kd\s/.test(j[d])) {
                var c = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                this.Kd = new Float32Array([c[1], c[2], c[3]]);
            } else {
                if (/^\s*Ks\s/.test(j[d])) {
                    var c = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                    this.Ks = new Float32Array([c[1], c[2], c[3]]);
                } else {
                    if (/^\s*d\s/.test(j[d])) {
                        var b = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                        this.d = parseFloat(b[1]);
                    } else {
                        if (/^\s*Ns\s/.test(j[d])) {
                            var g = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                            this.Ns = parseFloat(g[1]);
                        } else {
                            if (/^\s*illum\s/.test(j[d])) {
                                var f = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                                this.illum = parseInt(f[1]);
                            }
                            else{
                                if(/^\s*map\s/.test(j[d])){
                                 var h = j[d].replace(/^\s*/, "").replace(/\s+/g, " ").split(" ");
                                 this.map = new Float32Array([h[1], h[2], h[3]]);               
                                }                       
                            }
                        }
                    }
                }
            }
        }
    }
}