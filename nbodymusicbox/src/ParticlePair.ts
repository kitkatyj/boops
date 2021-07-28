class ParticlePair {
    particles:Particle[] = [];
    distance:number = 0;
    velocity:number = 0;

    lastD:number = 0;
    lastV:number = 0;

    distanceLabel: HTMLParagraphElement;
    velocityLabel: HTMLParagraphElement;

    periapsis:boolean = false;
    worldAudioCtx:GainNode;
    osc:OscillatorNode;
    oscFreq:number = 400;

    constructor(p1:Particle, p2:Particle,oscFreq?:number){
        this.particles = [p1,p2];
        if(oscFreq) this.oscFreq = oscFreq;
    }

    update(){
        this.periapsis = false;
        this.distance = pythagoras(
            this.particles[0].position[0] - this.particles[1].position[0],
            this.particles[0].position[1] - this.particles[1].position[1]
        );
        if(this.distanceLabel) this.distanceLabel.innerHTML = "<span>Distance: "+this.distance.toFixed(2)+"</span>";

        if(this.distance > 0){
            this.velocity = this.distance - this.lastD;
            this.lastD = this.distance;
            if(this.velocityLabel) this.velocityLabel.innerHTML = "<span>Velocity: "+this.velocity.toFixed(2)+"</span>";
        }

        // if the last velocity is negative and current velocity is positive and less than specified distance, mark it as periapsis.
        if(this.lastV <= 0 && this.velocity > 0 && this.distance < world.perapsisThreshold && !world.paused){
            this.periapsis = true;
            this.draw();
            // play sound
            this.osc.connect(this.worldAudioCtx);
            setTimeout(() => {
                if(this.osc) this.osc.disconnect(this.worldAudioCtx);
            },100);
        }
        this.lastV = this.velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(
            (this.particles[0].position[0] + world.cameraPosition[0])*  world.scale + world.drawingOffset[0],
            (this.particles[0].position[1] + world.cameraPosition[1])* -world.scale + world.drawingOffset[1]
        );
        ctx.lineTo(
            (this.particles[1].position[0] + world.cameraPosition[0])*  world.scale + world.drawingOffset[0],
            (this.particles[1].position[1] + world.cameraPosition[1])* -world.scale + world.drawingOffset[1]
        );
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}