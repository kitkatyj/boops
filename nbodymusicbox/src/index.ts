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

    // show header about information
    if(localStorage.getItem("header") == "false" || localStorage.getItem("header") == null){
        document.getElementsByTagName("header")[0].classList.remove("closed");
    }

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
        toggleHeader('close');
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

        if(world.scale - scale > 1) world.scale -= scale;

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
    if(world.paused) world.save();
}

function paintBg(color:string){
    ctx.beginPath();
    ctx.rect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
}

function gravity(mass1:number,mass2:number,distance:number):number{
    return mass1*mass2/distance;
}

function pythagoras(x:number, y:number){
    return Math.sqrt(x*x + y*y);
}

function reset(){
    localStorage.clear();
    location.reload();
}

function resetCamera(){
    world.scale = 8; world.cameraPosition = [0,0];
}

function toggleDebug(){
    ui.toggleDebug();
}

function toggleMenu(setting?:string){
    if(setting == 'close')
        document.getElementById("main_menu").classList.add("closed");
    else if(setting == 'open')
        document.getElementById("main_menu").classList.remove("closed");
    else
        document.getElementById("main_menu").classList.toggle("closed");
}

function toggleHeader(setting:string){
    toggleMenu('close');
    if(setting == 'close')
        document.getElementsByTagName("header")[0].classList.add("closed");
    else if(setting == 'open')
        document.getElementsByTagName("header")[0].classList.remove("closed");
    else
        document.getElementsByTagName("header")[0].classList.toggle("closed");
    
    let headerOpen = document.getElementsByTagName("header")[0].classList.contains("closed");
    localStorage.setItem("header", String(headerOpen));
}

function toggleArrows(){
    world.showArrows = !world.showArrows;
    world.save();
}

function toggleTrails(){
    world.showTrails = !world.showTrails;
    world.save();
}

window.onload = init;