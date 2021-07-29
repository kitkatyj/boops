class World {
    cameraPosition: number[] = [0,0];
    scale: number = 8;
    drawingOffset: number[] = [0,0];
    private particles: Particle[] = [];
    c_constant: number = 0.5;
    paused: boolean = true;
    arrowScale: number = 25;
    cursorPosition: number[] = [0,0];
    dragging: boolean = false;
    shiftPress: boolean = false;
    dragOffset: number[] = [0,0];
    showTrails: boolean = false;
    showArrows: boolean = false;
    pPairs: ParticlePair[] = [];
    perapsisThreshold: number = 30;
    audioCtx: AudioContext;

    constructor(){
        // localStorage check
        let wTemp = localStorage.getItem("world_nbody");
        if(wTemp){
            this.load();
        } else {
            let defaultP1:Particle = new Particle(1,[5.3638707339,0.54088605008],'#F35588');
            let defaultP2:Particle = new Particle(1,[-2.52099126491,6.94527327749],'#A3F7BF');
            let defaultP3:Particle = new Particle(1,[-2.75706601688,-3.35933589318],'#FFF591');
            defaultP1.velocity = [-0.569379585581,1.255291102531];
            defaultP2.velocity = [0.079644615252,-0.458625997341];
            defaultP3.velocity = [0.489734970329,-0.796665105189];
    
            this.addParticle(defaultP1);
            this.addParticle(defaultP2);
            this.addParticle(defaultP3);
            this.pPairs = [];

            let pp1:ParticlePair = new ParticlePair(defaultP1,defaultP2,392.00);
            let pp2:ParticlePair = new ParticlePair(defaultP2,defaultP3,523.25);
            let pp3:ParticlePair = new ParticlePair(defaultP1,defaultP3,783.99);

            this.pPairs.push(pp1,pp2,pp3);
    
            this.calculatePhysics();
        }

        this.resetAudioContext();
        this.save();
    }

    draw(ctx:CanvasRenderingContext2D){
        let w = this;
        this.particles.forEach(function(p){
            p.draw(ctx,w);
        });

        this.pPairs.forEach((pp) => {
            pp.update();
        });
        
        // play physics!
        if(!w.paused){
            this.physicsStep();
            ui.updateParticleInfo();
        }
    }

    resetAudioContext(){
        let w = this;
        this.pPairs.forEach((pp) => {
            pp.fade = 0;
            if(pp.gainNode){
                pp.gainNode.gain.value = 0;
                pp.osc.disconnect(pp.gainNode);
                pp.gainNode.disconnect(w.audioCtx.destination);
            }
        });
        this.audioCtx = new window.AudioContext();
    }

    addParticle(p:Particle){
        let id:number = this.particles.length;
        while(this.getParticleById(id.toString())){
            id++;
        }
        p.setId(id.toString());
        this.particles.push(p);
        this.refreshParticlePairs();
    }

    refreshParticlePairs(){
        let w = this;
        w.particles.forEach((p1) => {
            w.particles.forEach((p2) => {
                let duplicateExists = false;
                w.pPairs.forEach((pp) => {
                    if(
                        (pp.particles[0].getId() === p1.getId() || pp.particles[1].getId() === p1.getId()) &&
                        (pp.particles[0].getId() === p2.getId() || pp.particles[1].getId() === p2.getId())
                    ){
                        duplicateExists = true;
                    }
                });
                if(p1 != p2 && !duplicateExists){
                    w.pPairs.push(new ParticlePair(p1,p2));
                }
            });
        });
    }

    findParticlePair(p1:Particle,p2:Particle):ParticlePair{
        let pickedPP = null;
        this.pPairs.forEach((pp) => {
            if(
                (pp.particles[0].getId() === p1.getId() || pp.particles[1].getId() === p1.getId()) &&
                (pp.particles[0].getId() === p2.getId() || pp.particles[1].getId() === p2.getId())
            ){
                pickedPP = pp;
            }
        });
        return pickedPP;
    }

    getParticles():Particle[]{return this.particles;}

    getParticleById(id:string):Particle | null{
        let pOut = null;
        this.particles.forEach(function(p){
            if(p.getId() == id){pOut = p}
        });
        return pOut;
    }

    calculatePhysics(){
        let w = this;
        this.particles.forEach(function(p){
            p.acceleration = [0,0];
            w.particles.forEach(function(q){
                if(p.getId() != q.getId()){
                    let xDistance = p.position[0]-q.position[0];
                    let yDistance = p.position[1]-q.position[1];

                    let dist = pythagoras(xDistance, yDistance);
                    let ang = Math.atan2(xDistance,yDistance);

                    let resultAcceleration = -w.c_constant*gravity(p.mass,q.mass,dist) / p.mass;

                    p.acceleration[0] += resultAcceleration * Math.sin(ang);
                    p.acceleration[1] += resultAcceleration * Math.cos(ang);
                }
            });
        });
    }

    physicsStep(){
        this.calculatePhysics();
        this.particles.forEach(function(p){
            p.trail.push(JSON.parse(JSON.stringify(p.position)));

            p.velocity[0] += p.acceleration[0];
            p.velocity[1] += p.acceleration[1];

            p.position[0] += p.velocity[0];
            p.position[1] += p.velocity[1];
        });
    }

    removeParticleById(id:string){
        let index = this.particles.length - 1;
        while(index >= 0){
            if(this.particles[index].getId() == id){
                this.particles.splice(index, 1);
            }
            index--;
        }
        this.refreshParticlePairs();
    }

    translateParticles(savedParticles:Array<any>){
        let w = this; this.particles = [];
        JSON.parse(JSON.stringify(savedParticles)).forEach(function(p:any){
            let newP = new Particle(p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.particles.push(newP);
        });
    };

    translateParticlePairs(savedPP:Array<any>){
        let w = this; this.pPairs = [];
        JSON.parse(JSON.stringify(savedPP)).forEach((pp:any) => {
            let newPP = new ParticlePair(
                w.getParticleById(pp.particles[0].id),
                w.getParticleById(pp.particles[1].id),
                pp.oscFreq
            );
            w.pPairs.push(newPP);
        });
    }

    save(){
        localStorage.setItem("world_nbody", JSON.stringify(this));
    }

    load(){
        let wTemp = JSON.parse(localStorage.getItem("world_nbody"));

        this.arrowScale = wTemp.arrowScale;
        this.c_constant = wTemp.c_constant;
        this.cameraPosition = wTemp.cameraPosition;
        this.dragging = false;
        this.drawingOffset = wTemp.drawingOffset;
        this.paused = true;
        this.scale = wTemp.scale;
        this.shiftPress = false;

        this.translateParticles(wTemp.particles);
        this.translateParticlePairs(wTemp.pPairs);
    }

    togglePlayPause():boolean{
        this.paused = !this.paused;
        return this.paused;
    }
}