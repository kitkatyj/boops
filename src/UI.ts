class UI {
    menu:HTMLDivElement;
    particleInfo:HTMLDivElement;
    controlPanel:HTMLDivElement;
    playPauseBtn:HTMLAnchorElement;
    stepForwardBtn:HTMLAnchorElement;
    resetBtn:HTMLAnchorElement;
    debug:HTMLDivElement;
    addParticleBtn:HTMLAnchorElement;

    constructor(mainBody:HTMLBodyElement){
        this.menu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");
        this.addParticleBtn = document.createElement("a");

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

    updateDebug(world:World,fps:number){
        let d = this.debug;
        d.innerHTML = "fps:"+fps+"<br>";
        d.innerHTML += "cursorPosition: ["+world.cursorPosition[0]+","+world.cursorPosition[1]+"]<br>";
        d.innerHTML += "shiftPress: "+world.shiftPress+"<br>";
    }
}