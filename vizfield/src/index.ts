let world:World, resizeTimer = null; 
let lengthInput, lengthLabel = null;

export function init(THREE){
    world = new World(THREE);
    world.updateParticles();

    let infoPanel = document.createElement("div");
    infoPanel.setAttribute("id","info-panel");
    infoPanel.classList.add("ui");

    let line1 = document.createElement("p");
    let normalizeLabel = document.createElement("label");
    normalizeLabel.setAttribute("for","normalize");
    normalizeLabel.textContent = "Normalize Strength";

    let normalizeInput = document.createElement("input");
    normalizeInput.setAttribute("id","normalize");
    normalizeInput.setAttribute("type","checkbox");
    normalizeInput.addEventListener("change",function(){
        world.arrowField.normalizeStrength = this.checked;
        world.arrowField.calculateFieldPhysics(THREE,world.particles);
    });

    line1.appendChild(normalizeLabel);
    line1.appendChild(normalizeInput);

    let line2 = document.createElement("p");

    lengthLabel = document.createElement("label");
    lengthLabel.setAttribute("for","length");
    lengthLabel.textContent = "Wire Length ";

    lengthInput = document.createElement("input");
    lengthInput.setAttribute("id","length");
    lengthInput.setAttribute("min","0");
    lengthInput.setAttribute("max","49");
    lengthInput.type = "range";
    lengthInput.value = world.wireLength.toString();
    lengthInput.addEventListener("input",moveDragged);
    lengthInput.addEventListener("mouseup",function(){
        lengthLabel.textContent = "Wire Length ";
    });

    line2.appendChild(lengthLabel);
    line2.appendChild(lengthInput);

    let line3 = document.createElement("p");
    
    let sizeXLabel = document.createElement("label");
    sizeXLabel.setAttribute("for","size-x-input");
    sizeXLabel.textContent = "Field Size X";
    let sizeXInput = document.createElement("input");
    sizeXInput.setAttribute("id","size-x-input");
    sizeXInput.setAttribute("type","number");
    sizeXInput.setAttribute("min","1");
    sizeXInput.setAttribute("max","9");
    sizeXInput.value = world.default.sizeX.toString();
    sizeXInput.addEventListener("change",function(){
        world.arrowField.sizeX = parseInt(sizeXInput.value) - 1;
        world.updateArrowField();
    });

    let sizeYLabel = document.createElement("label");
    sizeYLabel.setAttribute("for","size-y-input");
    sizeYLabel.textContent = "Y";
    let sizeYInput = document.createElement("input");
    sizeYInput.setAttribute("id","size-y-input");
    sizeYInput.setAttribute("type","number");
    sizeYInput.setAttribute("min","1");
    sizeYInput.setAttribute("max","9");
    sizeYInput.value = world.default.sizeY.toString();
    sizeYInput.addEventListener("change",function(){
        world.arrowField.sizeY = parseInt(sizeYInput.value) - 1;
        world.updateArrowField();
    });

    let sizeZLabel = document.createElement("label");
    sizeZLabel.setAttribute("for","size-z-input");
    sizeZLabel.textContent = "Z";
    let sizeZInput = document.createElement("input");
    sizeZInput.setAttribute("id","size-z-input");
    sizeZInput.setAttribute("type","number");
    sizeZInput.setAttribute("min","1");
    sizeZInput.setAttribute("max","9");
    sizeZInput.value = world.default.sizeZ.toString();
    sizeZInput.addEventListener("change",function(){
        world.arrowField.sizeZ = parseInt(sizeZInput.value) - 1;
        world.updateArrowField();
    });
    
    line3.appendChild(sizeXLabel);
    line3.appendChild(sizeXInput);
    line3.appendChild(sizeYLabel);
    line3.appendChild(sizeYInput);
    line3.appendChild(sizeZLabel);
    line3.appendChild(sizeZInput);

    infoPanel.appendChild(line1);
    infoPanel.appendChild(line2);
    infoPanel.appendChild(line3);
    document.body.appendChild(infoPanel);

    window.addEventListener("resize",function(e){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rendererSizeReset,250);
    });

    draw();
}

function moveDragged(){
    world.wireLength = lengthInput.value;
    world.updateParticles();
    lengthLabel.textContent = parseInt(lengthInput.value)+1+" ";
}

function rendererSizeReset(){
    world.renderer.setSize( window.innerWidth, window.innerHeight );
    world.camera.aspect = window.innerWidth / window.innerHeight;
    world.camera.updateProjectionMatrix();
}

function draw(){
    world.draw();
    requestAnimationFrame( draw );
}