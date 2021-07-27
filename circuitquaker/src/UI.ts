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
        debugVisible:true
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

        // DEBUG (top right)
        this.debug.setAttribute("id","debug");
        this.debug.classList.add("ui");
        if(!this.UIconfig.debugVisible) this.debug.classList.add("hidden");
        mainBody.appendChild(this.debug);

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
            toggleHeader('close');
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

    

    updateDebug(world:World,fps:number){
        let d = this.debug;
        d.innerHTML = "fps:"+fps+"<br>";
        d.innerHTML += "cursorPosition: ["+world.cursorPosition[0]+","+world.cursorPosition[1]+"]<br>";
        d.innerHTML += "drawingOffset: ["+world.drawingOffset[0]+","+world.drawingOffset[1]+"]<br>";
        d.innerHTML += "dragOffset: ["+world.dragOffset[0]+","+world.dragOffset[1]+"]<br>";
        d.innerHTML += "cameraPosition: ["+world.cameraPosition[0]+","+world.cameraPosition[1]+"]<br>";
        d.innerHTML += "shiftPress: "+world.shiftPress+"<br>";
        d.innerHTML += "dragging: "+world.dragging+"<br>";
        d.innerHTML += "scale: "+world.scale+"<br>";
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