class Component {
    type:string;
    img:HTMLImageElement;
    connectors:Connector[] = [];
    width:number; height:number;
    selected:boolean = false;
    dragOffset:number[] = [0,0];

    id:string;
    position:number[] = [0,0];
    rotation:number;

    hovered:boolean = false;

    constructor(type:string,imgSrc:string,width:number,height:number,position?:number[],connections?:Connector[]){
        this.type = type;
        this.width = width; this.height = height;
        if(position) this.position = position;
        if(connections) this.connectors = connections;
        if(imgSrc) this.img = world.mapImage(this.img,imgSrc);
    }

    draw(){
        ctx.drawImage(
            this.img,
            world.worldPosToDrawX(this.position[0] - this.width/2),
            world.worldPosToDrawY(this.position[1] + this.height/2),
            world.scale * this.width,
            world.scale * this.height
        );
        
        if(world.showConnectors){
            this.connectors.forEach((c) => {
                c.draw();
            })
        }
        
        this.hovered = (
            (this.position[0] - this.width/2 < (world.cursorPosition[0] - world.cameraPosition[0]) && (world.cursorPosition[0] - world.cameraPosition[0]) < this.position[0] + this.width/2) &&
            (this.position[1] - this.height/2 < (world.cursorPosition[1] - world.cameraPosition[1]) && (world.cursorPosition[1] - world.cameraPosition[1]) < this.position[1] + this.height/2)
        )

        if(this.selected){
            this.drawBorder('yellow',4);
        } else if(this.hovered) {
            this.drawBorder('rgba(0,0,0,0.5)',2);
        }
    }

    addConnector(position:number[]):Connector{
        let c = new Connector(this,position);
        this.connectors.push(c);
        return c;
    }

    drawBorder(style:string,width:number){
        ctx.lineWidth = width;
        ctx.strokeStyle = style;
        ctx.strokeRect(
            world.worldPosToDrawX(this.position[0] - this.width/2) - width,
            world.worldPosToDrawY(this.position[1] + this.height/2) - width,
            world.scale * this.width + width*2,
            world.scale * this.height + width*2
        );
    }
}

class LightBulb extends Component {
    current:number;

    constructor(position?:number[]){
        super('lightbulb','lightbulb.svg',12,12,position);
        this.current = 0;
        this.addConnector([-6,0]);
        this.addConnector([6,0]);
    }
    
    // draw(){
    //     super.draw();
    // }

    setCurrent(current:number){
        this.current = current;
        if(this.current > 0){
            this.img = world.mapImage(this.img, 'lightbulb_light.svg');
            this.width = 16; this.height = 16;
        } else {
            this.img = world.mapImage(this.img, 'lightbulb.svg');
            this.width = 12; this.height = 12;
        }
    }
}

class Cell extends Component {
    voltage:number;

    constructor(position?:number[]){
        super('cell','cell.svg',5,12,position);
        this.addConnector([-2,0]);
        this.addConnector([2,0]);
    }
}