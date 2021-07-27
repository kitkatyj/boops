class Connector {
    parent:Component;
    position:number[];

    constructor(parent:Component,position:number[]){
        this.parent = parent;
        this.position = position;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(
            (this.parent.position[0] + world.cameraPosition[0] + this.position[0])  *  world.scale + world.drawingOffset[0], 
            (this.parent.position[1] + world.cameraPosition[1] - this.position[1])  * -world.scale + world.drawingOffset[1], 
            10, 
            0, 2 * Math.PI);
        ctx.fillStyle = world.connectionColor;
        ctx.fill();
        ctx.closePath();
    }

    getDrawingPosition():number[]{
        return [
            (this.parent.position[0] + world.cameraPosition[0] + this.position[0])  *  world.scale + world.drawingOffset[0],
            (this.parent.position[1] + world.cameraPosition[1] - this.position[1])  * -world.scale + world.drawingOffset[1]
        ]
    }
}