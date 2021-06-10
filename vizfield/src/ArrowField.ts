class ArrowField {
    arrows:Arrow[] = [];
    sizeX:number; sizeY:number; sizeZ:number;
    stepX:number; stepY:number; stepZ:number;
    kConstant:number = 1;
    maxIntensity:number = 0;
    normalizeStrength:boolean = false;
    
    constructor(THREE:any,sizeX:number,sizeY:number,sizeZ:number,stepX:number,stepY:number,stepZ:number){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.stepX = stepX;
        this.stepY = stepY;
        this.stepZ = stepZ;

        this.regenerateArrows(THREE);
    }

    regenerateArrows(THREE:any){
        this.arrows = [];
        for(let x = -this.stepX*this.sizeX; x <= this.stepX*this.sizeX; x+=this.stepX*2){
            for(let y = -this.stepY*this.sizeY; y <= this.stepY*this.sizeY; y+=this.stepY*2){
                for(let z = -this.stepZ*this.sizeZ; z <= this.stepZ*this.sizeZ; z+=this.stepZ*2){
                    let newA = new Arrow(THREE,x,y,z);
                    this.addArrow(newA);
                }
            }
        }
    }

    addArrow(a:Arrow){
        this.arrows.push(a);
    }

    calculateFieldPhysics(THREE:any,particles:Particle[]){
        let f = this;
        this.arrows.forEach(function(a){
            a.strength = 0;
            particles.forEach(function(p,index){
                let xDistance = a.origin.x - p.posX;
                let yDistance = a.origin.y - p.posY;
                let zDistance = a.origin.z - p.posZ;
                let newD = f.electricField(p.charge,xDistance,yDistance,zDistance);
                let finalP = (particles.length == index + 1);
                a.addDirection(THREE,newD.x,newD.y,newD.z,finalP);
                a.strength += newD.strength;
                if(f.maxIntensity < newD.strength && newD.strength != Infinity) f.maxIntensity = newD.strength;
                // a.arrowHelper.setLength(newD.strength,0.5,0.3);
            });
        });

        // console.log(f.normalizeStrength);
        // once f.maxIntensity is done run the loop again adjust arrow length
        if(!this.normalizeStrength){
            this.arrows.forEach(function(a){
                let newLength = Math.log(100 * a.strength / f.maxIntensity)/2;
                a.arrowHelper.setLength(newLength,newLength*0.2,newLength*0.3);
            });
        }
    }

    electricField(charge:number, xDistance:number, yDistance:number, zDistance:number){
        let distance = this.pythagoras3d(xDistance,yDistance,zDistance);
        let theta = Math.atan2(yDistance,xDistance);
        let phi = Math.acos(zDistance / distance);

        let result = this.kConstant * charge / (distance * distance);

        return {
            strength: Math.abs(result),
            x:result * Math.sin(phi) * Math.cos(theta),
            y:result * Math.sin(phi) * Math.sin(theta),
            z:result * Math.cos(phi)
        };
    }

    pythagoras3d(x:number, y:number, z:number){
        return Math.sqrt(x*x + y*y + z*z);
    }
}