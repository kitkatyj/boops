interface ImageMap {
    src: string;
    img: HTMLImageElement;
}

class World {
    cameraPosition: number[] = [0,0];
    scale: number = 8;
    drawingOffset: number[] = [0,0];
    paused: boolean = true;
    cursorPosition: number[] = [0,0];
    dragging: boolean = false;
    shiftPress: boolean = false;
    dragOffset: number[] = [0,0];
    showConnectors: boolean = true;
    connectionColor:string = '#00aa22';

    images : ImageMap[] = [];
    components: Component[] = [];
    wires: Wire[] = [];

    constructor(){

        // localStorage check
        let wTemp = localStorage.getItem("world");
        if(wTemp){
            this.load();
        } else {
        }

        // this.save();
    }

    mapImage(img:HTMLImageElement,imgSrc:string):HTMLImageElement{
        let imgMatch = false;

        this.images.forEach(function(image){
            if(imgSrc === image.src){
                img = image.img;
                imgMatch = true;
            }
        });

        if(!imgMatch){
            img = new Image();
            img.src = 'media/components/'+imgSrc;;

            this.images.push({src:imgSrc,img:img});
        }

        return img;
    }

    addComponent(c:Component){
        this.components.push(c);
    }

    addWire(w:Wire){
        this.wires.push(w);
    }

    draw(){
        this.wires.forEach((w) => {
            w.draw();
        });
        this.components.forEach((c) => {
            c.draw();
        });
    }

    save(){
        let cache = [];
        localStorage.setItem("world", JSON.stringify(this,(key,value) => {
            if (typeof value === 'object' && value !== null) {
                // Duplicate reference found, discard key
                if (cache.indexOf(value) >= 0) return;
            
                // Store value in our collection
                cache.push(value);
              }
              return value;
        }));
    }

    load(){
        let wTemp = JSON.parse(localStorage.getItem("world"));
        console.log(wTemp);
        this.cameraPosition = wTemp.cameraPosition;
        this.dragging = false;
        this.drawingOffset = wTemp.drawingOffset;
        this.paused = true;
        this.scale = wTemp.scale;
        this.shiftPress = false;
    }

    togglePlayPause():boolean{
        this.paused = !this.paused;
        return this.paused;
    }

    worldPosToDraw(pos:number[]):number[]{
        return [
            (pos[0] + this.cameraPosition[0]) *  this.scale + this.drawingOffset[0],
            (pos[1] + this.cameraPosition[1]) * -this.scale + this.drawingOffset[1]
        ]
    }

    worldPosToDrawX(posX:number):number{
        return (posX + this.cameraPosition[0]) *  this.scale + this.drawingOffset[0];
    }

    worldPosToDrawY(posY:number):number{
        return (posY + this.cameraPosition[1]) * -this.scale + this.drawingOffset[1];
    }
}