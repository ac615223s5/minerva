

<p id="note"></p>
<div>
	Image Size:
	<input class="smallInput" type="number" onchange="updW(event)">
	<input class="smallInput" type="number" onchange="updH(event)">
	<select onchange="updBounded(event)">
		<option value="bounded">Bounded</option>
		<option value="unbounded">Unbounded</option>
	</select>
	Line Count/Pattern: 
	<input class="smallInput" type="number" onchange="updLineNumb(event)">
	<select onchange="updStretch(event)">
		<option value="random">Random</option>
		<option value="stretch">Stretched</option>
		<option value="axis">Axis-aligned</option>
		<option value="grid">Grid</option>
	</select>
	Line Width:
	<input class="smallInput" type="number" onchange="updLineWidth(event)">
	<select onchange="updLineColor(event)">
		<option value="black">Black</option>
		<option value="white">White</option>
		<option value="color">Multicolored</option>
	</select>
	Region Style:
	<select onchange="updRegionColor(event)">
		<option value="color">Color</option>
		<option value="grey">Grey</option>
		<option value="custom">Custom</option>
		<option value="customSimilar">Similar</option>
	</select>
	<div id="customColor" style="display:none;">
		Enter a list of HTML color names or hex codes, separated by spaces:
		<textarea id="customColorList"></textarea>
	</div>
	<button onclick="gen()">Generate</button>
</div>
<svg id="picture" xmlns="http://www.w3.org/2000/svg">
</svg>

Abstract art using intersecting lines.

## Comment

The program first generates random lines and finds their intersections. Then, it divides the image into sections through a fairly complicated process involving converting the lines and intersections into a graph of nodes and edges and sorting each edge in clockwise order.

			
Because the image is generated in the SVG format, it can be slow when there are too many lines. See the rasterized version for fewer customization options but better performance.

