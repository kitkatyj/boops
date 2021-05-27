class ArrowField {
    arrows:Arrow[] = [];
    sizeX:number; sizeY:number; sizeZ:number;
    densityX:number;
    densityY:number;
    densityZ:number;
    kConstant:number = 1;
    maxIntensity:number = 0;
    normalizeStrength:boolean = true;
    
    constructor(THREE:any,sizeX:number,sizeY:number,sizeZ:number,densityX:number,densityY:number,densityZ:number){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.densityX = densityX;
        this.densityY = densityY;
        this.densityZ = densityZ;

        let stepX = Math.floor(this.sizeX / densityX);
        let stepY = Math.floor(this.sizeY / densityY);
        let stepZ = Math.floor(this.sizeZ / densityZ);

        // for(let y = -this.sizeY; y <= this.sizeY; y+=stepY){
        //     let newA = new Arrow(THREE,0,y,0);
        //     this.addArrow(newA);
        // }

        for(let x = -this.sizeX; x <= this.sizeX; x+=stepX){
            for(let y = -this.sizeY; y <= this.sizeY; y+=stepY){
                for(let z = -this.sizeZ; z <= this.sizeZ; z+=stepZ){
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
            particles.forEach(function(p,index){
                let xDistance = a.origin.x - p.posX;
                let yDistance = a.origin.y - p.posY;
                let zDistance = a.origin.z - p.posZ;
                let newD = f.electricField(p.charge,xDistance,yDistance,zDistance);
                let finalP = (particles.length == index + 1);
                a.addDirection(THREE,newD.x,newD.y,newD.z,finalP);
                a.strength = newD.strength;
                if(f.maxIntensity < newD.strength && newD.strength != Infinity) f.maxIntensity = newD.strength;
                // a.arrowHelper.setLength(newD.strength,0.5,0.3);
            });
        });

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