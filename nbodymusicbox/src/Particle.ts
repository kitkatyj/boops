class Particle {
    private id: string = "";
    mass: number = 1;
    position: number[] = [0,0];
    velocity: number[] = [0,0];
    acceleration: number[] = [0,0];
    color: string = "#ffffff";
    selected: boolean = false;
    mouseDown: boolean = false;
    trail: number[][] = [];
    dragOffset: number[] = [0,0];

    positionInputs: HTMLInputElement[];
    velocityInputs: HTMLInputElement[];
    accelerationInputs: HTMLInputElement[];

    constructor(mass:number,position:number[],color?:string,velocity?:number[],acceleration?:number[]){
        this.mass = mass;
        this.position = position;
        this.color = getRandomColor();

        if(velocity) this.velocity = velocity;
        if(acceleration) this.acceleration = acceleration;
        if(color) this.color = color;
    }

    draw(ctx:CanvasRenderingContext2D, w:World){
        let drawFromX = (this.position[0] + w.cameraPosition[0])* w.scale + w.drawingOffset[0] ;
        let drawFromY = (this.position[1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1];
        let drawToX = drawFromX + this.acceleration[0] * w.scale * w.arrowScale * this.mass;
        let drawToY = drawFromY + this.acceleration[1] * -w.scale * w.arrowScale * this.mass;
        
        let d = pythagoras(this.acceleration[0], this.acceleration[1])*50;
        if(d >= 7.5) d = 7.5;

        if(world.showTrails) this.drawTrail(w);
        
        ctx.beginPath();
        ctx.arc(
            (this.position[0] + w.cameraPosition[0])*w.scale + w.drawingOffset[0], 
            (this.position[1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1], 
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

        if(world.showArrows) this.drawArrow(ctx,drawFromX,drawFromY,drawToX,drawToY,d,d*2);
    }

    drawTrail(w:World){
        let p = this;
        if(world.trailStyle === 0){
            this.trail.forEach(function(t,index){
                ctx.beginPath();
                ctx.arc(
                    (t[0] + w.cameraPosition[0])*w.scale + w.drawingOffset[0],
                    (t[1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1],
                    1, 0, 2 * Math.PI
                );
                ctx.fillStyle = p.color;
                ctx.globalAlpha = index / p.trail.length;
                ctx.fill();
                ctx.closePath();
                ctx.globalAlpha = 1;
            });
        } else {
            for(let i = 1; i < this.trail.length; i++){
                ctx.beginPath();
                ctx.moveTo(
                    (this.trail[i][0] + w.cameraPosition[0])*w.scale + w.drawingOffset[0],
                    (this.trail[i][1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1]
                );
                ctx.lineTo(
                    (this.trail[i-1][0] + w.cameraPosition[0])*w.scale + w.drawingOffset[0],
                    (this.trail[i-1][1] + w.cameraPosition[1])* -w.scale + w.drawingOffset[1]
                );
                ctx.strokeStyle = p.color;
                ctx.lineWidth = w.scale * p.mass;
                ctx.globalAlpha = i / p.trail.length * 0.3;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    drawArrow(ctx:CanvasRenderingContext2D, fromx:number, fromy:number, tox:number, toy:number, width:number, headLength:number){
        var angle = Math.atan2(toy-fromy,tox-fromx);
        // This makes it so the end of the arrow head is located at tox, toy, don't ask where 1.15 comes from
        tox -= Math.cos(angle) * ((width*1.15));
        toy -= Math.sin(angle) * ((width*1.15));
    
        //starting path of the arrow from the start square to the end square and drawing the stroke
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = width;
        ctx.stroke();
        
        //starting a new path from the head of the arrow to one of the sides of the point
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox-headLength*Math.cos(angle-Math.PI/7),toy-headLength*Math.sin(angle-Math.PI/7));
        
        //path from the side point of the arrow, to the other side point
        ctx.lineTo(tox-headLength*Math.cos(angle+Math.PI/7),toy-headLength*Math.sin(angle+Math.PI/7));
        
        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox-headLength*Math.cos(angle-Math.PI/7),toy-headLength*Math.sin(angle-Math.PI/7));
    
        //draws the paths created above
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }

    setId(id:string){this.id = id;}
    getId():string{return this.id;}
}