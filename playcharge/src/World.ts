class World {
    cameraPosition: number[] = [0,0];
    scale: number = 10;
    drawingOffset: number[] = [0,0];
    private particles: Particle[] = [];
    c_constant: number = 1;
    paused: boolean = true;
    arrowScale: number = 25;
    cursorPosition: number[] = [0,0];
    dragging: boolean = false;
    shiftPress: boolean = false;
    dragOffset: number[] = [0,0];

    constructor(){
        // localStorage check
        let wTemp = localStorage.getItem("world");
        if(wTemp){
            this.load();
        } else {
            let defaultP1:Particle = new Particle(1,2,[-15.5,0.4],'#00EAD3');
            let defaultP2:Particle = new Particle(1,1,[13.8,-12.5],'#FF449F');
            let defaultP3:Particle = new Particle(-1,1,[-3.4,0.9],'#005F99');
    
            this.addParticle(defaultP1);
            this.addParticle(defaultP2);
            this.addParticle(defaultP3);
    
            this.calculatePhysics();
        }

        this.save();
    }

    draw(ctx:CanvasRenderingContext2D){
        let w = this;
        this.particles.forEach(function(p){
            let drawFromX = (p.position[0] + w.cameraPosition[0])* w.scale + w.drawingOffset[0] ;
            let drawFromY = (p.position[1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1];
            let drawToX = drawFromX + p.acceleration[0] * w.scale * w.arrowScale * p.mass;
            let drawToY = drawFromY + p.acceleration[1] * -w.scale * w.arrowScale * p.mass;
            
            p.draw(ctx,w);
            drawArrow(ctx,drawFromX,drawFromY,drawToX,drawToY,5,10);
        });

        // play physics!
        if(!w.paused){
            this.physicsStep();
            ui.updateParticleInfo();
        }
    }

    addParticle(p:Particle){
        let id:number = this.particles.length;
        while(this.getParticleById(id.toString())){
            id++;
        }
        p.setId(id.toString());
        this.particles.push(p);
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

                    let resultAcceleration = w.c_constant*coloumbsLaw(p.charge,q.charge,dist) / p.mass;

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
    }

    translateParticles(savedParticles:Array<any>){
        let w = this; this.particles = [];
        JSON.parse(JSON.stringify(savedParticles)).forEach(function(p:any){
            let newP = new Particle(p.charge, p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.particles.push(newP);
        });
    };

    save(){
        localStorage.setItem("world", JSON.stringify(this));
    }

    load(){
        let wTemp = JSON.parse(localStorage.getItem("world"));

        this.arrowScale = wTemp.arrowScale;
        this.c_constant = wTemp.c_constant;
        this.cameraPosition = wTemp.cameraPosition;
        this.dragging = false;
        this.drawingOffset = wTemp.drawingOffset;
        this.paused = true;
        this.scale = wTemp.scale;
        this.shiftPress = false;

        this.translateParticles(wTemp.particles);
    }

    togglePlayPause():boolean{
        this.paused = !this.paused;
        return this.paused;
    }
}