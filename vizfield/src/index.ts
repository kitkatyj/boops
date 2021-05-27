let world:World, resizeTimer = null;

export function init(THREE){
    world = new World(THREE);

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