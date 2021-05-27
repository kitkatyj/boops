class Particle {
    charge:number = 0;
    color:string;
    posX:number; posY:number; posZ:number;
    geometry:any;
    material:any;
    mesh:any;

    constructor(THREE:any,charge:number,posX:number,posY:number,posZ:number,color?:string){
        this.charge = charge;
        this.posX = posX; this.posY = posY; this.posZ = posZ;
        this.color = color || '#ffffff';
        this.geometry = new THREE.SphereGeometry(1,16,16);
        this.geometry.translate(posX,posY,posZ);
        this.material = new THREE.MeshStandardMaterial( { color: this.color } );
        this.mesh = new THREE.Mesh( this.geometry, this.material );
    }
}