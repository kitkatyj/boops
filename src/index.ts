let mainBody,
ui:UI,
canvas: HTMLCanvasElement,
ctx:CanvasRenderingContext2D,
world:World,
resizeTimer:any = null;

let times:number[] = [];

let config = {
    fps:0,
    frameCounter:true
}

class UI {
    menu:HTMLDivElement;
    particleInfo:HTMLDivElement;
    controlPanel:HTMLDivElement;
    playPauseBtn:HTMLAnchorElement;
    stepForwardBtn:HTMLAnchorElement;
    resetBtn:HTMLAnchorElement;
    debug:HTMLDivElement;

    constructor(mainBody:HTMLBodyElement){
        this.menu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");

        this.menu.setAttribute("id","menu");
        this.menu.classList.add("ui");

        this.particleInfo.setAttribute("id","particle_info");
        this.particleInfo.classList.add("ui");

        this.controlPanel.setAttribute("id","ctrls");
        this.controlPanel.classList.add("ui");

        this.playPauseBtn.setAttribute("id","play_pause");
        this.playPauseBtn.textContent = this.playPauseBtn.dataset.status  = "Play";
        this.playPauseBtn.setAttribute("title", "Play");
        this.playPauseBtn.classList.add("btn");
        this.playPauseBtn.addEventListener("click",function(e){
            let status = (world.togglePlayPause()) ? "Play" : "Pause";
            this.textContent = this.dataset.status = status;
            this.setAttribute("title", status);
        });

        this.stepForwardBtn.setAttribute("id","step");
        this.stepForwardBtn.textContent = "Step Forward";
        this.stepForwardBtn.classList.add("btn");
        this.stepForwardBtn.setAttribute("title", "Step Forward");
        this.stepForwardBtn.addEventListener("click",function(e){
            world.physicsStep();
        });

        let ppBtn = this.playPauseBtn
        this.resetBtn.setAttribute("id","reset");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("btn");
        this.resetBtn.setAttribute("title","Reset");
        this.resetBtn.addEventListener("click",function(e){
            world.resetWorld();
            world.paused = true;
            ppBtn.textContent = ppBtn.dataset.status = "Play";
        });
        

        this.debug.setAttribute("id","debug");
        this.debug.classList.add("ui");

        mainBody.appendChild(this.menu);
        mainBody.appendChild(this.particleInfo);
        mainBody.appendChild(this.debug);

        mainBody.appendChild(this.controlPanel);
        this.controlPanel.appendChild(this.playPauseBtn);
        this.controlPanel.appendChild(this.stepForwardBtn);
        this.controlPanel.appendChild(this.resetBtn);
    }

    initInfo(world:World){
        let m = this.particleInfo;
        m.innerHTML = '';
        world.getParticles().forEach(function(p){
            if(p.selected){
                let pInfo = document.createElement("form");
                pInfo.classList.add("p_info");
                pInfo.innerHTML = "<p>"
                                + "<span class='color-circle' style='background-color:"+p.color+"'></span><span>Particle "+p.getId()+"</span>"
                                + "</p><p>"
                                + "<label for='"+p.getId()+"_charge'>Charge</label>"
                                + "<input type='number' id='"+p.getId()+"_charge' value='"+p.charge+"'>"
                                + "<label for='"+p.getId()+"_mass'>Mass</label>"
                                + "<input type='number' id='"+p.getId()+"_mass' value='"+p.mass+"'>"
                                + "</p><p>"
                                + "<span>Position</span>"
                                + "<input type='number' id='"+p.getId()+"_xPos' value='"+p.position[0]+"'>"
                                + "<label for='"+p.getId()+"_xPos'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yPos' value='"+p.position[1]+"'>"
                                + "<label for='"+p.getId()+"_yPos'>y</label>"
                                + "</p><p>"
                                + "<span>Velocity</span>"
                                + "<input type='number' id='"+p.getId()+"_xVel' value='"+p.velocity[0]+"'>"
                                + "<label for='"+p.getId()+"_xVel'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yVel' value='"+p.velocity[1]+"'>"
                                + "<label for='"+p.getId()+"_yVel'>y</label>"
                                + "</p><p>"
                                + "<span>Acceleration</span>"
                                + "<input type='number' id='"+p.getId()+"_xAcc' value='"+p.acceleration[0]+"'>"
                                + "<label for='"+p.getId()+"_xAcc'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yAcc' value='"+p.acceleration[1]+"'>"
                                + "<label for='"+p.getId()+"_yAcc'>y</label>"
                                + "</p>";

                let inputs = pInfo.getElementsByTagName("input");

                for(let i = 0; i < inputs.length; i++){
                    inputs[i].addEventListener("change",function(e){
                        let tempId = this.getAttribute("id")?.split("_");
                        if(tempId){
                            if(tempId[1] == "xPos"){
                                // eval("world.getParticleById(tempId[0]).position[0] = this.value");
                                world.getParticleById(tempId[0])!.position[0] = parseInt(this.value);
                            } else if (tempId[1] == "yPos"){
                                world.getParticleById(tempId[0])!.position[1] = parseInt(this.value);
                            } else if (tempId[1] == "xVel"){
                                world.getParticleById(tempId[0])!.velocity[0] = parseInt(this.value);
                            } else if (tempId[1] == "yVel"){
                                world.getParticleById(tempId[0])!.velocity[1] = parseInt(this.value);
                            } else if (tempId[1] == "xAcc"){
                                world.getParticleById(tempId[0])!.acceleration[0] = parseInt(this.value);
                            } else if (tempId[1] == "yAcc"){
                                world.getParticleById(tempId[0])!.acceleration[1] = parseInt(this.value);
                            }
                            else {
                                eval("world.getParticleById(tempId[0])."+tempId[1]+" = "+this.value);
                            }
                            world.calculatePhysics();
                            world.saveCurrentParticles();
                        }
                    });
                }

                m.appendChild(pInfo);
            }
        });
    }

