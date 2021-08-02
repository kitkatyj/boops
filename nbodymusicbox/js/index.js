var Particle = (function () {
    function Particle(mass, position, color, velocity, acceleration) {
        this.id = "";
        this.mass = 1;
        this.position = [0, 0];
        this.velocity = [0, 0];
        this.acceleration = [0, 0];
        this.color = "#ffffff";
        this.selected = false;
        this.mouseDown = false;
        this.trail = [];
        this.dragOffset = [0, 0];
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
        var drawFromX = (this.position[0] + w.cameraPosition[0]) * w.scale + w.drawingOffset[0];
        var drawFromY = (this.position[1] + w.cameraPosition[1]) * -w.scale + w.drawingOffset[1];
        var drawToX = drawFromX + this.acceleration[0] * w.scale * w.arrowScale * this.mass;
        var drawToY = drawFromY + this.acceleration[1] * -w.scale * w.arrowScale * this.mass;
        var d = pythagoras(this.acceleration[0], this.acceleration[1]) * 50;
        if (d >= 7.5)
            d = 7.5;
        if (world.showTrails)
            this.drawTrail(w);
        ctx.beginPath();
        ctx.arc((this.position[0] + w.cameraPosition[0]) * w.scale + w.drawingOffset[0], (this.position[1] + w.cameraPosition[1]) * -w.scale + w.drawingOffset[1], this.mass * w.scale, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        if (this.selected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.closePath();
        if (world.showArrows)
            this.drawArrow(ctx, drawFromX, drawFromY, drawToX, drawToY, d, d * 2);
    };
    Particle.prototype.drawTrail = function (w) {
        var p = this;
        if (world.trailStyle === 0) {
            this.trail.forEach(function (t, index) {
                ctx.beginPath();
                ctx.arc((t[0] + w.cameraPosition[0]) * w.scale + w.drawingOffset[0], (t[1] + w.cameraPosition[1]) * -w.scale + w.drawingOffset[1], 1, 0, 2 * Math.PI);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = index / p.trail.length;
                ctx.fill();
                ctx.closePath();
                ctx.globalAlpha = 1;
            });
        }
        else {
            for (var i = 1; i < this.trail.length; i++) {
                ctx.beginPath();
                ctx.moveTo((this.trail[i][0] + w.cameraPosition[0]) * w.scale + w.drawingOffset[0], (this.trail[i][1] + w.cameraPosition[1]) * -w.scale + w.drawingOffset[1]);
                ctx.lineTo((this.trail[i - 1][0] + w.cameraPosition[0]) * w.scale + w.drawingOffset[0], (this.trail[i - 1][1] + w.cameraPosition[1]) * -w.scale + w.drawingOffset[1]);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = w.scale * p.mass;
                ctx.globalAlpha = i / p.trail.length * 0.3;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    };
    Particle.prototype.drawArrow = function (ctx, fromx, fromy, tox, toy, width, headLength) {
        var angle = Math.atan2(toy - fromy, tox - fromx);
        tox -= Math.cos(angle) * ((width * 1.15));
        toy -= Math.sin(angle) * ((width * 1.15));
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headLength * Math.cos(angle - Math.PI / 7), toy - headLength * Math.sin(angle - Math.PI / 7));
        ctx.lineTo(tox - headLength * Math.cos(angle + Math.PI / 7), toy - headLength * Math.sin(angle + Math.PI / 7));
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headLength * Math.cos(angle - Math.PI / 7), toy - headLength * Math.sin(angle - Math.PI / 7));
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    };
    Particle.prototype.setId = function (id) { this.id = id; };
    Particle.prototype.getId = function () { return this.id; };
    Particle.prototype.enableInput = function (enable) {
        if (this.massInput && this.positionInputs && this.velocityInputs && this.accelerationInputs) {
            this.massInput.disabled =
                this.positionInputs[0].disabled =
                    this.positionInputs[1].disabled =
                        this.velocityInputs[0].disabled =
                            this.velocityInputs[1].disabled =
                                this.accelerationInputs[0].disabled =
                                    this.accelerationInputs[1].disabled = !enable;
        }
    };
    return Particle;
}());
var ParticlePair = (function () {
    function ParticlePair(p1, p2, oscFreq) {
        this.particles = [];
        this.distance = 0;
        this.velocity = 0;
        this.lastD = 0;
        this.lastV = 0;
        this.periapsis = false;
        this.selected = false;
        this.oscFreq = 392;
        this.wave = 'sine';
        this.fade = 0;
        this.particles = [p1, p2];
        if (oscFreq)
            this.oscFreq = oscFreq;
    }
    ParticlePair.prototype.update = function () {
        this.periapsis = false;
        this.distance = pythagoras(this.particles[0].position[0] - this.particles[1].position[0], this.particles[0].position[1] - this.particles[1].position[1]);
        if (this.distanceLabel)
            this.distanceLabel.innerHTML = "<span>Distance: " + this.distance.toFixed(2) + "</span>";
        if (this.distance > 0) {
            this.velocity = this.distance - this.lastD;
            this.lastD = this.distance;
            if (this.velocityLabel)
                this.velocityLabel.innerHTML = "<span>Velocity: " + this.velocity.toFixed(2) + "</span>";
        }
        if (this.fade > 0) {
            this.draw();
            this.fade -= 0.1;
        }
        if (this.lastV <= 0 && this.velocity > 0 && this.distance < world.perapsisThreshold && !world.paused) {
            this.periapsis = true;
            this.gainNode.gain.setValueAtTime(0.3, world.audioCtx.currentTime);
            this.gainNode.gain.setTargetAtTime(0, world.audioCtx.currentTime, 0.2);
            this.fade = 1;
        }
        this.lastV = this.velocity;
        if (this.selected) {
            this.draw(true);
        }
    };
    ParticlePair.prototype.draw = function (fixed) {
        ctx.beginPath();
        ctx.moveTo((this.particles[0].position[0] + world.cameraPosition[0]) * world.scale + world.drawingOffset[0], (this.particles[0].position[1] + world.cameraPosition[1]) * -world.scale + world.drawingOffset[1]);
        ctx.lineTo((this.particles[1].position[0] + world.cameraPosition[0]) * world.scale + world.drawingOffset[0], (this.particles[1].position[1] + world.cameraPosition[1]) * -world.scale + world.drawingOffset[1]);
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        if (fixed) {
            ctx.globalAlpha = 0.5 + 0.5 * this.fade;
        }
        else {
            ctx.globalAlpha = this.fade;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    };
    ParticlePair.prototype.select = function () {
        this.selected = true;
        this.particles[0].selected = this.particles[1].selected = false;
    };
    ParticlePair.prototype.enableInput = function (enable) {
        if (this.noteSelect)
            this.noteSelect.disabled = !enable;
    };
    return ParticlePair;
}());
var UI = (function () {
    function UI(mainBody) {
        this.UIconfig = {
            debugVisible: false
        };
        var uTemp = localStorage.getItem("UIconfig");
        if (uTemp) {
            this.UIconfig = JSON.parse(localStorage.getItem("UIconfig"));
        }
        var u = this;
        this.particleMenu = document.createElement("div");
        this.particleInfo = document.createElement("div");
        this.controlPanel = document.createElement("div");
        this.playPauseBtn = document.createElement("a");
        this.stepForwardBtn = document.createElement("a");
        this.resetBtn = document.createElement("a");
        this.debug = document.createElement("div");
        this.addParticleBtn = document.createElement("a");
        this.debug.setAttribute("id", "debug");
        this.debug.classList.add("ui");
        if (!this.UIconfig.debugVisible)
            this.debug.classList.add("hidden");
        mainBody.appendChild(this.debug);
        this.particleMenu.setAttribute("id", "particle_menu");
        this.particleMenu.classList.add("ui");
        this.addParticleBtn.setAttribute("id", "add_particle");
        this.addParticleBtn.textContent = "AddParticle";
        this.addParticleBtn.setAttribute("title", "Add Particle");
        this.addParticleBtn.classList.add("btn");
        this.addParticleBtn.addEventListener("click", function (e) {
            toggleHeader('close');
            var newP = new Particle(1, [0, 0]);
            newP.mouseDown = true;
            world.addParticle(newP);
            document.addEventListener("mousemove", particleDragged);
            u.hideUI(true);
        });
        this.particleInfo.setAttribute("id", "particle_info");
        this.particleMenu.appendChild(this.addParticleBtn);
        this.particleMenu.appendChild(this.particleInfo);
        mainBody.appendChild(this.particleMenu);
        this.controlPanel.setAttribute("id", "ctrls");
        this.controlPanel.classList.add("ui");
        this.playPauseBtn.setAttribute("id", "play_pause");
        this.playPauseBtn.textContent = this.playPauseBtn.dataset.status = "Play";
        this.playPauseBtn.setAttribute("title", "Play");
        this.playPauseBtn.classList.add("btn");
        this.playPauseBtn.addEventListener("click", function (e) {
            toggleHeader('close');
            var status = "Pause";
            if (world.togglePlayPause()) {
                status = "Play";
                u.stepForwardBtn.classList.remove("disabled");
                u.addParticleBtn.classList.remove("disabled");
                world.resetAudioContext();
                world.pPairs.forEach(function (pp) {
                    pp.enableInput(true);
                });
                world.getParticles().forEach(function (p) {
                    p.enableInput(true);
                });
            }
            else {
                u.stepForwardBtn.classList.add("disabled");
                world.pPairs.forEach(function (pp) {
                    pp.fade = 0;
                    pp.osc = world.audioCtx.createOscillator();
                    pp.gainNode = world.audioCtx.createGain();
                    pp.gainNode.gain.value = 0;
                    pp.gainNode.connect(world.audioCtx.destination);
                    pp.osc.connect(pp.gainNode);
                    pp.osc.frequency.value = pp.oscFreq;
                    pp.osc.type = pp.wave;
                    pp.osc.start();
                    pp.enableInput(false);
                });
                world.getParticles().forEach(function (p) {
                    p.enableInput(false);
                });
                u.addParticleBtn.classList.add("disabled");
            }
            this.textContent = this.dataset.status = status;
            this.setAttribute("title", status);
            u.resetBtn.classList.remove("disabled");
        });
        this.stepForwardBtn.setAttribute("id", "step");
        this.stepForwardBtn.textContent = "Step Forward";
        this.stepForwardBtn.classList.add("btn");
        this.stepForwardBtn.setAttribute("title", "Step Forward");
        this.stepForwardBtn.addEventListener("click", function (e) {
            toggleHeader('close');
            world.physicsStep();
            u.updateParticleInfo();
            u.resetBtn.classList.remove("disabled");
        });
        var ppBtn = this.playPauseBtn;
        this.resetBtn.setAttribute("id", "reset");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("btn");
        this.resetBtn.setAttribute("title", "Reset");
        this.resetBtn.addEventListener("click", function (e) {
            if (!world.paused)
                world.resetAudioContext();
            world.load();
            world.paused = true;
            ppBtn.textContent = ppBtn.dataset.status = "Play";
            this.classList.add("disabled");
            u.stepForwardBtn.classList.remove("disabled");
            u.addParticleBtn.classList.remove("disabled");
            u.updateParticleInfo();
            u.initInfo();
        });
        this.resetBtn.classList.add("disabled");
        this.controlPanel.appendChild(this.playPauseBtn);
        this.controlPanel.appendChild(this.stepForwardBtn);
        this.controlPanel.appendChild(this.resetBtn);
        mainBody.appendChild(this.controlPanel);
    }
    UI.prototype.toggleDebug = function () {
        this.UIconfig.debugVisible = !this.UIconfig.debugVisible;
        this.debug.classList.toggle("hidden");
        localStorage.setItem("UIconfig", JSON.stringify(this.UIconfig));
    };
    UI.prototype.initPPInfo = function () {
        var u = this;
        u.particleInfo.innerHTML = '';
        world.pPairs.forEach(function (pp) {
            if (pp.selected) {
                var p1 = pp.particles[0];
                var p2 = pp.particles[1];
                var pInfo = document.createElement("div");
                pInfo.classList.add("p_info");
                var titleBar = document.createElement("p");
                titleBar.classList.add("particle_titlebar");
                var colorCircleA = document.createElement("span");
                colorCircleA.setAttribute("type", "color");
                colorCircleA.style.backgroundColor = p1.color;
                colorCircleA.classList.add("color-circle");
                var colorCircleB = document.createElement("span");
                colorCircleB.setAttribute("type", "color");
                colorCircleB.style.backgroundColor = p2.color;
                colorCircleB.classList.add("color-circle");
                var particleTitle = document.createElement("span");
                particleTitle.classList.add("particle_title");
                particleTitle.textContent = "Particle " + p1.getId() + " & Particle " + p2.getId();
                titleBar.appendChild(colorCircleA);
                titleBar.appendChild(colorCircleB);
                titleBar.appendChild(particleTitle);
                var pickedPP_1 = world.findParticlePair(p1, p2);
                var line1 = document.createElement("p");
                pickedPP_1.distanceLabel = line1;
                var line2 = document.createElement("p");
                pickedPP_1.velocityLabel = line2;
                var line3 = document.createElement("p");
                var noteLabel = document.createElement("span");
                noteLabel.textContent = "Note";
                var noteInput_1 = document.createElement("select");
                pickedPP_1.noteSelect = noteInput_1;
                noteInput_1.setAttribute("id", pickedPP_1.particles[0].getId() + "-" + pickedPP_1.particles[1].getId() + "_note");
                noteInput_1.innerHTML = "";
                for (var i = 0; i < world.notes.length; i++) {
                    var noteOption = document.createElement("option");
                    noteOption.value = world.freqs[i].toString();
                    noteOption.selected = (world.freqs[i] === pickedPP_1.oscFreq);
                    noteOption.textContent = world.notes[i];
                    noteInput_1.appendChild(noteOption);
                }
                noteInput_1.addEventListener("change", function () {
                    pickedPP_1.oscFreq = parseFloat(noteInput_1.value);
                    world.save();
                });
                line3.appendChild(noteLabel);
                line3.appendChild(noteInput_1);
                pInfo.appendChild(titleBar);
                pInfo.appendChild(line1);
                pInfo.appendChild(line2);
                pInfo.appendChild(line3);
                u.particleInfo.appendChild(pInfo);
            }
        });
    };
    UI.prototype.initInfo = function () {
        var u = this;
        u.particleInfo.innerHTML = '';
        world.getParticles().forEach(function (p, index) {
            if (p.selected) {
                var pInfo = document.createElement("div");
                pInfo.classList.add("p_info");
                var titleBar = document.createElement("p");
                titleBar.classList.add("particle_titlebar");
                var colorCircle_1 = document.createElement("input");
                colorCircle_1.setAttribute("type", "color");
                colorCircle_1.value = p.color;
                colorCircle_1.style.backgroundColor = p.color;
                colorCircle_1.addEventListener("change", function () {
                    p.color = colorCircle_1.value;
                    colorCircle_1.style.backgroundColor = p.color;
                });
                colorCircle_1.classList.add("color-circle");
                var particleTitle = document.createElement("span");
                particleTitle.classList.add("particle_title");
                particleTitle.textContent = "Particle " + p.getId();
                var deleteBtn = document.createElement("a");
                deleteBtn.classList.add("btn");
                deleteBtn.classList.add("delete_particle");
                deleteBtn.textContent = "Delete";
                deleteBtn.addEventListener("click", function () {
                    world.removeParticleById(p.getId());
                    world.calculatePhysics();
                    world.save();
                    u.initInfo();
                });
                titleBar.appendChild(colorCircle_1);
                titleBar.appendChild(particleTitle);
                titleBar.appendChild(deleteBtn);
                var line1 = document.createElement("p");
                var massLabel = document.createElement("label");
                massLabel.setAttribute("for", p.getId() + "_mass");
                massLabel.textContent = "Mass";
                var massInput = document.createElement("input");
                p.massInput = massInput;
                massLabel.setAttribute("id", p.getId() + "_mass");
                massInput.type = "number";
                massInput.value = p.mass.toString();
                massInput.addEventListener("change", function () {
                    p.mass = parseFloat(this.value);
                });
                line1.appendChild(massLabel);
                line1.appendChild(massInput);
                var line2 = document.createElement("p");
                var positionLabel = document.createElement("span");
                positionLabel.textContent = "Position";
                var posXInput = document.createElement("input");
                posXInput.setAttribute("id", p.getId() + "_xPos");
                posXInput.type = "number";
                posXInput.value = p.position[0].toString();
                posXInput.addEventListener("change", function () {
                    p.position[0] = parseFloat(this.value);
                });
                var posXLabel = document.createElement("label");
                posXLabel.setAttribute("for", p.getId() + "_xPos");
                posXLabel.textContent = "x";
                var posYInput = document.createElement("input");
                posYInput.setAttribute("id", p.getId() + "_yPos");
                posYInput.type = "number";
                posYInput.value = p.position[1].toString();
                posYInput.addEventListener("change", function () {
                    p.position[1] = parseFloat(this.value);
                });
                var posYLabel = document.createElement("label");
                posYLabel.setAttribute("for", p.getId() + "_yPos");
                posYLabel.textContent = "y";
                p.positionInputs = [posXInput, posYInput];
                line2.appendChild(positionLabel);
                line2.appendChild(posXInput);
                line2.appendChild(posXLabel);
                line2.appendChild(posYInput);
                line2.appendChild(posYLabel);
                var line3 = document.createElement("p");
                var velocityLabel = document.createElement("span");
                velocityLabel.textContent = "Velocity";
                var velXInput = document.createElement("input");
                velXInput.setAttribute("id", p.getId() + "_xVel");
                velXInput.type = "number";
                velXInput.value = p.velocity[0].toString();
                velXInput.addEventListener("change", function () {
                    p.velocity[0] = parseFloat(this.value);
                });
                var velXLabel = document.createElement("label");
                velXLabel.setAttribute("for", p.getId() + "_xVel");
                velXLabel.textContent = "x";
                var velYInput = document.createElement("input");
                velYInput.setAttribute("id", p.getId() + "_yVel");
                velYInput.type = "number";
                velYInput.value = p.velocity[1].toString();
                velYInput.addEventListener("change", function () {
                    p.velocity[1] = parseFloat(this.value);
                });
                var velYLabel = document.createElement("label");
                velYLabel.setAttribute("for", p.getId() + "_yVel");
                velYLabel.textContent = "y";
                p.velocityInputs = [velXInput, velYInput];
                line3.appendChild(velocityLabel);
                line3.appendChild(velXInput);
                line3.appendChild(velXLabel);
                line3.appendChild(velYInput);
                line3.appendChild(velYLabel);
                var line4 = document.createElement("p");
                var accelerationLabel = document.createElement("span");
                accelerationLabel.textContent = "Acceleration";
                var accXInput = document.createElement("input");
                accXInput.setAttribute("id", p.getId() + "_xAcc");
                accXInput.type = "number";
                accXInput.value = p.acceleration[0].toString();
                var accXLabel = document.createElement("label");
                accXLabel.setAttribute("for", p.getId() + "_xAcc");
                accXLabel.textContent = "x";
                var accYInput = document.createElement("input");
                accYInput.setAttribute("id", p.getId() + "_yAcc");
                accYInput.type = "number";
                accYInput.value = p.acceleration[1].toString();
                var accYLabel = document.createElement("label");
                accYLabel.setAttribute("for", p.getId() + "_yAcc");
                accYLabel.textContent = "y";
                p.accelerationInputs = [accXInput, accYInput];
                line4.appendChild(accelerationLabel);
                line4.appendChild(accXInput);
                line4.appendChild(accXLabel);
                line4.appendChild(accYInput);
                line4.appendChild(accYLabel);
                var line5_1 = document.createElement("p");
                line5_1.classList.add("pLinkList");
                var pairLabel = document.createElement("span");
                pairLabel.textContent = "Link";
                line5_1.appendChild(pairLabel);
                world.getParticles().forEach(function (p2) {
                    if (p != p2) {
                        var pLink = document.createElement("a");
                        pLink.classList.add("pLink");
                        pLink.textContent = p2.getId();
                        var colorCircleA = document.createElement("div");
                        colorCircleA.setAttribute("type", "color");
                        colorCircleA.style.backgroundColor = p2.color;
                        colorCircleA.classList.add("color-circle");
                        pLink.appendChild(colorCircleA);
                        pLink.addEventListener("click", function () {
                            var pp = world.findParticlePair(p, p2);
                            pp.select();
                            u.initPPInfo();
                            if (!world.paused) {
                                pp.enableInput(false);
                            }
                        });
                        line5_1.appendChild(pLink);
                    }
                });
                pInfo.appendChild(titleBar);
                pInfo.appendChild(line1);
                pInfo.appendChild(line2);
                pInfo.appendChild(line3);
                pInfo.appendChild(line4);
                pInfo.appendChild(line5_1);
                var inputs = pInfo.getElementsByTagName("input");
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].addEventListener("change", function () {
                        world.calculatePhysics();
                        world.save();
                    });
                }
                u.particleInfo.appendChild(pInfo);
            }
        });
    };
    UI.prototype.updateParticleInfo = function () {
        world.getParticles().forEach(function (p) {
            if (p.selected) {
                p.positionInputs[0].value = p.position[0].toString();
                p.positionInputs[1].value = p.position[1].toString();
                p.velocityInputs[0].value = p.velocity[0].toString();
                p.velocityInputs[1].value = p.velocity[1].toString();
                p.accelerationInputs[0].value = p.acceleration[0].toString();
                p.accelerationInputs[1].value = p.acceleration[1].toString();
            }
        });
    };
    UI.prototype.updateDebug = function (world, fps) {
        var d = this.debug;
        d.innerHTML = "fps:" + fps + "<br>";
        d.innerHTML += "cursorPosition: [" + world.cursorPosition[0] + "," + world.cursorPosition[1] + "]<br>";
        d.innerHTML += "drawingOffset: [" + world.drawingOffset[0] + "," + world.drawingOffset[1] + "]<br>";
        d.innerHTML += "cameraPosition: [" + world.cameraPosition[0] + "," + world.cameraPosition[1] + "]<br>";
        d.innerHTML += "shiftPress: " + world.shiftPress + "<br>";
        d.innerHTML += "dragging: " + world.dragging + "<br>";
    };
    UI.prototype.hideUI = function (hide) {
        var uiElements = document.getElementsByClassName("ui");
        for (var i = 0; i < uiElements.length; i++) {
            if (uiElements[i].getAttribute("id") != "debug") {
                (hide) ? uiElements[i].classList.add("hidden") : uiElements[i].classList.remove("hidden");
            }
        }
    };
    return UI;
}());
var World = (function () {
    function World() {
        this.cameraPosition = [0, 0];
        this.scale = 8;
        this.drawingOffset = [0, 0];
        this.particles = [];
        this.c_constant = 0.5;
        this.paused = true;
        this.arrowScale = 50;
        this.cursorPosition = [0, 0];
        this.dragging = false;
        this.shiftPress = false;
        this.dragOffset = [0, 0];
        this.showTrails = true;
        this.trailStyle = 1;
        this.trailLength = 50;
        this.showArrows = false;
        this.pPairs = [];
        this.perapsisThreshold = 30;
        this.notes = ['C4', 'C#4/Db4', 'D4', 'D#4/Eb4', 'E4', 'F4', 'F#4/Gb4', 'G4', 'G#4/Ab4', 'A4', 'A#4/Bb4', 'B4', 'C5', 'C#5/Db5', 'D5', 'D#5/Eb5', 'E5', 'F5', 'F#5/Gb5', 'G5', 'G#5/Ab5', 'A5', 'A#5/Bb5', 'B5', 'C6', 'C#6/Db6', 'D6', 'D#6/Eb6', 'E6', 'F6', 'F#6/Gb6', 'G6', 'G#6/Ab6', 'A6', 'A#6/Bb6', 'B6'];
        this.freqs = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77, 1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53];
        var wTemp = localStorage.getItem("world_nbody");
        if (wTemp) {
            this.load();
        }
        else {
            var defaultP1 = new Particle(1, [5.3638707339, 0.54088605008], '#F35588');
            var defaultP2 = new Particle(1, [-2.52099126491, 6.94527327749], '#A3F7BF');
            var defaultP3 = new Particle(1, [-2.75706601688, -3.35933589318], '#FFF591');
            defaultP1.velocity = [-0.569379585581, 1.255291102531];
            defaultP2.velocity = [0.079644615252, -0.458625997341];
            defaultP3.velocity = [0.489734970329, -0.796665105189];
            this.addParticle(defaultP1);
            this.addParticle(defaultP2);
            this.addParticle(defaultP3);
            this.pPairs = [];
            var pp1 = new ParticlePair(defaultP1, defaultP2, 392.00);
            var pp2 = new ParticlePair(defaultP2, defaultP3, 523.25);
            var pp3 = new ParticlePair(defaultP1, defaultP3, 783.99);
            this.pPairs.push(pp1, pp2, pp3);
            this.calculatePhysics();
        }
        this.resetAudioContext();
        this.save();
    }
    World.prototype.draw = function (ctx) {
        var w = this;
        this.pPairs.forEach(function (pp) {
            pp.update();
        });
        this.particles.forEach(function (p) {
            p.draw(ctx, w);
        });
        if (!w.paused) {
            this.physicsStep();
            ui.updateParticleInfo();
        }
    };
    World.prototype.resetAudioContext = function () {
        var w = this;
        this.pPairs.forEach(function (pp) {
            pp.fade = 0;
            if (pp.gainNode) {
                pp.gainNode.gain.value = 0;
                pp.osc.disconnect(pp.gainNode);
                pp.gainNode.disconnect(w.audioCtx.destination);
            }
        });
        this.audioCtx = new window.AudioContext();
    };
    World.prototype.addParticle = function (p) {
        var id = this.particles.length;
        while (this.getParticleById(id.toString())) {
            id++;
        }
        p.setId(id.toString());
        this.particles.push(p);
        this.refreshParticlePairs();
    };
    World.prototype.refreshParticlePairs = function () {
        var w = this;
        w.particles.forEach(function (p1) {
            w.particles.forEach(function (p2) {
                var duplicateExists = false;
                w.pPairs.forEach(function (pp) {
                    if ((pp.particles[0].getId() === p1.getId() || pp.particles[1].getId() === p1.getId()) &&
                        (pp.particles[0].getId() === p2.getId() || pp.particles[1].getId() === p2.getId())) {
                        duplicateExists = true;
                    }
                });
                if (p1 != p2 && !duplicateExists) {
                    w.pPairs.push(new ParticlePair(p1, p2));
                }
            });
        });
    };
    World.prototype.findParticlePair = function (p1, p2) {
        var pickedPP = null;
        this.pPairs.forEach(function (pp) {
            if ((pp.particles[0].getId() === p1.getId() || pp.particles[1].getId() === p1.getId()) &&
                (pp.particles[0].getId() === p2.getId() || pp.particles[1].getId() === p2.getId())) {
                pickedPP = pp;
            }
        });
        return pickedPP;
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
                    var resultAcceleration = -w.c_constant * gravity(p.mass, q.mass, dist) / p.mass;
                    p.acceleration[0] += resultAcceleration * Math.sin(ang);
                    p.acceleration[1] += resultAcceleration * Math.cos(ang);
                }
            });
        });
    };
    World.prototype.physicsStep = function () {
        var w = this;
        this.calculatePhysics();
        this.particles.forEach(function (p) {
            p.trail.push(JSON.parse(JSON.stringify(p.position)));
            if (p.trail.length > w.trailLength) {
                p.trail.shift();
            }
            p.velocity[0] += p.acceleration[0];
            p.velocity[1] += p.acceleration[1];
            p.position[0] += p.velocity[0];
            p.position[1] += p.velocity[1];
        });
    };
    World.prototype.removeParticleById = function (id) {
        var index = this.particles.length - 1;
        while (index >= 0) {
            if (this.particles[index].getId() == id) {
                this.particles.splice(index, 1);
            }
            index--;
        }
        this.refreshParticlePairs2();
    };
    World.prototype.refreshParticlePairs2 = function () {
        var index = this.pPairs.length - 1;
        while (index >= 0) {
            if (this.getParticleById(this.pPairs[index].particles[0].getId()) === null || this.getParticleById(this.pPairs[index].particles[1].getId()) === null) {
                this.pPairs.splice(index, 1);
            }
            index--;
        }
    };
    World.prototype.translateParticles = function (savedParticles) {
        var w = this;
        this.particles = [];
        JSON.parse(JSON.stringify(savedParticles)).forEach(function (p) {
            var newP = new Particle(p.mass, p.position, p.color, p.velocity, p.acceleration);
            newP.setId(p.id);
            w.particles.push(newP);
        });
    };
    ;
    World.prototype.translateParticlePairs = function (savedPP) {
        var w = this;
        this.pPairs = [];
        JSON.parse(JSON.stringify(savedPP)).forEach(function (pp) {
            var newPP = new ParticlePair(w.getParticleById(pp.particles[0].id), w.getParticleById(pp.particles[1].id), pp.oscFreq);
            w.pPairs.push(newPP);
        });
    };
    World.prototype.save = function () {
        localStorage.setItem("world_nbody", JSON.stringify(this));
    };
    World.prototype.load = function () {
        var wTemp = JSON.parse(localStorage.getItem("world_nbody"));
        this.arrowScale = wTemp.arrowScale;
        this.c_constant = wTemp.c_constant;
        this.cameraPosition = wTemp.cameraPosition;
        this.dragging = false;
        this.drawingOffset = wTemp.drawingOffset;
        this.paused = true;
        this.scale = wTemp.scale;
        this.shiftPress = false;
        this.showArrows = wTemp.showArrows;
        this.showTrails = wTemp.showTrails;
        this.translateParticles(wTemp.particles);
        this.translateParticlePairs(wTemp.pPairs);
    };
    World.prototype.togglePlayPause = function () {
        this.paused = !this.paused;
        return this.paused;
    };
    World.prototype.noteToFreq = function (note) {
        return this.freqs[Math.abs(this.notes.indexOf(note))];
    };
    return World;
}());
var mainBody, ui, canvas, ctx, world, dragTimeout, resizeTimer, zoomTimer = null;
var times = [];
var config = {
    fps: 0,
    frameCounter: true
};
function init() {
    console.log("Ready!");
    if (localStorage.getItem("header") == "false" || localStorage.getItem("header") == null) {
        document.getElementsByTagName("header")[0].classList.remove("closed");
    }
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
    document.addEventListener("mousemove", function (e) {
        world.cursorPosition = [
            (e.clientX - world.drawingOffset[0]) / world.scale,
            (e.clientY - world.drawingOffset[1]) / -world.scale
        ];
    });
    canvas.addEventListener("mousedown", function (e) {
        toggleHeader('close');
        var particleSelected = false;
        world.getParticles().forEach(function (p) {
            var drawFromX = (p.position[0] + world.cameraPosition[0]) * world.scale + world.drawingOffset[0];
            var drawFromY = (p.position[1] + world.cameraPosition[1]) * -world.scale + world.drawingOffset[1];
            if ((pythagoras(drawFromX - e.clientX, drawFromY - e.clientY) < p.mass * world.scale) ||
                (p.selected && world.shiftPress)) {
                p.selected = p.mouseDown = true;
                p.dragOffset[0] = world.cursorPosition[0] - p.position[0] - world.cameraPosition[0];
                p.dragOffset[1] = world.cursorPosition[1] - p.position[1] - world.cameraPosition[1];
                if (world.paused) {
                    document.addEventListener("mousemove", particleDragged);
                }
                particleSelected = true;
            }
            else {
                p.selected = false;
            }
        });
        ui.initInfo();
        deselectAll('pairs');
        if (!particleSelected) {
            world.dragOffset[0] = world.cursorPosition[0] - world.cameraPosition[0];
            world.dragOffset[1] = world.cursorPosition[1] - world.cameraPosition[1];
            document.addEventListener("mousemove", backgroundDragged);
        }
    });
    document.addEventListener("mouseup", function (e) {
        if (world.dragging) {
            if (world.paused)
                world.save();
            ui.hideUI(false);
            ui.initInfo();
        }
        world.dragging = false;
        document.removeEventListener("mousemove", particleDragged);
        document.removeEventListener("mousemove", backgroundDragged);
        canvas.style.cursor = "auto";
        world.getParticles().forEach(function (p) {
            p.mouseDown = false;
        });
    });
    canvas.addEventListener("wheel", function (e) {
        var scale = e.deltaY * 0.01;
        if (scale > 4)
            scale = 4;
        else if (scale < -4)
            scale = -4;
        if (world.scale - scale > 1)
            world.scale -= scale;
        if (world.paused) {
            clearTimeout(zoomTimer);
            zoomTimer = setTimeout(function () {
                world.save();
            }, 1000);
        }
    });
    ui.initInfo();
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
    (_a = world) === null || _a === void 0 ? void 0 : _a.draw(ctx);
    (_b = ui) === null || _b === void 0 ? void 0 : _b.updateDebug(world, times.length);
    window.requestAnimationFrame(draw);
}
function backgroundDragged() {
    world.dragging = true;
    world.cameraPosition[0] = parseFloat((world.cursorPosition[0] - world.dragOffset[0]).toFixed(1));
    world.cameraPosition[1] = parseFloat((world.cursorPosition[1] - world.dragOffset[1]).toFixed(1));
}
function particleDragged() {
    world.dragging = true;
    world.calculatePhysics();
    world.getParticles().forEach(function (p) {
        if (p.mouseDown) {
            canvas.style.cursor = "grabbing";
            p.position[0] = parseFloat((world.cursorPosition[0] - p.dragOffset[0] - world.cameraPosition[0]).toFixed(1));
            p.position[1] = parseFloat((world.cursorPosition[1] - p.dragOffset[1] - world.cameraPosition[1]).toFixed(1));
            if (p.positionInputs) {
                p.positionInputs[0].value = (world.cursorPosition[0] - p.dragOffset[0] - world.cameraPosition[0]).toFixed(1);
                p.positionInputs[1].value = (world.cursorPosition[1] - p.dragOffset[1] - world.cameraPosition[1]).toFixed(1);
            }
            if (p.velocityInputs) {
                p.velocityInputs[0].value = p.velocity[0].toString();
                p.velocityInputs[1].value = p.velocity[1].toString();
            }
            if (p.accelerationInputs) {
                p.accelerationInputs[0].value = p.acceleration[0].toString();
                p.accelerationInputs[1].value = p.acceleration[1].toString();
            }
        }
    });
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
    if (world.paused)
        world.save();
}
function paintBg(color) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
}
function gravity(mass1, mass2, distance) {
    return mass1 * mass2 / distance;
}
function pythagoras(x, y) {
    return Math.sqrt(x * x + y * y);
}
function reset() {
    localStorage.clear();
    location.reload();
}
function resetCamera() {
    world.scale = 8;
    world.cameraPosition = [0, 0];
}
function toggleDebug() {
    ui.toggleDebug();
}
function toggleMenu(setting) {
    if (setting == 'close')
        document.getElementById("main_menu").classList.add("closed");
    else if (setting == 'open')
        document.getElementById("main_menu").classList.remove("closed");
    else
        document.getElementById("main_menu").classList.toggle("closed");
}
function toggleHeader(setting) {
    toggleMenu('close');
    if (setting == 'close')
        document.getElementsByTagName("header")[0].classList.add("closed");
    else if (setting == 'open')
        document.getElementsByTagName("header")[0].classList.remove("closed");
    else
        document.getElementsByTagName("header")[0].classList.toggle("closed");
    var headerOpen = document.getElementsByTagName("header")[0].classList.contains("closed");
    localStorage.setItem("header", String(headerOpen));
}
function toggleArrows() {
    world.showArrows = !world.showArrows;
    world.save();
}
function toggleTrails() {
    world.showTrails = !world.showTrails;
    world.save();
}
function selectAll(setting) {
    toggleMenu('close');
    switch (setting) {
        case 'particles':
            world.getParticles().forEach(function (p) {
                p.selected = true;
                ui.initInfo();
            });
            break;
        case 'pairs':
            world.pPairs.forEach(function (pp) {
                pp.select();
                ui.initPPInfo();
            });
    }
}
function deselectAll(setting) {
    switch (setting) {
        case 'particles':
            world.getParticles().forEach(function (p) {
                p.selected = false;
            });
            break;
        case 'pairs':
            world.pPairs.forEach(function (pp) {
                pp.selected = false;
            });
    }
}
window.onload = init;
