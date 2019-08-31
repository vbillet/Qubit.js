var g_epsilon = 0.000001;
class v3{
	constructor(){this.xx=0;this.yy=0;this.zz=0;}
}
class Qubit{
	constructor(ax,ay,az,angle){
		this.setFromAxisAng(ax,ay,az,angle);
		this.normalize();
	}
	set(px,py,pz,pw){
		this.qx=px;
		this.qy=py;
		this.qz=pz;
		this.qw=pw;
	}
	setFromAxisAng(ax,ay,az,angle) {
		var st2 = Math.sin(angle/deux);
		if (st2==0) { st2=1;}
		this.qx = ax*st2;
		this.qy = ay*st2;
		this.qz = az*st2;
		this.qw = Math.cos(angle/deux);
	}
	getAxis() {
		var result = new v3();
		var sqw = Math.sqrt(1-this.qw*this.qw);
		if (this.sqw<g_epsilon) {
			result.xx = this.qx;
			result.yy = this.qy;
			result.zz = this.qz;
		} else
		{
			result.xx = this.qx/sqw;
			result.yy = this.qy/sqw;
			result.zz = this.qz/sqw;
		}
		result.xx = parseFloat(result.xx.toFixed(7));
		result.yy = parseFloat(result.yy.toFixed(7));
		result.zz = parseFloat(result.zz.toFixed(7));
		return result;
	}
	conjugate() {
		var result = new Qubit();
		result.set( this.qx*-1, this.qy*-1, this.qz*-1, this.qw );
		return result;
	}
	radius() { return Math.sqrt(this.qw*this.qw+this.qx*this.qx+this.qy*this.qy+this.qz*this.qz); }
	psi()    { var vv=this.getAxis(); return Math.atan2(vv.yy,-vv.xx)*180/mm.PI(); }
	theta()  { var vv=this.getAxis(); return Math.acos(vv.zz)*180/mm.PI(); }
	omega()  { 	
		var rr = new Qubit(0,0,1,0);
		var zz = new Gate(0,0,1,mm.PI());
		rr = zz.doOp(rr);
		if (rr.radius()>g_epsilon)
		{
			rr.normalize();
			var result = rr.psi() / 2;
			return result;
		} else {
			return 0;
		}
	}
	setFrom(qq) { this.qw=qq.qw; this.qx=qq.qx; this.qy = qq.qy; this.qz = qq.qz;}
	dumpBloch(ch) {
		var axe=this.getAxis();
		GUI.Log(this.qw.toFixed(7)+" - "+axe.xx.toFixed(7)+" "+axe.yy.toFixed(7)+" "+axe.zz.toFixed(7)+" - theta : "+this.theta().toFixed(7)+" psi : "+this.psi().toFixed(7)+" omega : "+this.omega().toFixed(7)+" r : "+this.radius().toFixed(7));
	}
	Mul(q2) {
		var result = new Qubit();
		result.qw = q2.qw*this.qw - q2.qx*this.qx - q2.qy*this.qy - q2.qz*this.qz;
		result.qx = q2.qw*this.qx + q2.qx*this.qw - q2.qy*this.qz + q2.qz*this.qy;
		result.qy = q2.qw*this.qy + q2.qx*this.qz + q2.qy*this.qw - q2.qz*this.qx;
		result.qz = q2.qw*this.qz - q2.qx*this.qy + q2.qy*this.qx + q2.qz*this.qw;
		return result;
	}
	normalize() {
		var dd = this.radius();
		this.set(this.qx/dd, this.qy/dd, this.qz/dd, this.qw/dd);
	}
	ApplyGate(gate){
		var qr = gate.doOp(this);
		this.qx = qr.qx;
		this.qy = qr.qy;
		this.qz = qr.qz;
		this.qw = qr.qw;
		return this;
	}
	doGate(gate){
		var qr = gate.doOp(this);
		return qr;
	}
    isUp() {
    	var q1 = this.getAxis();
    	var Zero = new Qubit(0,0,1,0);
    	var q2 = Zero.getAxis();
    	var dx = q1.xx - q2.xx;
    	var dy = q1.yy - q2.yy;
    	var dz = q1.zz - q2.zz;
    	var d = Math.sqrt(dx*dx + dy * dy + dz * dz);
    	return d < g_epsilon;
    }
    isDown() { 
    	var q1 = this.getAxis();
    	var Zero = new Qubit(0,0,1,0);
    	One.ApplyGate(X);
    	var q2 = One.getAxis();
    	var dx = q1.xx - q2.xx;
    	var dy = q1.yy - q2.yy;
    	var dz = q1.zz - q2.zz;
    	var d = Math.sqrt(dx*dx + dy * dy + dz * dz);
    	return d < epsilon;
    }
    isZero() { 
    	return !isDown();
    }
    isOne() { 
    	return !isUp(); 
    }
}
class Gate {
	constructor(ax,ay,az,angle){
		this.qubit = new Qubit(ax,ay,az,angle);
	}
	doOp(qu){
		var qb = new Qubit();
		var qa = this.qubit.Mul(qu);
		qb = qa.Mul(this.qubit.conjugate());
		//qb.normalize();
		return qb;
	}

}
var GH = new Gate(unsqrt2,0,unsqrt2,mm.PI());
class encoder{
	constructor(){}
	getCharCode(car){ return car.charCodeAt();}
	setKey(cle){ this.cle = cle; }
	encodeChar(car){
		var cc = this.getCharCode(car);
		var po=1;
		var qubit = new Qubit(0,0,1,0);
		qubit = GH.doOp(qubit);
		for ( var qq = 1;qq<9;qq++){
			//console.log(po+" "+cc);
			if((po & cc)==po){
				//console.log(cc+" "+qq);
				qubit.apply(new Gate(0,0,1,mm.PI()/mm.Apow(8-qq)));
				//qubit.dump(po);
			}
			po=po*2;
		}
		po=1;
		for ( var qq = 1;qq<9;qq++){
			//console.log(po+" "+cc);
			if((po & this.cle)==po){
				//console.log(qq);
				qubit.apply(new Gate(0,1,0,mm.PI()/mm.Apow(8-qq)));
			}
			po=po*2;
		}
		qubit.apply(new Gate(1,0,0,this.cle/10));
		var r1 = parseInt((bit11*((qubit.psi()+demitour)/tour)).toFixed(0)).toString(hexa);
		if (r1.length == 1) { r1="00"+r1;}
		if (r1.length == 2) { r1="0"+r1;}
		var r2 = parseInt((bit8*((qubit.theta())/demitour)).toFixed(0)).toString(hexa);
		if (r2.length == 1) { r2="0"+r2;}
		return r1+r2;
	}
	encodeString(str){
		var cnt = str.length;
		var result = "";
		for(var ii=0;ii<cnt;ii++) {
			result = result + this.encodeChar(str.substr(ii,1));
			this.cle++;
		}
		var cs=0;
		cnt = result.length;
		//console.log(result);
		for(var ii=0;ii<cnt;ii++) {
			cs = cs+this.getCharCode(result.substr(ii,1));
		}
		//console.log(cs);
		cs = (cs & bit8).toString(hexa);
		//console.log(cs);
		if (cs.length==1) { cs="0"+cs;}
		result=result+cs;
		return result;
	}
}
var Enc = new encoder();
Enc.setKey(pm);