<script src="https://cdnjs.cloudflare.com/ajax/libs/randomcolor/0.6.1/randomColor.min.js"></script>
<script>
	var svg=document.getElementById("picture");
	var W=window.innerWidth*0.6,H=window.innerHeight*0.6,bounded=true,linetype="random",lineWidth=0,lineColor="black",regionColor="color";
	var n=10;
	var lines,lis,is,id,gr,cur,init,cnt=0,maxX,minX,maxY,minY,colors;
	gen();
	function updBounded(e){
		bounded=(e.target.value==="bounded");
	}
	function updW(e){
		W=Math.max(1,Math.min(1e6,e.target.value));
	}
	function updH(e){
		H=Math.max(1,Math.min(1e6,e.target.value));
	}
	function updStretch(e){
		linetype=e.target.value;
	}
	function updLineNumb(e){
		n=Math.max(0,Math.min(1000,e.target.value));
		if(n>200) document.getElementById("note").innerHTML="Warning: it may take a lot of time and memory to generate more than 200 lines. The non-svg version will run faster for this."
		else document.getElementById("note").innerHTML="";
	}
	function updLineWidth(e){
		lineWidth=Math.max(0,Math.min(1e6,e.target.value));
	}
	function updLineColor(e){
		lineColor=e.target.value;
	}
	function updRegionColor(e){
		regionColor=e.target.value;
		if(regionColor==="custom"||regionColor==="customSimilar") document.getElementById("customColor").style['display']='block';
		else document.getElementById("customColor").style['display']='none';
	}
	function gen(){ // parallel lines ok, vertical lines ok, 3 lines intersection not ok
		var start=Date.now();
		while (svg.lastChild){
				svg.removeChild(svg.lastChild);
		}
		svg.setAttribute("width",W); svg.setAttribute("height",H);
		lines=[]; lis=[]; is=[]; id=new Map(); gr=[];
		minX=minY=1e9; maxX=maxY=-1e9;
		colors=document.getElementById("customColorList").value.split(" ");
		for(let i=0;i<n;i++){
			if(linetype==="stretch"){
				if(Math.random()<H/(H+W)) 
					lines.push([[0,Math.random()*H],[W,Math.random()*H]]);
				else
					lines.push([[Math.random()*W,0],[Math.random()*W,H]]);
			}
			else if(linetype==="axis"){
				let temp=Math.random();
				if(Math.random()<H/(H+W)) 
					lines.push([[0,temp*H],[W,temp*H]]);
				else
					lines.push([[temp*W,0],[temp*W,H]]);
			}
			else if(linetype==="grid"){
				let temp=(H+W)/(n+);
				if((i+1)*temp<H) 
					lines.push([[0,(i+1)*temp],[W,(i+1)*temp]]);
				else
					lines.push([[(n-i)*temp,0],[(n-i)*temp,H]]);
			}
			else{
				let x=Math.random()*W,y=Math.random()*H;
				lines.push([[x,y],[x+Math.random()*10-5,y+Math.random()*10-5]]);
			}
			//drawLine(lines[i]);
		}
		if(bounded){
			n+=4;
			lines.push([[0,0],[0,H]],[[W,0],[W,H]],[[0,0],[W,0]],[[0,H],[W,H]]);
		}
		for(let i=0;i<n;i++) lis[i]=[];
		for(let i=0;i<n;i++) for(let j=0;j<i;j++){
			var ix=intersect(lines[i],lines[j]);
			if(ix==null) continue;
			if(!bounded){
				minX=Math.min(minX,ix[0]);
				minY=Math.min(minY,ix[1]);
				maxX=Math.max(maxX,ix[0]);
				maxY=Math.max(maxY,ix[1]);
			}
			ix[2]=is.length; is.push(ix);
			lis[i].push(ix); lis[j].push(ix);
		}
		m=is.length;
		for(let i=0;i<m;i++) gr[i]=[];
		for(let i=0;i<n;i++) lis[i].sort(function(a,b){
				return (a[0]-b[0])*1000+(a[1]-b[1]);
			});
		for(let i=0;i<n;i++) for(let j=0;j<lis[i].length-1;j++){
			gr[lis[i][j][2]].push(lis[i][j+1][2]);
			gr[lis[i][j+1][2]].push(lis[i][j][2]);
		}
		cnt=0;
		for(let i=0;i<m;i++){
			init=i;
			for(let j=0;j<4;j++){
				cur=[];
				if(dfs(i,null)){
					var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon"),c;
					if(regionColor==="color") c=randomColor();
					else if(regionColor==="grey") c=randomColor({hue:'monochrome'});
					else if(regionColor==="custom") c=colors[cnt%colors.length];
					else if(regionColor==="customSimilar") c=randomColor({hue: colors[cnt%colors.length]});
					cnt++;
					polygon.style['fill']=c;
					if(lineWidth>0){
						if(lineColor==="black")
							polygon.style['stroke']='black';
						else if(lineColor==="white")
							polygon.style['stroke']='white';
						else if(lineColor==="color"){
							if(regionColor==="custom") polygon.style['stroke']=colors[cnt%colors.length];
							else if(regionColor==="customSimilar") polygon.style['stroke']=randomColor({hue: c});
							else polygon.style['stroke']=randomColor();
						}
						polygon.style['strokeWidth']=lineWidth;
					}
					else{
						polygon.style['strokeWidth']=0.5;
						polygon.style['stroke']=c;
					}
					svg.appendChild(polygon);
					for(value of cur){
						var point = svg.createSVGPoint();
						point.x = value[0];
							point.y = value[1];
						polygon.points.appendItem(point);
					}
				}
			}
		}
		if(bounded){
			n-=4;
			svg.setAttribute('viewBox',0+" "+0+" "+W+" "+H);
		}
		else{
			console.log(minX,minY,maxX,maxY);
			svg.setAttribute('viewBox',minX+" "+minY+" "+(maxX-minX)+" "+(maxY-minY));
		}
	}
	function dfs(v,p){
		if(v===init&&p!==null) return true;
		if(bounded&&(is[v][0]<0||is[v][1]<0||is[v][0]>W+1||is[v][1]>H+1)) return false;
		cur.push(is[v]);
		for(let i=0;i<gr[v].length;i++) if(gr[v][i]!==null){
			if(p===null||cross(is[v],is[p],is[gr[v][i]])>1e-6){
				let nxt=gr[v][i];
				gr[v][i]=null;
				return dfs(nxt,v);
			}
		}
		return false;
	}
	function cross(p0,p1,p2){
		return (p1[0]-p0[0])*(p2[1]-p0[1])-(p1[1]-p0[1])*(p2[0]-p0[0]);
	}
	function det(a,b,c,d){
		return a*d-b*c;
	}
	function intersect(l1,l2){
		let [[x1,y1],[x2,y2]]=l1,[[x3,y3],[x4,y4]]=l2;
		let a=det(x1,y1,x2,y2),b=det(x3,y3,x4,y4),c=det(x1-x2,y1-y2,x3-x4,y3-y4);
		if(c===0) return null;
		return [det(a,x1-x2,b,x3-x4)/c,det(a,y1-y2,b,y3-y4)/c];
	}
	function drawLine(line){
		var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
		newLine.setAttribute('x1',line[0][0]);
		newLine.setAttribute('y1',line[0][1]);
		newLine.setAttribute('x2',line[1][0]);
		newLine.setAttribute('y2',line[1][1]);
		newLine.style="stroke:rgb(0,0,0);stroke-width:2";
		svg.appendChild(newLine);
	}
	function drawCircle(p,r){
		if(p[0]<0||p[1]<0||p[0]>W||p[1]>H) return;
		var newLine = document.createElementNS('http://www.w3.org/2000/svg','circle');
		newLine.setAttribute('cx',p[0]);
		newLine.setAttribute('cy',p[1]);
		newLine.setAttribute('r',r);
		newLine.setAttribute('fill','black');
		svg.appendChild(newLine);
	}
</script>
