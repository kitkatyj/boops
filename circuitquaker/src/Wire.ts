class Wire {
    connections:Connector[] = [];
    joints:number[][] = [];

    constructor(connections?:Connector[]){
        if(connections) this.connections = connections;
    }

    draw(){
        let pos1 = this.connections[0].getDrawingPosition();
        let pos2 = this.connections[1].getDrawingPosition();
        ctx.beginPath();
        ctx.moveTo(pos1[0],pos1[1]);
        this.joints.forEach((j) => {
            ctx.lineTo(world.worldPosToDrawX(j[0]), world.worldPosToDrawY(j[1]));
        });
        ctx.lineTo(pos2[0],pos2[1]);
        ctx.lineWidth = world.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    connect(c:Connector){
        this.connections.push(c);
    }

    addJoint(p:number[]){
        this.joints.push(p);
    }
}