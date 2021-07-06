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

    UIconfig = {
        debugVisible:false
    }

    constructor(mainBody:HTMLBodyElement){
        let uTemp = localStorage.getItem("UIconfig");
        if(uTemp){
            this.UIconfig = JSON.parse(localStorage.getItem("UIconfig"));
        }

        let u = this;
        // this.mainMenu = document.createElement("div");
        this.particleMenu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");
        this.addParticleBtn = document.createElement("a");

        // MAIN MENU (top left)
        // let mmenu_icon = document.createElement("a");
        // mmenu_icon.textContent = "Menu";

        // let mmenu_list = document.createElement("ul");
        // let mmenu_reset = document.createElement("a");

        // this.mainMenu.setAttribute("id","main_menu");
        // this.mainMenu.classList.add("ui");
        // mainBody.appendChild(this.mainMenu);

        // DEBUG (top right)
        this.debug.setAttribute("id","debug");
        this.debug.classList.add("ui");
        if(!this.UIconfig.debugVisible) this.debug.classList.add("hidden");
        mainBody.appendChild(this.debug);

        // PARTICLE MENU (bottom right)
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

        this.particleMenu.appendChild(this.addParticleBtn);
        this.particleMenu.appendChild(this.particleInfo);
        mainBody.appendChild(this.particleMenu);

        // CONTROLS (bottom right)
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
            u.updateParticleInfo();
            u.resetBtn.classList.remove("disabled");
        });

        let ppBtn = this.playPauseBtn
        this.resetBtn.setAttribute("id","reset");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("btn");
        this.resetBtn.setAttribute("title","Reset");
        this.resetBtn.addEventListener("click",function(e){
            world.load();
            world.paused = true;
            ppBtn.textContent = ppBtn.dataset.status = "Play";
            this.classList.add("disabled");
            u.stepForwardBtn.classList.remove("disabled");
            u.updateParticleInfo();
            u.initInfo();
        });
        this.resetBtn.classList.add("disabled");
        
        this.controlPanel.appendChild(this.playPauseBtn);
        this.controlPanel.appendChild(this.stepForwardBtn);
        this.controlPanel.appendChild(this.resetBtn);
        mainBody.appendChild(this.controlPanel);
    }

    toggleDebug(){
        this.UIconfig.debugVisible = !this.UIconfig.debugVisible;
        this.debug.classList.toggle("hidden");
        localStorage.setItem("UIconfig",JSON.stringify(this.UIconfig));
    }

    initInfo(){
        let u = this;
        u.particleInfo.innerHTML = '';
        world.getParticles().forEach(function(p,index){
            if(p.selected){

                // P_INFO FORM
                let pInfo = document.createElement("form");
                pInfo.classList.add("p_info");

                // TITLE BAR
                let titleBar = document.createElement("p");
                titleBar.classList.add("particle_titlebar");

                let colorCircle = document.createElement("span");
                colorCircle.style.backgroundColor = p.color;

                let particleTitle = document.createElement("span");
                particleTitle.classList.add("particle_title");
                particleTitle.textContent = "Particle "+p.getId();

                let deleteBtn = document.createElement("a");
                deleteBtn.classList.add("btn");
                deleteBtn.classList.add("delete_particle");
                deleteBtn.textContent = "Delete";
                deleteBtn.addEventListener("click",function(){
                    world.removeParticleById(p.getId());
                    world.calculatePhysics();
                    world.save();
                    u.initInfo();
                });

                titleBar.appendChild(colorCircle);
                titleBar.appendChild(particleTitle);
                titleBar.appendChild(deleteBtn);

                // CHARGE AND MASS

                let line1 = document.createElement("p");

                let chargeLabel = document.createElement("label");
                chargeLabel.setAttribute("for",p.getId()+"_charge");
                chargeLabel.textContent = "Charge";

                let chargeInput = document.createElement("input");
                chargeLabel.setAttribute("id",p.getId()+"_charge");
                chargeInput.type = "number";
                chargeInput.value = p.charge.toString();
                chargeInput.addEventListener("change",function(){
                    p.charge = parseFloat(this.value);
                });

                let massLabel = document.createElement("label");
                massLabel.setAttribute("for",p.getId()+"_mass");
                massLabel.textContent = "Mass";

                let massInput = document.createElement("input");
                massLabel.setAttribute("id",p.getId()+"_mass");
                massInput.type = "number";
                massInput.value = p.mass.toString();
                massInput.addEventListener("change",function(){
                    p.mass = parseFloat(this.value);
                });

                line1.appendChild(chargeLabel);
                line1.appendChild(chargeInput);
                line1.appendChild(massLabel);
                line1.appendChild(massInput);

                // POSITION

                let line2 = document.createElement("p");
                
                let positionLabel = document.createElement("span");
                positionLabel.textContent = "Position";

                let posXInput:HTMLInputElement = document.createElement("input");
                posXInput.setAttribute("id",p.getId()+"_xPos");
                posXInput.type = "number";
                posXInput.value = p.position[0].toString();
                posXInput.addEventListener("change",function(){
                    p.position[0] = parseFloat(this.value);
                });

                let posXLabel = document.createElement("label");
                posXLabel.setAttribute("for",p.getId()+"_xPos");
                posXLabel.textContent = "x";

                let posYInput:HTMLInputElement = document.createElement("input");
                posYInput.setAttribute("id",p.getId()+"_yPos");
                posYInput.type = "number";
                posYInput.value = p.position[1].toString();
                posYInput.addEventListener("change",function(){
                    p.position[1] = parseFloat(this.value);
                });

                let posYLabel = document.createElement("label");
                posYLabel.setAttribute("for",p.getId()+"_yPos");
                posYLabel.textContent = "y";

                p.positionInputs = [posXInput,posYInput];

                line2.appendChild(positionLabel);
                line2.appendChild(posXInput);
                line2.appendChild(posXLabel);
                line2.appendChild(posYInput);
                line2.appendChild(posYLabel);

                // VELOCITY

                let line3 = document.createElement("p");
                
                let velocityLabel = document.createElement("span");
                velocityLabel.textContent = "Velocity";

                let velXInput:HTMLInputElement = document.createElement("input");
                velXInput.setAttribute("id",p.getId()+"_xVel");
                velXInput.type = "number";
                velXInput.value = p.velocity[0].toString();
                velXInput.addEventListener("change",function(){
                    p.velocity[0] = parseFloat(this.value);
                });

                let velXLabel = document.createElement("label");
                velXLabel.setAttribute("for",p.getId()+"_xVel");
                velXLabel.textContent = "x";

                let velYInput:HTMLInputElement = document.createElement("input");
                velYInput.setAttribute("id",p.getId()+"_yVel");
                velYInput.type = "number";
                velYInput.value = p.velocity[1].toString();
                velYInput.addEventListener("change",function(){
                    p.velocity[1] = parseFloat(this.value);
                });

                let velYLabel = document.createElement("label");
                velYLabel.setAttribute("for",p.getId()+"_yVel");
                velYLabel.textContent = "y";

                p.velocityInputs = [velXInput,velYInput];

                line3.appendChild(velocityLabel);
                line3.appendChild(velXInput);
                line3.appendChild(velXLabel);
                line3.appendChild(velYInput);
                line3.appendChild(velYLabel);

                // ACCELERATION

                let line4 = document.createElement("p");
                
                let accelerationLabel = document.createElement("span");
                accelerationLabel.textContent = "Acceleration";

                let accXInput:HTMLInputElement = document.createElement("input");
                accXInput.setAttribute("id",p.getId()+"_xAcc");
                accXInput.type = "number";
                accXInput.value = p.acceleration[0].toString();

                let accXLabel = document.createElement("label");
                accXLabel.setAttribute("for",p.getId()+"_xAcc");
                accXLabel.textContent = "x";

                let accYInput:HTMLInputElement = document.createElement("input");
                accYInput.setAttribute("id",p.getId()+"_yAcc");
                accYInput.type = "number";
                accYInput.value = p.acceleration[1].toString();

                let accYLabel = document.createElement("label");
                accYLabel.setAttribute("for",p.getId()+"_yAcc");
                accYLabel.textContent = "y";

                p.accelerationInputs = [accXInput,accYInput];

                line4.appendChild(accelerationLabel);
                line4.appendChild(accXInput);
                line4.appendChild(accXLabel);
                line4.appendChild(accYInput);
                line4.appendChild(accYLabel);

                // FINAL APPEND
                pInfo.appendChild(titleBar);
                pInfo.appendChild(line1);
                pInfo.appendChild(line2);
                pInfo.appendChild(line3);
                pInfo.appendChild(line4);

                let inputs = pInfo.getElementsByTagName("input");

                // changing inputs
                for(let i = 0; i < inputs.length; i++){
                    inputs[i].addEventListener("change",function(){
                        world.calculatePhysics(); world.save();
                    })
                }

                u.particleInfo.appendChild(pInfo);
            }
        });
    }

    updateParticleInfo(){
        world.getParticles().forEach(function(p){
            if(p.selected){
                p.positionInputs[0].value = p.position[0].toString();
                p.positionInputs[1].value = p.position[1].toString();
                p.velocityInputs[0].value = p.velocity[0].toString();
                p.velocityInputs[1].value = p.velocity[1].toString();
                p.accelerationInputs[0].value = p.acceleration[0].toString();
                p.accelerationInputs[1].value = p.acceleration[1].toString();
            }
        });
    }

    updateDebug(world:World,fps:number){
        let d = this.debug;
        d.innerHTML = "fps:"+fps+"<br>";
        d.innerHTML += "cursorPosition: ["+world.cursorPosition[0]+","+world.cursorPosition[1]+"]<br>";
        d.innerHTML += "drawingOffset: ["+world.drawingOffset[0]+","+world.drawingOffset[1]+"]<br>";
        d.innerHTML += "cameraPosition: ["+world.cameraPosition[0]+","+world.cameraPosition[1]+"]<br>";
        d.innerHTML += "shiftPress: "+world.shiftPress+"<br>";
        d.innerHTML += "dragging: "+world.dragging+"<br>";
    }

    hideUI(hide:boolean){
        let uiElements = document.getElementsByClassName("ui");
        for(let i = 0; i < uiElements.length; i++){
            // select all elements that is not debug
            if(uiElements[i].getAttribute("id") != "debug"){
                (hide) ? uiElements[i].classList.add("hidden") : uiElements[i].classList.remove("hidden");
            }
        }
    }
}