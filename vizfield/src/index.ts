let world:World, resizeTimer = null; 
let defaultLength = 10;
let lengthInput, lengthLabel, three = null;

export function init(THREE){
    three = THREE;
    world = new World(THREE);
    world.updateParticles(THREE,defaultLength);

    let infoPanel = document.createElement("div");
    infoPanel.setAttribute("id","info-panel");
    infoPanel.classList.add("ui");

    let line1 = document.createElement("p");

    lengthLabel = document.createElement("label");
    lengthLabel.setAttribute("for","length");
    lengthLabel.textContent = "Wire Length ";

    lengthInput = document.createElement("input");
    lengthInput.setAttribute("id","length");
    lengthInput.setAttribute("min","0");
    lengthInput.setAttribute("max","49");
    lengthInput.type = "range";
    lengthInput.value = defaultLength.toString();
    lengthInput.addEventListener("input",moveDragged);
    lengthInput.addEventListener("mouseup",function(){
        lengthLabel.textContent = "Wire Length ";
    });

    line1.appendChild(lengthLabel);
    line1.appendChild(lengthInput);

    let line2 = document.createElement("p");
    
    let sizeXLabel = document.createElement("label");
    sizeXLabel.setAttribute("for","size-x-input");
    sizeXLabel.textContent = "Field Size X";
    let sizeXInput = document.createElement("input");
    sizeXInput.setAttribute("id","size-x-input");
    sizeXInput.setAttribute("type","number");
    sizeXInput.setAttribute("min","1");
    sizeXInput.setAttribute("max","9");
    sizeXInput.value = "4";
    sizeXInput.addEventListener("change",function(){
        world.arrowField.sizeX = parseInt(sizeXInput.value) - 1;
        world.updateArrowField(THREE);
    });

    let sizeYLabel = document.createElement("label");
    sizeYLabel.setAttribute("for","size-y-input");
    sizeYLabel.textContent = "Y";
    let sizeYInput = document.createElement("input");
    sizeYInput.setAttribute("id","size-y-input");
    sizeYInput.setAttribute("type","number");
    sizeYInput.setAttribute("min","1");
    sizeYInput.setAttribute("max","9");
    sizeYInput.value = "7";
    sizeYInput.addEventListener("change",function(){
        world.arrowField.sizeY = parseInt(sizeYInput.value) - 1;
        world.updateArrowField(THREE);
    });

    let sizeZLabel = document.createElement("label");
    sizeZLabel.setAttribute("for","size-z-input");
    sizeZLabel.textContent = "Z";
    let sizeZInput = document.createElement("input");
    sizeZInput.setAttribute("id","size-z-input");
    sizeZInput.setAttribute("type","number");
    sizeZInput.setAttribute("min","1");
    sizeZInput.setAttribute("max","9");
    sizeZInput.value = "4";
    sizeZInput.addEventListener("change",function(){
        world.arrowField.sizeZ = parseInt(sizeZInput.value) - 1;
        world.updateArrowField(THREE);
    });
    
    line2.appendChild(sizeXLabel);
    line2.appendChild(sizeXInput);
    line2.appendChild(sizeYLabel);
    line2.appendChild(sizeYInput);
    line2.appendChild(sizeZLabel);
    line2.appendChild(sizeZInput);

    infoPanel.appendChild(line1);
    infoPanel.appendChild(line2);
    document.body.appendChild(infoPanel);

    window.addEventListener("resize",function(e){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rendererSizeReset,250);
    });

    draw(THREE);
}

function moveDragged(){
    world.updateParticles(three,parseInt(lengthInput.value));
    lengthLabel.textContent = parseInt(lengthInput.value)+1+" ";
}

function rendererSizeReset(){
    world.renderer.setSize( window.innerWidth, window.innerHeight );
    world.camera.aspect = window.innerWidth / window.innerHeight;
    world.camera.updateProjectionMatrix();
}

function draw(THREE:any){
    world.draw();
    requestAnimationFrame( draw );
}