class UI {
    mainMenu:HTMLDivElement;
    particleMenu:HTMLDivElement;
    particleInfo:HTMLDivElement;
    controlPanel:HTMLDivElement;
    playPauseBtn:HTMLAnchorElement;
    stepForwardBtn:HTMLAnchorElement;
    resetBtn:HTMLAnchorElement;
    debug:HTMLDivElement;
    addParticleBtn:HTMLAnchorElement;

    constructor(mainBody:HTMLBodyElement){
        let u = this;
        this.mainMenu = document.createElement("div");
        this.particleMenu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");
        this.addParticleBtn = document.createElement("a");

        this.mainMenu.setAttribute("id","main_menu");
        this.mainMenu.classList.add("ui");

        this.particleMenu.setAttribute("id","particle_menu");
        this.particleMenu.classList.add("ui");

        this.addParticleBtn.setAttribute("id","add_particle");
        this.addParticleBtn.textContent = "AddParticle";
        this.addParticleBtn.setAttribute("title","Add Particle");
        this.addParticleBtn.classList.add("btn");
        this.addParticleBtn.addEventListener("click",function(e){
            let newP = new Particle(1,1,[0,0]);
            newP.mouseDown = true;
            world.addParticle(newP);
            document.addEventListener("mousemove",particleDragged);
            u.hideUI(true);
        });

        this.particleInfo.setAttribute("id","particle_info");

        this.controlPanel.setAttribute("id","ctrls");
        this.controlPanel.classList.add("ui");

        this.playPauseBtn.setAttribute("id","play_pause");
        this.playPauseBtn.textContent = this.playPauseBtn.dataset.status  = "Play";
        this.playPauseBtn.setAttribute("title", "Play");
        this.playPauseBtn.classList.add("btn");
        this.playPauseBtn.addEventListener("click",function(e){
            let status = "Pause";
            if(world.togglePlayPause()){
                status = "Play";
                u.stepForwardBtn.classList.remove("disabled");
            }else {
                u.stepForwardBtn.classList.add("disabled");
            }
            this.textContent = this.dataset.status = status;
            this.setAttribute("title", status);
            u.resetBtn.classList.remove("disabled");
        });

        this.stepForwardBtn.setAttribute("id","step");
        this.stepForwardBtn.textContent = "Step Forward";
        this.stepForwardBtn.classList.add("btn");
        this.stepForwardBtn.setAttribute("title", "Step Forward");
        this.stepForwardBtn.addEventListener("click",function(e){
            world.physicsStep();
            u.resetBtn.classList.remove("disabled");
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
            this.classList.add("disabled");
        });
        this.resetBtn.classList.add("disabled");
        
        this.debug.setAttribute("id","debug");

        mainBody.appendChild(this.mainMenu);
        this.mainMenu.appendChild(this.debug);

        mainBody.appendChild(this.particleMenu);
        this.particleMenu.appendChild(this.addParticleBtn);
        this.particleMenu.appendChild(this.particleInfo);

        mainBody.appendChild(this.controlPanel);
        this.controlPanel.appendChild(this.playPauseBtn);
        this.controlPanel.appendChild(this.stepForwardBtn);
        this.controlPanel.appendChild(this.resetBtn);
    }

    initInfo(world:World){
        let u = this;
        u.particleInfo.innerHTML = '';
        world.getParticles().forEach(function(p,index){
            if(p.selected){
                let pInfo = document.createElement("form");
                pInfo.classList.add("p_info");
                pInfo.innerHTML = "<p class='particle_titlebar'>"
                                + "<span class='color-circle' style='background-color:"+p.color+"'>"
                                + "</span><span class='particle_title'>Particle "+p.getId()+"</span>"
                                + "<a class='btn delete_particle'>Delete</a>"
                                + "</p><p>"
                                + "<label for='"+p.getId()+"_charge'>Charge</label>"
                                + "<input type='number' id='"+p.getId()+"_charge' value='"+p.charge+"'>"
                                + "<label for='"+p.getId()+"_mass'>Mass</label>"
                                + "<input type='number' id='"+p.getId()+"_mass' value='"+p.mass+"'>"
                                + "</p><p>"
                                + "<span>Position</span>"
                                + "<input type='number' id='"+p.getId()+"_xPos' value='"+p.position[0]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_xPos'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yPos' value='"+p.position[1]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_yPos'>y</label>"
                                + "</p><p>"
                                + "<span>Velocity</span>"
                                + "<input type='number' id='"+p.getId()+"_xVel' value='"+p.velocity[0]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_xVel'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yVel' value='"+p.velocity[1]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_yVel'>y</label>"
                                + "</p><p>"
                                + "<span>Acceleration</span>"
                                + "<input type='number' id='"+p.getId()+"_xAcc' value='"+p.acceleration[0]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_xAcc'>x</label>"
                                + "<input type='number' id='"+p.getId()+"_yAcc' value='"+p.acceleration[1]+"' step='.01'>"
                                + "<label for='"+p.getId()+"_yAcc'>y</label>"
                                + "</p>";

                pInfo.getElementsByClassName("delete_particle")[0].addEventListener("click",function(){
                    world.removeParticleById(p.getId());
                    world.calculatePhysics();
                    world.saveCurrentParticles();
                    u.initInfo(world);
                });

                let inputs = pInfo.getElementsByTagName("input");

                for(let i = 0; i < inputs.length; i++){
                    inputs[i].addEventListener("change",function(e){
                        let tempId = this.getAttribute("id")?.split("_");
                        if(tempId){
                            if(tempId[1] == "xPos"){
                                // eval("world.getParticleById(tempId[0]).position[0] = this.value");
                                world.getParticleById(tempId[0])!.position[0] = parseFloat(this.value);
                            } else if (tempId[1] == "yPos"){
                                world.getParticleById(tempId[0])!.position[1] = parseFloat(this.value);
                            } else if (tempId[1] == "xVel"){
                                world.getParticleById(tempId[0])!.velocity[0] = parseFloat(this.value);
                            } else if (tempId[1] == "yVel"){
                                world.getParticleById(tempId[0])!.velocity[1] = parseFloat(this.value);
                            } else if (tempId[1] == "xAcc"){
                                world.getParticleById(tempId[0])!.acceleration[0] = parseFloat(this.value);
                            } else if (tempId[1] == "yAcc"){
                                world.getParticleById(tempId[0])!.acceleration[1] = parseFloat(this.value);
                            }
                            else {
                                eval("world.getParticleById(tempId[0])."+tempId[1]+" = "+this.value);
                            }
                            world.calculatePhysics();
                            world.saveCurrentParticles();
                        }
                    });
                }

                u.particleInfo.appendChild(pInfo);
            }
        });
    }

    updateDebug(world:World,fps:number){
        let d = this.debug;
        d.innerHTML = "fps:"+fps+"<br>";
        d.innerHTML += "cursorPosition: ["+world.cursorPosition[0]+","+world.cursorPosition[1]+"]<br>";
        d.innerHTML += "shiftPress: "+world.shiftPress+"<br>";
        d.innerHTML += "dragging: "+world.dragging+"<br>";
    }

    hideUI(hide:boolean){
        let uiElements = document.getElementsByClassName("ui");
        for(let i = 0; i < uiElements.length; i++){
            (hide) ? uiElements[i].classList.add("hidden") : uiElements[i].classList.remove("hidden");
        }
    }
}