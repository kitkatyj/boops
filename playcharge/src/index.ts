let mainBody,
ui:UI,
canvas: HTMLCanvasElement,
ctx:CanvasRenderingContext2D,
world:World,
dragTimeout:any,
resizeTimer:any,
zoomTimer:any=null;

let times:number[] = [];

let config = {
    fps:0,
    frameCounter:true
}

function init(){
    console.log("Ready!");

    canvas = document.createElement("canvas");
    ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    mainBody = document.getElementsByTagName("body")[0];
    mainBody.style.margin = "0";
    mainBody.appendChild(canvas);

    ui = new UI(mainBody);
    world = new World();

    document.addEventListener("keydown",function(e){
        if(e.shiftKey) world.shiftPress = true;
    });
    document.addEventListener("keyup",function(e){
        world.shiftPress = false;
    });
    document.addEventListener("mousemove",function(e){
        world.cursorPosition = [
            (e.clientX - world.drawingOffset[0]) / world.scale,
            (e.clientY - world.drawingOffset[1]) / -world.scale
        ];
    });
    canvas.addEventListener("mousedown",function(e){
        let particleSelected:boolean = false;
        world.getParticles().forEach(function(p){
            let drawFromX = (p.position[0] + world.cameraPosition[0])* world.scale + world.drawingOffset[0];
            let drawFromY = (p.position[1] + world.cameraPosition[1])* -world.scale + world.drawingOffset[1];
            if(
                // select within region if it's not already selected, if it is, deselect it.
                (pythagoras(drawFromX - e.clientX, drawFromY - e.clientY) < p.mass* world.scale) ||
                // enable multi-select
                (p.selected && world.shiftPress)
            ){
                p.selected = p.mouseDown = true;
                p.dragOffset[0] = world.cursorPosition[0] - p.position[0] - world.cameraPosition[0];
                p.dragOffset[1] = world.cursorPosition[1] - p.position[1] - world.cameraPosition[1];
                document.addEventListener("mousemove",particleDragged);
                particleSelected = true;
            } else {
                p.selected = false;
            }
        });
        ui.initInfo();

        if(!particleSelected){
            // Background drag!
            world.dragOffset[0] = world.cursorPosition[0] - world.cameraPosition[0];
            world.dragOffset[1] = world.cursorPosition[1] - world.cameraPosition[1];
            document.addEventListener("mousemove",backgroundDragged);
        }
    });
    document.addEventListener("mouseup",function(e){
        if(world.dragging) {
            if(world.paused) world.save();
            ui.hideUI(false);
            ui.initInfo();
        }
        world.dragging = false;
        document.removeEventListener("mousemove",particleDragged);
        document.removeEventListener("mousemove",backgroundDragged);
        canvas.style.cursor = "auto";
        world.getParticles().forEach(function(p){
            p.mouseDown = false;
        });
    })
    
    document.addEventListener("wheel",function(e){
        let scale = e.deltaY * 0.01;
        if(scale > 4) scale = 4; else if(scale < -4) scale = -4;

        if(world.scale + scale > 1) world.scale += scale;

        if(world.paused){
            clearTimeout(zoomTimer);
            zoomTimer = setTimeout(function(){
                world.save();
            },1000);
        }
    });

    ui.initInfo();
    window.requestAnimationFrame(draw);

    canvasSizeReset();

    window.addEventListener("resize",function(e){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(canvasSizeReset,250);
    });
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    // config.fps = times.length;

    world?.draw(ctx);
    ui?.updateDebug(world,times.length);
    // ui?.updateMenu(world.particles);

    window.requestAnimationFrame(draw);
}

function backgroundDragged(){
    world.dragging = true;

    world.cameraPosition[0] = parseFloat((world.cursorPosition[0] - world.dragOffset[0]).toFixed(1));
    world.cameraPosition[1] = parseFloat((world.cursorPosition[1] - world.dragOffset[1]).toFixed(1));
}

function particleDragged(){
    world.dragging = true;
    world.calculatePhysics();
    world.getParticles().forEach(function(p){
        if(p.mouseDown){
            canvas.style.cursor = "grabbing";
            p.position[0] = parseFloat((world.cursorPosition[0] - p.dragOffset[0] - world.cameraPosition[0]).toFixed(1));
            p.position[1] = parseFloat((world.cursorPosition[1] - p.dragOffset[1] - world.cameraPosition[1]).toFixed(1));
            if(p.positionInputs){
                p.positionInputs[0].value = (world.cursorPosition[0] - p.dragOffset[0] - world.cameraPosition[0]).toFixed(1);
                p.positionInputs[1].value = (world.cursorPosition[1] - p.dragOffset[1] - world.cameraPosition[1]).toFixed(1);
            }
            if(p.velocityInputs){
                p.velocityInputs[0].value = p.velocity[0].toString();
                p.velocityInputs[1].value = p.velocity[1].toString();
            }
            if(p.accelerationInputs){
                p.accelerationInputs[0].value = p.acceleration[0].toString();
                p.accelerationInputs[1].value = p.acceleration[1].toString();
            }
        }
    });
}

function getRandomColor():string{
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function canvasSizeReset(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    world.drawingOffset = [canvas.width/2,canvas.height/2];
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    world.save();
}

function paintBg(color:string){
    ctx.beginPath();
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawArrow(ctx:CanvasRenderingContext2D, fromx:number, fromy:number, tox:number, toy:number, width:number, headLength:number){
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
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

function coloumbsLaw(charge1:number,charge2:number,distance:number):number{
    return charge1*charge2/distance;
}

function pythagoras(x:number, y:number){
    return Math.sqrt(x*x + y*y);
}

function reset(){
    localStorage.clear();
    location.reload();
}

function toggleDebug(){
    ui.toggleDebug(); toggleMenu();
}

function toggleMenu(){
    document.getElementById("main_menu").classList.toggle("closed");
}

window.onload = init;