function LBox2d(){
	var s = this;
	Box2D.Dynamics.b2World.prototype.LAddController=Box2D.Dynamics.b2World.prototype.AddController;
	Box2D.Dynamics.b2World.prototype.AddController=function(c){
		var l = {},k;
		for(k in c){
			l[k]=c[k];
		}
		if(LBox2d)LBox2d.m_controllerList = l;
		return this.LAddController(c);
	};
	var i,j,b=Box2D,d,
	a=[b.Collision,b.Common,b.Common.Math,
	b.Dynamics,b.Dynamics.Contacts,b.Dynamics.Controllers,b.Dynamics.Joints,b.Collision.Shapes];
	for(i in a)for(j in a[i])s[j]=a[i][j];
	s.drawScale = 30;
	s.selectedBody = null;
	s.mouseJoint = null;
	s.mousePVec = null;
	s.contactListener = null;
	s.world = new s.b2World(new s.b2Vec2(0, 9.8),true);
	s.removeList = new Array();
	if(LGlobal.traceDebug){
		d = new s.b2DebugDraw();
		d.SetSprite(LGlobal.canvas);
		d.SetLineThickness(1);
		d.SetFillAlpha(0.5);
		d.SetAlpha(1);
		d.SetDrawScale(s.drawScale);
		d.SetFlags(s.b2DebugDraw.e_shapeBit | s.b2DebugDraw.e_jointBit);
		s.world.SetDebugDraw(d);
	}
	LGlobal.destroy = true;
}
LBox2d.prototype = {
	setEvent:function(t_v,f_v){
		var s = this;
		if(!s.contactListener){
			s.contactListener = new s.b2ContactListener();
			s.world.SetContactListener(s.contactListener);
		}
		switch(t_v){
			case LEvent.END_CONTACT:
				s.contactListener.EndContact = f_v;
				break;
			case LEvent.PRE_SOLVE:
				s.contactListener.PreSolve = f_v;
				break;
			case LEvent.POST_SOLVE:
				s.contactListener.PostSolve = f_v;
				break;
			case LEvent.BEGIN_CONTACT:
			default:
				s.contactListener.BeginContact = f_v;
		}
	},
	setWeldJoint:function(A,B){ 
		var s = this; 
		var j = new s.b2WeldJointDef();
		j.Initialize(B, A, B.GetWorldCenter());
		return s.world.CreateJoint(j);
	},
	setLineJoint:function(A,B,vec,t,m){
		var s = this; 
		var wa = new s.b2Vec2(vec[0],vec[1]);
		var j = new s.b2LineJointDef();
		j.Initialize(A, B, B.GetWorldCenter(), wa);
		if(t == null){
			j.enableLimit = false;
		}else{
			j.lowerTranslation = t[0];
			j.upperTranslation = t[1];
			j.enableLimit = true;
		}
		if(m == null){
			j.enableMotor = false;
		}else{
			j.maxMotorForce = m[0];
			j.motorSpeed = m[1];
			j.enableMotor = true;
		}
		return s.world.CreateJoint(j);
	},
	setGearJoint:function(A,B,ra,r,p){ 
		var s = this; 
		var j = new s.b2GearJointDef();
		j.joint1 = r;
		j.joint2 = p;
		j.bodyA = A;
		j.bodyB = B;
		j.ratio = ra * s.b2Settings.b2_pi / (300 / s.drawScale);
		return s.world.CreateJoint(j);
	},
	setPrismaticJoint:function(A,B,vec,t,m){
		var s = this;
		var wa = new s.b2Vec2(vec[0],vec[1]);
		var j = new s.b2PrismaticJointDef();
		j.Initialize(B, A, B.GetWorldCenter(), wa);
		if(t == null){
			j.enableLimit = false;
		}else{
			j.lowerTranslation = t[0];
			j.upperTranslation = t[1];
			j.enableLimit = true;
		}
		if(m == null){
			j.enableMotor = false;
		}else{
			j.maxMotorForce = m[0];
			j.motorSpeed = m[1];
			j.enableMotor = true;
		}
		return s.world.CreateJoint(j);
	},
	setRevoluteJoint:function(A,B,a,m){
		var s = this;
		var j  = new s.b2RevoluteJointDef();
		j .Initialize(A, B, B.GetWorldCenter());
		if(a == null){
			j.enableLimit = false;
		}else{
			j.lowerAngle = a[0] * s.b2Settings.b2_pi/180;
			j.upperAngle = a[1] * s.b2Settings.b2_pi/180;
			j.enableLimit = true;
		}
		if(m == null){
			j.enableMotor = false;
		}else{
			j.maxMotorTorque = m[0];
			j.motorSpeed = m[1];
			j.enableMotor = true;
		}
		return s.world.CreateJoint(j ); 
	},
	setDistanceJoint:function(A,B){
		var s = this;
		var j = new s.b2DistanceJointDef();
		j.Initialize(A, B, A.GetWorldCenter(), B.GetWorldCenter());
		return s.world.CreateJoint(j); 
	},
	setPulleyJoint:function(A,B,vA,vB,ratio){
		var s = this;
		var a1 = A.GetWorldCenter();  
		var a2 = B.GetWorldCenter();
		var g1 = new s.b2Vec2(a1.x + (vA[0] / s.drawScale), a1.y + (vA[1] / s.drawScale));
		var g2 = new s.b2Vec2(a2.x + (vB[0] / s.drawScale), a2.y + (vB[1] / s.drawScale));
		var j = new s.b2PulleyJointDef();  
		j.Initialize(A, B, g1, g2, a1, a2,ratio);  
		j.maxLengthA = vA[2] / s.drawScale;
		j.maxLengthB = vB[2] / s.drawScale;
		return s.world.CreateJoint(j);
	},
	addCircle:function(r,cx,cy,t,d,f,e){
		var s = this;
		s.bodyDef = new s.b2BodyDef;
		/*动态*/
		s.bodyDef.type = t;
		s.fixDef = new s.b2FixtureDef;
		/*密度*/
		s.fixDef.density = d;
		/*摩擦*/
		s.fixDef.friction = f;
		/*弹力*/
		s.fixDef.restitution = e;
		/*加入球*/
		s.fixDef.shape = new s.b2CircleShape( r );
		/*坐标*/
		s.bodyDef.position.x = cx;
		s.bodyDef.position.y = cy;
		var shape = s.world.CreateBody(s.bodyDef);
		shape.CreateFixture(s.fixDef);
		return shape;
	},
	addPolygon:function(w,h,cx,cy,type,d,f,e){
		var s = this;
		s.bodyDef = new s.b2BodyDef;
		/*动态*/
		s.bodyDef.type = type;
		s.fixDef = new s.b2FixtureDef;
		/*密度*/
		s.fixDef.density = d;
		/*摩擦*/
		s.fixDef.friction = f;
		/*弹力*/
		s.fixDef.restitution = e;
		/*加入球*/
		s.fixDef.shape = new s.b2PolygonShape;
		s.fixDef.shape.SetAsBox(w,h);
		s.bodyDef.position.x = cx;
		s.bodyDef.position.y = cy;
		var shape = s.world.CreateBody(s.bodyDef);
		shape.CreateFixture(s.fixDef);
		return shape;
	},
	addVertices:function(vertices,type,d,f,e){
		var s = this;
		s.bodyDef = new s.b2BodyDef;
		/*动态*/
		s.bodyDef.type = type;
		var shape = s.world.CreateBody(s.bodyDef);
		for(var i = 0,l=vertices.length; i<l; i++){
			s.createShapeAsArray(shape,vertices[i],type,d,f,e);
		}
		return shape;
	},
	createShapeAsArray:function(c,vertices,type,d,f,e){
		var s = this;
		var shape = new s.b2PolygonShape();
		var sv = s.createVerticesArray(vertices);
		shape.SetAsArray(sv,0);
		var def = new s.b2FixtureDef();
		def.shape = shape;
		/*密度*/
		def.density = d;
		/*摩擦*/
		def.friction = f;
		/*弹力*/
		def.restitution = e;
		c.CreateFixture(def);
	},
	createVerticesArray:function(a){
		var s = this;
		var v = new Array();
		if(a.length < 3)return v;
		for (var i = 0,l=a.length; i<l; i++){
			v.push(new s.b2Vec2(a[i][0]/s.drawScale, a[i][1]/s.drawScale));
		}
		return v;
	},
	getBodyAtMouse:function (mouseX, mouseY) { 
 		var s = this;
		s.mousePVec = new s.b2Vec2(mouseX, mouseY);
		var aabb = new s.b2AABB();
		aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
		aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
		s.selectedBody = null;
		s.world.QueryAABB(s.getBodyCallBack, aabb);
		return s.selectedBody;
	},
	getBodyCallBack:function (fixture) {
		var s = LGlobal.box2d;
		if(fixture.GetBody().GetType() != s.b2Body.b2_staticBody) {
			if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), s.mousePVec)) {
				s.selectedBody = fixture.GetBody();
				return false;
			}
		}
		return true;
	},
	show:function(){
		var s = this,k=null;
		for(k in s.removeList){
			s.world.DestroyBody(s.removeList[k]);
		}
		s.removeList.splice(0,s.removeList.length);
		s.world.Step(1 / 30,10,10);
		s.world.ClearForces();
		if(LGlobal.traceDebug){
			s.world.DrawDebugData();
		}
	},
	synchronous:function(){
		var s = this;
		var parent = null,child,position=null,cx=0,cy=0,currentBody,joint;
		for (currentBody=s.world.GetBodyList(); currentBody; currentBody=currentBody.GetNext()) {
			child = currentBody.GetUserData();
			if(child){
				if(position==null){
					parent = child.parent;
					cx = currentBody.GetPosition().x;
					cy = currentBody.GetPosition().y;
				}
				currentBody.SetPosition(new s.b2Vec2(
					(child.x + child.rotatex + parent.x)/s.drawScale,
					(child.y + child.rotatey + parent.y)/s.drawScale ));
				if(position==null){
					position = {x:(currentBody.GetPosition().x - cx),y:(currentBody.GetPosition().y - cy)};
				}
			}
		}
		for (joint=s.world.GetJointList(); joint; joint=joint.GetNext()) {
			if(joint.m_groundAnchor1){
				joint.m_groundAnchor1.x += position.x;
				joint.m_groundAnchor1.y += position.y;
			}
			if(joint.m_groundAnchor2){
				joint.m_groundAnchor2.x += position.x;
				joint.m_groundAnchor2.y += position.y;
			}
		}
		if(LBox2d.m_controllerList && s.world.m_controllerList && parent){
			LGlobal.box2d.world.m_controllerList.offset = LBox2d.m_controllerList.offset - parent.y / LGlobal.box2d.drawScale;
		}
	}
};
LSprite.prototype.setBodyMouseJoint = function(value){
	var s = this;
	if(!s.box2dBody)return;
	s.box2dBody.mouseJoint = value;
};
LSprite.prototype.clearBody = function(value){
	var s = this;
	if(!s.box2dBody)return;
	LGlobal.box2d.removeList.push(s.box2dBody);
	s.box2dBody = null;
};
LSprite.prototype.addBodyCircle = function(radius,cx,cy,type,density,friction,restitution){
	var s = this;
	s.rotatex = radius;
	s.rotatey = radius;
	s.box2dBody = LGlobal.box2d.addCircle(
		radius/LGlobal.box2d.drawScale,
		(s.x+cx)/LGlobal.box2d.drawScale,
		(s.y+cy)/LGlobal.box2d.drawScale,
		(type==1)?LGlobal.box2d.b2Body.b2_dynamicBody:LGlobal.box2d.b2Body.b2_staticBody,
		density==null?.5:density,
		friction==null?0.4:friction,
		restitution==null?0.8:restitution);
	s.box2dBody.SetUserData(s);
};
LSprite.prototype.addBodyPolygon = function(w,h,type,density,friction,restitution){
	var s = this;
	s.rotatex = w/2;
	s.rotatey = h/2;
	s.box2dBody = LGlobal.box2d.addPolygon(
		w*0.5/LGlobal.box2d.drawScale,
		h*0.5/LGlobal.box2d.drawScale,
		s.x/LGlobal.box2d.drawScale,
		s.y/LGlobal.box2d.drawScale,
		(type==1)?LGlobal.box2d.b2Body.b2_dynamicBody:LGlobal.box2d.b2Body.b2_staticBody,
		density==null?.5:density,
		friction==null?0.4:friction,
		restitution==null?0.8:restitution);
	s.box2dBody.SetUserData(s);
};
LSprite.prototype.addBodyVertices = function(vertices,cx,cy,type,density,friction,restitution){
	var s = this;
	s.rotatex = 0;
	s.rotatey = 0;
	s.box2dBody = LGlobal.box2d.addVertices(vertices,
		(type==1)?LGlobal.box2d.b2Body.b2_dynamicBody:LGlobal.box2d.b2Body.b2_staticBody,
			density,friction,restitution);
	s.box2dBody.SetUserData(s);
	s.box2dBody.SetPosition(new LGlobal.box2d.b2Vec2((s.x+cx)/LGlobal.box2d.drawScale,(s.y+cy)/LGlobal.box2d.drawScale));
};
LGlobal.mouseJoint_start = function(eve){
	if(LGlobal.box2d.mouseJoint)return;
	var mX = eve.offsetX / LGlobal.box2d.drawScale
	,mY = eve.offsetY / LGlobal.box2d.drawScale
	,b = LGlobal.box2d.getBodyAtMouse(mX, mY);
	if(b && b.mouseJoint) {
		var m = new LGlobal.box2d.b2MouseJointDef();
		m.bodyA = LGlobal.box2d.world.GetGroundBody();
		m.bodyB = b;
		m.target.Set(mX, mY);
		m.collideConnected = true;
		m.maxForce = 300000.0 * b.GetMass();
		LGlobal.box2d.mouseJoint = LGlobal.box2d.world.CreateJoint(m);
		b.SetAwake(true);
	};
};
LGlobal.mouseJoint_move = function(eve){
	if(!LGlobal.box2d.mouseJoint)return;
	mX = eve.offsetX / LGlobal.box2d.drawScale,
	mY = eve.offsetY / LGlobal.box2d.drawScale;
	if(LGlobal.box2d.mouseJoint) {
		LGlobal.box2d.mouseJoint.SetTarget(new LGlobal.box2d.b2Vec2(mX, mY));
	}
};