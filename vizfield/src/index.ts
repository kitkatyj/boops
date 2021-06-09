let world:World, resizeTimer = null; 
let defaultLength = 10;
let lengthInput, lengthLabel, three = null;

export function init(THREE){
    three = THREE;
    world = new World(THREE);
    world.updateParticles(THREE,defaultLength);

    var infoPanel = document.createElement("div");
    infoPanel.setAttribute("id","info-panel");
    infoPanel.classList.add("ui");

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
    })

    infoPanel.appendChild(lengthLabel);
    infoPanel.appendChild(lengthInput);
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