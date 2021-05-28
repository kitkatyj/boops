class World {
    scene:any; camera:any; renderer:any; controls:any; pointLight:any; ambientLight:any;
    geometry:any;
    material:any;
    mesh:any;
    particles:Particle[] = [];

    arrowField:ArrowField;

    constructor(THREE){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        // let newP1 = new Particle(THREE,1,0,2,0,'#ff0000');
        // let newP3 = new Particle(THREE,-1,0,-2,0,'#0000ff');
        // this.addParticle(newP1);
        // this.addParticle(newP3);

        this.camera.position.x = 20;
        this.camera.position.y = 10;
        this.camera.position.z = 40;

        this.controls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
        this.pointLight = new THREE.PointLight(0xffffff,1);
        this.ambientLight = new THREE.AmbientLight(0xffffff,0.5);

        this.pointLight.position.x = 20;
        this.pointLight.position.y = 20;
        this.pointLight.position.z = 20;

        this.scene.add(this.pointLight,this.ambientLight);

        this.arrowField = new ArrowField(THREE,8,24,8,1.5,4.5,1.5);

        console.log(this);
    }

    draw(){
        this.controls.update();
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

    addParticle(p:Particle){
        this.particles.push(p);
    }

    updateParticles(THREE:any,length:number){
        let w = this;
        this.clearWorld();
        for(let i = -length; i <= length; i+=2){
            let newP = new Particle(THREE,1,0,i,0,'#ff0000');
            this.addParticle(newP);
        };

        let cylinderGeometry = new THREE.CylinderGeometry(1,1,(length+1)*2,16);
        let material = new THREE.MeshBasicMaterial({color:0xffffff,opacity:0.5,transparent:true,wireframe:true});
        let cylinder = new THREE.Mesh(cylinderGeometry,material);

        w.scene.add(cylinder);

        this.particles.forEach(function(p){
            w.scene.add(p.mesh);
        });

        this.arrowField.calculateFieldPhysics(THREE,this.particles);
        this.arrowField.arrows.forEach(function(a){
            w.scene.add(a.arrowHelper);
        });
    }
}