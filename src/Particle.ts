class Particle {
    private id: string = "";
    charge: number = 0;
    mass: number = 1;
    position: number[] = [0,0];
    velocity: number[] = [0,0];
    acceleration: number[] = [0,0];
    color: string = "#ffffff";
    selected: boolean = false;
    trail: number[][] = [];

    constructor(charge:number,mass:number,position:number[],color?:string,velocity?:number[],acceleration?:number[]){
        this.charge = charge;
        this.mass = mass;
        this.position = position;
        this.color = getRandomColor();

        if(velocity) this.velocity = velocity;
        if(acceleration) this.acceleration = acceleration;
        if(color) this.color = color;
    }

    draw(ctx:CanvasRenderingContext2D, w:World){
        let p = this;
        this.trail.forEach(function(t){
            ctx.beginPath();
            ctx.arc(
                t[0]*w.scale + w.drawingOffset[0],
                t[1]*w.scale + w.drawingOffset[1],
                1, 0, 2 * Math.PI
            );
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.closePath();
        });
        ctx.beginPath();
        ctx.arc(
            this.position[0]*w.scale + w.drawingOffset[0], 
            this.position[1]*w.scale + w.drawingOffset[1], 
            this.mass*w.scale, 
            0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        if(this.selected){
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.closePath();
    }

    setId(id:string){this.id = id;}
    getId():string{return this.id;}
}