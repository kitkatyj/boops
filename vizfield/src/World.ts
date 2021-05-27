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

        let newP1 = new Particle(THREE,1,0,2,0,'#ff0000');
        // let newP2 = new Particle(THREE,1,0,0,0,'#ff0000');
        let newP3 = new Particle(THREE,-1,0,-2,0,'#0000ff');
        this.addParticle(newP1);
        // this.addParticle(newP2);
        this.addParticle(newP3);

        let w = this;
        this.particles.forEach(function(p){
            w.scene.add(p.mesh);
        });

        this.camera.position.x = 15;
        this.camera.position.y = 15;
        this.camera.position.z = 15;

        this.controls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
        this.pointLight = new THREE.PointLight(0xffffff,1);
        this.ambientLight = new THREE.AmbientLight(0xffffff,0.5);

        this.pointLight.position.x = 20;
        this.pointLight.position.y = 10;
        this.pointLight.position.z = 20;

        this.scene.add(this.pointLight,this.ambientLight);

        this.arrowField = new ArrowField(THREE,8,8,8,2);
        this.arrowField.calculateFieldPhysics(THREE,this.particles);
        this.arrowField.arrows.forEach(function(a){
            w.scene.add(a.arrowHelper);
        })

        console.log(this.arrowField);
    }

    draw(){
        this.controls.update();
	    this.renderer.render( this.scene, this.camera );
    }

    clearWorld(){
        this.particles = [];
    }

    addParticle(p:Particle){
        this.particles.push(p);
    }

    

    

    
}