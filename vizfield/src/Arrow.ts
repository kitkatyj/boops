class Arrow {
    color:string; length:number; strength:number;
    origin:any; direction:any; arrowHelper:any;
    headLength:number = 0.5; headWidth:number = 0.3;

    constructor(THREE:any,originX:number, originY:number, originZ:number,length?:number,color?:string){
        this.color = color || '#ffffff';
        this.length = length || 1;
        this.origin = new THREE.Vector3(originX,originY,originZ);
        this.direction = new THREE.Vector3(0,0,0);
        this.arrowHelper = new THREE.ArrowHelper(this.direction, this.origin, this.length, this.color, this.headLength, this.headWidth);
    }

    addDirection(THREE:any,dirX:number, dirY:number, dirZ:number,normalize:boolean){
        let newDir = new THREE.Vector3(dirX,dirY,dirZ);
        this.direction.add(newDir);
        if(normalize) this.direction.normalize();
        this.arrowHelper.setDirection(this.direction);
    }
}