class World {
    scene:any; camera:any; renderer:any; controls:any; pointLight:any; ambientLight:any;
    geometry:any;
    material:any;
    mesh:any;
    particles:Particle[] = [];
    wireLength:number = 10;
    axis:string = 'x';
    tick:number = 0;
    field:number = 1; // 0 - electric, 1 - magnetic
    current:number = 0.1;

    THREE:any;

    arrowField:ArrowField;

    default = {
        sizeX:8, sizeY:4, sizeZ:4 
    }

    constructor(THREE){
        this.THREE = THREE;
        this.scene = new this.THREE.Scene();
        this.camera = new this.THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new this.THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.camera.position.x = -20;
        this.camera.position.y = 10;
        this.camera.position.z = 40;

        this.controls = new this.THREE.OrbitControls(this.camera,this.renderer.domElement);
        this.controls.autoRotate = true;
        this.pointLight = new this.THREE.PointLight(0xffffff,1);
        this.ambientLight = new this.THREE.AmbientLight(0xffffff,0.5);

        this.pointLight.position.x = 20;
        this.pointLight.position.y = 20;
        this.pointLight.position.z = 20;

        this.scene.add(this.pointLight,this.ambientLight);

        this.arrowField = new ArrowField(this.THREE,this.default.sizeX-1,this.default.sizeY-1,this.default.sizeZ-1,3,3,3);

        // console.log(this);
    }

    draw(){
        let w = this;
        this.refreshArrowField();
        this.controls.update();
        if(this.field == 1){
            this.particles.forEach(function(p){
                if(w.axis == 'x'){
                    p.mesh.position.x += w.current;
                    if(p.mesh.position.x > w.wireLength) p.mesh.position.x = -w.wireLength-2;
                } else if(w.axis == 'y'){
                    p.mesh.position.y += w.current;
                    if(p.mesh.position.y > w.wireLength) p.mesh.position.y = -w.wireLength-2;
                } else if(w.axis == 'z'){
                    p.mesh.position.z += w.current;
                    if(p.mesh.position.z > w.wireLength) p.mesh.position.z = -w.wireLength-2;
                }
            });
        }
	    this.renderer.render( this.scene, this.camera );
    }

    clearWorld(){
        this.particles = [];
        let cId = this.scene.children.length - 1;

        while(cId > 0){
            if(this.scene.children[cId].type == "Mesh"){
                this.scene.remove(this.scene.children[cId]);
            }
            cId--;
        }
    }

    clearArrowField(){
        this.arrowField.arrows = [];
        let cId = this.scene.children.length - 1;
        
        while(cId > 0){
            if(this.scene.children[cId].type == "ArrowHelper"){
                this.scene.remove(this.scene.children[cId]);
            }
            cId--;
        }
    }

    addParticle(p:Particle){
        this.particles.push(p);
    }

    updateParticles(){
        let w = this;
        this.clearWorld();
        for(let i = -w.wireLength; i <= w.wireLength; i+=2){
            let newP = new Particle(this.THREE,1, this.axis == 'x' ? i : 0 , this.axis == 'y' ? i : 0 , this.axis == 'z' ? i : 0,'#ff0000');
            this.addParticle(newP);
        };

        let cylinderGeometry = new this.THREE.CylinderGeometry(1,1,(w.wireLength)*2+2,16);
        if(this.axis == 'x') cylinderGeometry.rotateZ(Math.PI * 0.5);
        else if(this.axis == 'z') cylinderGeometry.rotateX(Math.PI * 0.5);
        let material = new this.THREE.MeshStandardMaterial({color:0xffffff,opacity:0.5,transparent:true});
        let cylinder = new this.THREE.Mesh(cylinderGeometry,material);

        w.scene.add(cylinder);

        this.particles.forEach(function(p){
            w.scene.add(p.mesh);
        });

        this.arrowField.calculateFieldPhysics(this);
        this.arrowField.arrows.forEach(function(a){
            w.scene.add(a.arrowHelper);
        });
    }

    updateArrowField(){
        let w = this;
        w.clearArrowField();
        w.arrowField.regenerateArrows(this.THREE);
        this.arrowField.calculateFieldPhysics(this);
        this.arrowField.arrows.forEach(function(a){
            w.scene.add(a.arrowHelper);
        });
    }

    refreshArrowField(){
        this.arrowField.calculateFieldPhysics(this);
    }
}