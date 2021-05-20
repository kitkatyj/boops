"use strict";
var mainBody, ui, canvas, ctx, world, resizeTimer = null;
var times = [];
var config = {
    fps: 0,
    frameCounter: true
};
var UI = /** @class */ (function () {
    function UI(mainBody) {
        this.menu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");
        this.menu.setAttribute("id", "menu");
        this.menu.classList.add("ui");
        this.particleInfo.setAttribute("id", "particle_info");
        this.particleInfo.classList.add("ui");
        this.controlPanel.setAttribute("id", "ctrls");
        this.controlPanel.classList.add("ui");
        this.playPauseBtn.setAttribute("id", "play_pause");
        this.playPauseBtn.textContent = this.playPauseBtn.dataset.status = "Play";
        this.playPauseBtn.setAttribute("title", "Play");
        this.playPauseBtn.classList.add("btn");
        this.playPauseBtn.addEventListener("click", function (e) {
            var status = (world.togglePlayPause()) ? "Play" : "Pause";
            this.textContent = this.dataset.status = status;
            this.setAttribute("title", status);
        });
        this.stepForwardBtn.setAttribute("id", "step");
        this.stepForwardBtn.textContent = "Step Forward";
        this.stepForwardBtn.classList.add("btn");
        this.stepForwardBtn.setAttribute("title", "Step Forward");
        this.stepForwardBtn.addEventListener("click", function (e) {
            world.physicsStep();
        });
        var ppBtn = this.playPauseBtn;
        this.resetBtn.setAttribute("id", "reset");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("btn");
        this.resetBtn.setAttribute("title", "Reset");
        this.resetBtn.addEventListener("click", function (e) {
            world.resetWorld();
            world.paused = true;
            ppBtn.textContent = ppBtn.dataset.status = "Play";
        });
        this.debug.setAttribute("id", "debug");
        this.debug.classList.add("ui");
        mainBody.appendChild(this.menu);
        mainBody.appendChild(this.particleInfo);
        mainBody.appendChild(this.debug);
        mainBody.appendChild(this.controlPanel);
        this.controlPanel.appendChild(this.playPauseBtn);
        this.controlPanel.appendChild(this.stepForwardBtn);
        this.controlPanel.appendChild(this.resetBtn);
    }
    UI.prototype.initInfo = function (world) {
        var m = this.particleInfo;
        m.innerHTML = '';
        world.getParticles().forEach(function (p) {
            if (p.selected) {
                var pInfo = document.createElement("form");
                pInfo.classList.add("p_info");
                pInfo.innerHTML = "<p>"
                    + "<span class='color-circle' style='background-color:" + p.color + "'></span><span>Particle " + p.getId() + "</span>"
                    + "</p><p>"
                    + "<label for='" + p.getId() + "_charge'>Charge</label>"
                    + "<input type='number' id='" + p.getId() + "_charge' value='" + p.charge + "'>"
                    + "<label for='" + p.getId() + "_mass'>Mass</label>"
                    + "<input type='number' id='" + p.getId() + "_mass' value='" + p.mass + "'>"
                    + "</p><p>"
                    + "<span>Position</span>"
                    + "<input type='number' id='" + p.getId() + "_xPos' value='" + p.position[0] + "'>"
                    + "<label for='" + p.getId() + "_xPos'>x</label>"
                    + "<input type='number' id='" + p.getId() + "_yPos' value='" + p.position[1] + "'>"
                    + "<label for='" + p.getId() + "_yPos'>y</label>"
                    + "</p><p>"
                    + "<span>Velocity</span>"
                    + "<input type='number' id='" + p.getId() + "_xVel' value='" + p.velocity[0] + "'>"
                    + "<label for='" + p.getId() + "_xVel'>x</label>"
                    + "<input type='number' id='" + p.getId() + "_yVel' value='" + p.velocity[1] + "'>"
                    + "<label for='" + p.getId() + "_yVel'>y</label>"
                    + "</p><p>"
                    + "<span>Acceleration</span>"
                    + "<input type='number' id='" + p.getId() + "_xAcc' value='" + p.acceleration[0] + "'>"
                    + "<label for='" + p.getId() + "_xAcc'>x</label>"
                    + "<input type='number' id='" + p.getId() + "_yAcc' value='" + p.acceleration[1] + "'>"
                    + "<label for='" + p.getId() + "_yAcc'>y</label>"
                    + "</p>";
                var inputs = pInfo.getElementsByTagName("input");
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].addEventListener("change", function (e) {
                        var _a;
                        var tempId = (_a = this.getAttribute("id")) === null || _a === void 0 ? void 0 : _a.split("_");
                        if (tempId) {
                            if (tempId[1] == "xPos") {
                                // eval("world.getParticleById(tempId[0]).position[0] = this.value");
                                world.getParticleById(tempId[0]).position[0] = parseInt(this.value);
                            }
                            else if (tempId[1] == "yPos") {
                                world.getParticleById(tempId[0]).position[1] = parseInt(this.value);
                            }
                            else if (tempId[1] == "xVel") {
                                world.getParticleById(tempId[0]).velocity[0] = parseInt(this.value);
                            }
                            else if (tempId[1] == "yVel") {
                                world.getParticleById(tempId[0]).velocity[1] = parseInt(this.value);
                            }
                            else if (tempId[1] == "xAcc") {
                                world.getParticleById(tempId[0]).acceleration[0] = parseInt(this.value);
                            }
                            else if (tempId[1] == "yAcc") {
                                world.getParticleById(tempId[0]).acceleration[1] = parseInt(this.value);
                            }
                            else {
                                eval("world.getParticleById(tempId[0])." + tempId[1] + " = " + this.value);
                            }
                            world.calculatePhysics();
                            world.saveCurrentParticles();
                        }
                    });
                }
                m.appendChild(pInfo);
            }
        });
    };
    // updateMenu(particles:Particle[]){
    //     let props = ["charge","mass"];
    //     props.forEach(function(p){
    //         let menus = document.querySelectorAll("input[data-inputid$='"+p+"']");
    //         menus.forEach(function(m){
    //             console.log(m);
    //         });
    //     });
    // }
    UI.prototype.updateDebug = function (world, fps) {
        var d = this.debug;
        d.innerHTML = "fps:" + fps + "<br>";
        d.innerHTML += "cursorPosition: [" + world.cursorPosition[0] + "," + world.cursorPosition[1] + "]<br>";
        d.innerHTML += "shiftPress: " + world.shiftPress + "<br>";
    };
    return UI;
}());
var World = /** @class */ (function () {
    function World() {
        this.cameraPosition = [0, 0];
        this.scale = 10;
        this.drawingOffset = [0, 0];
        this.savedParticles = [];
        this.particles = [];
        this.c_constant = 1;
        this.paused = true;
        this.arrowScale = 25;
        this.cursorPosition = [0, 0];
        this.shiftPress = false;
        var defaultP1 = new Particle(1, 2, [-5, 10]);
        var defaultP2 = new Particle(1, 1, [10, -5]);
        var defaultP3 = new Particle(-1, 1, [0, -10]);
        this.addParticle(defaultP1);
        this.addParticle(defaultP2);
        this.addParticle(defaultP3);
        this.calculatePhysics();
        this.saveCurrentParticles();
    }
    World.prototype.draw = function (ctx) {
        var w = this;
        this.particles.forEach(function (p) {
            var drawFromX = p.position[0] * w.scale + w.drawingOffset[0];
            var drawFromY = p.position[1] * w.scale + w.drawingOffset[1];
            var drawToX = drawFromX + p.acceleration[0] * w.scale * w.arrowScale * p.mass;
            var drawToY = drawFromY + p.acceleration[1] * w.scale * w.arrowScale * p.mass;
            p.draw(ctx, w);
            drawArrow(ctx, drawFromX, drawFromY, drawToX, drawToY, 5, 10);
        });
        // play physics!
        if (!w.paused) {
            this.physicsStep();
        }
    };
    World.prototype.addParticle = function (p) {
        p.setId(this.particles.length.toString());
        this.particles.push(p);
    };
    World.prototype.getParticles = function () { return this.particles; };
    World.prototype.getParticleById = function (id) {
        var pOut = null;
        this.particles.forEach(function (p) {
            if (p.getId() == id) {
                pOut = p;
            }
        });
        return pOut;
    };
    World.prototype.calculatePhysics = function () {
        var w = this;
        this.particles.forEach(function (p) {
            p.acceleration = [0, 0];
            w.particles.forEach(function (q) {
                if (p.getId() != q.getId()) {
                    var xDistance = p.position[0] - q.position[0];
                    var yDistance = p.position[1] - q.position[1];
                    var dist = pythagoras(xDistance, yDistance);
                    var ang = Math.atan2(xDistance, yDistance);
                    var resultAcceleration = w.c_constant * coloumbsLaw(p.charge, q.charge, dist) / p.mass;
                    p.acceleration[0] += resultAcceleration * Math.sin(ang);
                    p.acceleration[1] += resultAcceleration * Math.cos(ang);
                }
            });
        });
    };
    World.prototype.physicsStep = function () {
        this.calculatePhysics();
        this.particles.forEach(function (p) {
            p.velocity[0] += p.acceleration[0];
            p.velocity[1] += p.acceleration[1];
            p.position[0] += p.velocity[0];
            p.position[1] += p.velocity[1];
        });
    };
    World.prototype.resetWorld = function () {
        var w = this;
        this.particles = [];
        JSON.parse(JSON.stringify(this.savedParticles)).forEach(function (p) {
            var newP = new Particle(p.charge, p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.particles.push(newP);
        });
    };
    ;
    World.prototype.saveCurrentParticles = function () {
        var w = this;
        this.savedParticles = [];
        JSON.parse(JSON.stringify(this.particles)).forEach(function (p) {
            var newP = new Particle(p.charge, p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.savedParticles.push(newP);
        });
    };
    World.prototype.togglePlayPause = function () {
        this.paused = !this.paused;
        return this.paused;
    };
    return World;
}());
var Particle = /** @class */ (function () {
    function Particle(charge, mass, position, color, velocity, acceleration) {
        this.id = "";
        this.charge = 0;
        this.mass = 1;
        this.position = [0, 0];
        this.velocity = [0, 0];
        this.acceleration = [0, 0];
        this.color = "#ffffff";
        this.selected = false;
        this.charge = charge;
        this.mass = mass;
        this.position = position;
        this.color = getRandomColor();
        if (velocity)
            this.velocity = velocity;
        if (acceleration)
            this.acceleration = acceleration;
        if (color)
            this.color = color;
    }
    Particle.prototype.draw = function (ctx, w) {
        ctx.beginPath();
        ctx.arc(this.position[0] * w.scale + w.drawingOffset[0], this.position[1] * w.scale + w.drawingOffset[1], this.mass * w.scale, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        if (this.selected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };
    Particle.prototype.setId = function (id) { this.id = id; };
    Particle.prototype.getId = function () { return this.id; };
    return Particle;
}());
function init() {
    console.log("Ready!");
    canvas = document.createElement("canvas");
    ctx = canvas.getContext('2d');
    mainBody = document.getElementsByTagName("body")[0];
    mainBody.style.margin = "0";
    mainBody.appendChild(canvas);
    ui = new UI(mainBody);
    world = new World();
    document.addEventListener("keydown", function (e) {
        if (e.shiftKey)
            world.shiftPress = true;
    });
    document.addEventListener("keyup", function (e) {
        world.shiftPress = false;
    });
    canvas.addEventListener("mousemove", function (e) {
        world.cursorPosition = [e.clientX, e.clientY];
    });
    canvas.addEventListener("click", function (e) {
        world.getParticles().forEach(function (p) {
            var drawFromX = p.position[0] * world.scale + world.drawingOffset[0];
            var drawFromY = p.position[1] * world.scale + world.drawingOffset[1];
            p.selected = (
            // select within region if it's not already selected, if it is, deselect it.
            (pythagoras(drawFromX - world.cursorPosition[0], drawFromY - world.cursorPosition[1]) < p.mass * world.scale && !p.selected) ||
                // enable multi-select
                (p.selected && world.shiftPress));
        });
        ui.initInfo(world);
    });
    ui.initInfo(world);
    window.requestAnimationFrame(draw);
    canvasSizeReset();
    window.addEventListener("resize", function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(canvasSizeReset, 250);
    });
}
function draw() {
    var _a, _b;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    // config.fps = times.length;
    (_a = world) === null || _a === void 0 ? void 0 : _a.draw(ctx);
    (_b = ui) === null || _b === void 0 ? void 0 : _b.updateDebug(world, times.length);
    // ui?.updateMenu(world.particles);
    window.requestAnimationFrame(draw);
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function canvasSizeReset() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    world.drawingOffset = [canvas.width / 2, canvas.height / 2];
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
}
function paintBg(color) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
}
function drawArrow(ctx, fromx, fromy, tox, toy, width, headLength) {
    var angle = Math.atan2(toy - fromy, tox - fromx);
    // This makes it so the end of the arrow head is located at tox, toy, don't ask where 1.15 comes from
    tox -= Math.cos(angle) * ((width * 1.15));
    toy -= Math.sin(angle) * ((width * 1.15));
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
    ctx.lineTo(tox - headLength * Math.cos(angle - Math.PI / 7), toy - headLength * Math.sin(angle - Math.PI / 7));
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headLength * Math.cos(angle + Math.PI / 7), toy - headLength * Math.sin(angle + Math.PI / 7));
    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headLength * Math.cos(angle - Math.PI / 7), toy - headLength * Math.sin(angle - Math.PI / 7));
    //draws the paths created above
    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}
function coloumbsLaw(charge1, charge2, distance) {
    return charge1 * charge2 / distance;
}
function pythagoras(x, y) {
    return Math.sqrt(x * x + y * y);
}
window.onload = init;