    // updateMenu(particles:Particle[]){
    //     let props = ["charge","mass"];
    //     props.forEach(function(p){
    //         let menus = document.querySelectorAll("input[data-inputid$='"+p+"']");
    //         menus.forEach(function(m){
    //             console.log(m);
    //         });
    //     });
    // }

    updateDebug(world:World,fps:number){
        let d = this.debug;
        d.innerHTML = "fps:"+fps+"<br>";
        d.innerHTML += "cursorPosition: ["+world.cursorPosition[0]+","+world.cursorPosition[1]+"]<br>";
        d.innerHTML += "shiftPress: "+world.shiftPress+"<br>";
    }
}

class World {
    cameraPosition: number[] = [0,0];
    scale: number = 10;
    drawingOffset: number[] = [0,0];
    private savedParticles: Particle[] = [];
    private particles: Particle[] = [];
    c_constant: number = 1;
    paused: boolean = true;
    arrowScale: number = 25;
    cursorPosition: number[] = [0,0];
    shiftPress: boolean = false;

    constructor(){
        let defaultP1:Particle = new Particle(1,2,[-5,10]);
        let defaultP2:Particle = new Particle(1,1,[10,-5]);
        let defaultP3:Particle = new Particle(-1,1,[0,-10]);

        this.addParticle(defaultP1);
        this.addParticle(defaultP2);
        this.addParticle(defaultP3);

        this.calculatePhysics();
        this.saveCurrentParticles();
    }

    draw(ctx:CanvasRenderingContext2D){
        let w = this;
        this.particles.forEach(function(p){
            let drawFromX = p.position[0]*w.scale + w.drawingOffset[0];
            let drawFromY = p.position[1]*w.scale + w.drawingOffset[1];
            let drawToX = drawFromX + p.acceleration[0] * w.scale * w.arrowScale * p.mass;
            let drawToY = drawFromY + p.acceleration[1] * w.scale * w.arrowScale * p.mass;
            
            p.draw(ctx,w);
            drawArrow(ctx,drawFromX,drawFromY,drawToX,drawToY,5,10);
        });

        // play physics!
        if(!w.paused){
            this.physicsStep();
        }
    }

    addParticle(p:Particle){
        p.setId(this.particles.length.toString());
        this.particles.push(p);
    }

    getParticles():Particle[]{return this.particles;}

    getParticleById(id:string):Particle | null{
        let pOut = null;
        this.particles.forEach(function(p){
            if(p.getId() == id){pOut = p}
        });
        return pOut;
    }

    calculatePhysics(){
        let w = this;
        this.particles.forEach(function(p){
            p.acceleration = [0,0];
            w.particles.forEach(function(q){
                if(p.getId() != q.getId()){
                    let xDistance = p.position[0]-q.position[0];
                    let yDistance = p.position[1]-q.position[1];

                    let dist = pythagoras(xDistance, yDistance);
                    let ang = Math.atan2(xDistance,yDistance);

                    let resultAcceleration = w.c_constant*coloumbsLaw(p.charge,q.charge,dist) / p.mass;

                    p.acceleration[0] += resultAcceleration * Math.sin(ang);
                    p.acceleration[1] += resultAcceleration * Math.cos(ang);
                }
            });
        });
    }

    physicsStep(){
        this.calculatePhysics();
        this.particles.forEach(function(p){
            p.velocity[0] += p.acceleration[0];
            p.velocity[1] += p.acceleration[1];

            p.position[0] += p.velocity[0];
            p.position[1] += p.velocity[1];
        });
    }

    resetWorld(){
        let w = this; this.particles = [];
        JSON.parse(JSON.stringify(this.savedParticles)).forEach(function(p:any){
            let newP = new Particle(p.charge, p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.particles.push(newP);
        });
    };

    saveCurrentParticles(){
        let w = this; this.savedParticles = [];
        JSON.parse(JSON.stringify(this.particles)).forEach(function(p:any){
            let newP = new Particle(p.charge, p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.savedParticles.push(newP);
        });
    }

    togglePlayPause():boolean{
        this.paused = !this.paused;
        return this.paused;
    }
}

class Particle {
    private id: string = "";
    charge: number = 0;
    mass: number = 1;
    position: number[] = [0,0];
    velocity: number[] = [0,0];
    acceleration: number[] = [0,0];
    color: string = "#ffffff";
    selected: boolean = false;

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
    }

    setId(id:string){this.id = id;}
    getId():string{return this.id;}
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
    canvas.addEventListener("mousemove",function(e){
        world.cursorPosition = [e.clientX,e.clientY];
    });
    canvas.addEventListener("click",function(e){
        world.getParticles().forEach(function(p){
            let drawFromX = p.position[0]*world.scale + world.drawingOffset[0];
            let drawFromY = p.position[1]*world.scale + world.drawingOffset[1];
            p.selected = (
                // select within region if it's not already selected, if it is, deselect it.
                (pythagoras(drawFromX - world.cursorPosition[0], drawFromY - world.cursorPosition[1]) < p.mass*world.scale && !p.selected) ||
                // enable multi-select
                (p.selected && world.shiftPress)
            );
        });
        ui.initInfo(world);
    });

    ui.initInfo(world);
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

window.onload = init;