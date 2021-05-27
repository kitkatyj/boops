let world:World, resizeTimer = null; 
let defaultLength = 10;

export function init(THREE){
    world = new World(THREE);
    world.updateParticles(THREE,defaultLength);

    var infoPanel = document.createElement("div");
    infoPanel.setAttribute("id","info-panel");
    infoPanel.classList.add("ui");

    var lengthLabel = document.createElement("label");
    lengthLabel.setAttribute("for","length");
    lengthLabel.textContent = "Length ";

    var lengthInput = document.createElement("input");
    lengthInput.setAttribute("id","length");
    lengthInput.setAttribute("min","0");
    lengthInput.type = "number";
    lengthInput.value = defaultLength.toString();
    lengthInput.addEventListener("change",function(){
        world.updateParticles(THREE,parseInt(lengthInput.value));
    });

    infoPanel.appendChild(lengthLabel);
    infoPanel.appendChild(lengthInput);
    document.body.appendChild(infoPanel);

    window.addEventListener("resize",function(e){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(rendererSizeReset,250);
    });

    draw();
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