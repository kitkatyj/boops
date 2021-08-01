class World {
    cameraPosition: number[] = [0,0];
    scale: number = 8;
    drawingOffset: number[] = [0,0];
    private particles: Particle[] = [];
    c_constant: number = 0.5;
    paused: boolean = true;
    arrowScale: number = 50;
    cursorPosition: number[] = [0,0];
    dragging: boolean = false;
    shiftPress: boolean = false;
    dragOffset: number[] = [0,0];
    showTrails: boolean = true;
    trailStyle: number = 1; // 0 - dots, 1 - line
    trailLength: number = 50;
    showArrows: boolean = false;
    pPairs: ParticlePair[] = [];
    perapsisThreshold: number = 30;
    audioCtx: AudioContext;

    notes:string[] = ['C4','C#4/Db4','D4','D#4/Eb4','E4','F4','F#4/Gb4','G4','G#4/Ab4','A4','A#4/Bb4','B4','C5','C#5/Db5','D5','D#5/Eb5','E5','F5','F#5/Gb5','G5','G#5/Ab5','A5','A#5/Bb5','B5','C6','C#6/Db6','D6','D#6/Eb6','E6','F6','F#6/Gb6','G6','G#6/Ab6','A6','A#6/Bb6','B6'];
    freqs:number[] = [261.63,277.18,293.66,311.13,329.63,349.23,369.99,392.00,415.30,440.00,466.16,493.88,523.25,554.37,587.33,622.25,659.25,698.46,739.99,783.99,830.61,880.00,932.33,987.77,1046.50,1108.73,1174.66,1244.51,1318.51,1396.91,1479.98,1567.98,1661.22,1760.00,1864.66,1975.53];

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

    // ADDING
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
        let w = this;
        this.calculatePhysics();
        this.particles.forEach(function(p){
            p.trail.push(JSON.parse(JSON.stringify(p.position)));
            if(p.trail.length > w.trailLength){
                p.trail.shift();
            }

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
        this.refreshParticlePairs2();
    }

    // REMOVING
    refreshParticlePairs2(){
        let index = this.pPairs.length - 1;
        while(index >= 0){
            if(
                this.getParticleById(this.pPairs[index].particles[0].getId()) === null || this.getParticleById(this.pPairs[index].particles[1].getId()) === null
            ){
                this.pPairs.splice(index, 1);
            }
            index--;
        }
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
        this.showArrows = wTemp.showArrows;
        this.showTrails = wTemp.showTrails;

        this.translateParticles(wTemp.particles);
        this.translateParticlePairs(wTemp.pPairs);
    }

    togglePlayPause():boolean{
        this.paused = !this.paused;
        return this.paused;
    }

    noteToFreq(note:string):number{
        return this.freqs[Math.abs(this.notes.indexOf(note))];
    }
}