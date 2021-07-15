var Arrow = (function () {
    function Arrow(THREE, originX, originY, originZ, color, length) {
        this.headLength = 1;
        this.headWidth = 0.6;
        this.color = color || '#ffffff';
        this.length = length || 2;
        this.origin = new THREE.Vector3(originX, originY, originZ);
        this.direction = new THREE.Vector3(0, 0, 0);
        this.arrowHelper = new THREE.ArrowHelper(this.direction, this.origin, this.length, this.color, this.headLength, this.headWidth);
    }
    Arrow.prototype.addDirection = function (THREE, dirX, dirY, dirZ, normalize) {
        var newDir = new THREE.Vector3(dirX, dirY, dirZ);
        this.direction.add(newDir);
        if (normalize)
            this.direction.normalize();
        this.arrowHelper.setDirection(this.direction);
    };
    return Arrow;
}());
var ArrowField = (function () {
    function ArrowField(THREE, sizeX, sizeY, sizeZ, stepX, stepY, stepZ) {
        this.arrows = [];
        this.kConstant = 1;
        this.maxIntensity = 0;
        this.normalizeStrength = false;
        this.visual = 1;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.stepX = stepX;
        this.stepY = stepY;
        this.stepZ = stepZ;
        this.regenerateArrows(THREE);
    }
    ArrowField.prototype.regenerateArrows = function (THREE) {
        this.arrows = [];
        for (var x = -this.stepX * this.sizeX; x <= this.stepX * this.sizeX; x += this.stepX * 2) {
            for (var y = -this.stepY * this.sizeY; y <= this.stepY * this.sizeY; y += this.stepY * 2) {
                for (var z = -this.stepZ * this.sizeZ; z <= this.stepZ * this.sizeZ; z += this.stepZ * 2) {
                    var newA = new Arrow(THREE, x, y, z, '#ffffff');
                    this.addArrow(newA);
                }
            }
        }
    };
    ArrowField.prototype.addArrow = function (a) {
        this.arrows.push(a);
    };
    ArrowField.prototype.calculateFieldPhysics = function (world) {
        var f = this;
        this.arrows.forEach(function (a) {
            a.strength = 0;
            world.particles.forEach(function (p, index) {
                var xDistance = a.origin.x - p.posX;
                var yDistance = a.origin.y - p.posY;
                var zDistance = a.origin.z - p.posZ;
                var newD = null;
                switch (world.field) {
                    case 0:
                        newD = f.electricField(p.charge, xDistance, yDistance, zDistance);
                        break;
                    case 1:
                        newD = f.magneticField(world.current, world.axis, xDistance, yDistance, zDistance);
                        break;
                }
                var finalP = (world.particles.length == index + 1);
                a.addDirection(world.THREE, newD.x, newD.y, newD.z, finalP);
                a.strength += newD.strength;
                if (f.maxIntensity < newD.strength && newD.strength != Infinity)
                    f.maxIntensity = newD.strength;
            });
        });
        this.arrows.forEach(function (a) {
            if (f.visual == 1) {
                var hueValue = Math.floor(260 - Math.log(100 * a.strength / f.maxIntensity) * 40);
                a.arrowHelper.setColor("hsl(" + hueValue + ",100%,50%)");
                a.arrowHelper.setLength(2, 0.8, 0.6);
            }
            else {
                var newLength = Math.log(100 * a.strength / f.maxIntensity) / 2;
                a.arrowHelper.setLength(newLength, newLength * 0.4, newLength * 0.3);
                a.arrowHelper.setColor(a.color);
            }
        });
    };
    ArrowField.prototype.electricField = function (charge, xDistance, yDistance, zDistance) {
        var distance = this.pythagoras3d(xDistance, yDistance, zDistance);
        var theta = Math.atan2(yDistance, xDistance);
        var phi = Math.acos(zDistance / distance);
        var result = this.kConstant * charge / (distance * distance);
        return {
            strength: Math.abs(result),
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        };
    };
    ArrowField.prototype.magneticField = function (current, wireAxis, xDistance, yDistance, zDistance) {
        var distance = this.pythagoras3d(xDistance, yDistance, zDistance);
        var theta = Math.atan2(yDistance, xDistance);
        var phi = Math.acos(zDistance / distance);
        var rHat = {
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        };
        var dL = { x: 0, y: 0, z: 0 };
        switch (wireAxis) {
            case 'x':
                dL.x = 1;
                break;
            case 'y':
                dL.y = 1;
                break;
            case 'z':
                dL.z = 1;
                break;
        }
        var crossResult = this.crossProduct(dL.x, dL.y, dL.z, rHat.x, rHat.y, rHat.z);
        var strengthResult = this.kConstant * current / (distance * distance);
        return {
            strength: strengthResult,
            x: crossResult.x,
            y: crossResult.y,
            z: crossResult.z
        };
    };
    ArrowField.prototype.pythagoras3d = function (x, y, z) {
        return Math.sqrt(x * x + y * y + z * z);
    };
    ArrowField.prototype.crossProduct = function (a1, a2, a3, b1, b2, b3) {
        return {
            x: a2 * b3 - a3 * b2,
            y: a3 * b1 - a1 * b3,
            z: a1 * b2 - a2 * b1
        };
    };
    return ArrowField;
}());
var Particle = (function () {
    function Particle(THREE, charge, posX, posY, posZ, color) {
        this.charge = 0;
        this.charge = charge;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.color = color || '#ffffff';
        this.geometry = new THREE.SphereGeometry(0.9, 16, 16);
        this.material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.x = posX;
        this.mesh.position.y = posY;
        this.mesh.position.z = posZ;
    }
    return Particle;
}());
var World = (function () {
    function World(THREE) {
        this.particles = [];
        this.wireLength = 10;
        this.axis = 'x';
        this.tick = 0;
        this.field = 1;
        this.current = 0.1;
        this.default = {
            sizeX: 8, sizeY: 4, sizeZ: 4
        };
        this.THREE = THREE;
        this.scene = new this.THREE.Scene();
        this.camera = new this.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new this.THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.x = -20;
        this.camera.position.y = 10;
        this.camera.position.z = 40;
        this.controls = new this.THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.autoRotate = true;
        this.pointLight = new this.THREE.PointLight(0xffffff, 1);
        this.ambientLight = new this.THREE.AmbientLight(0xffffff, 0.5);
        this.pointLight.position.x = 20;
        this.pointLight.position.y = 20;
        this.pointLight.position.z = 20;
        this.scene.add(this.pointLight, this.ambientLight);
        this.arrowField = new ArrowField(this.THREE, this.default.sizeX - 1, this.default.sizeY - 1, this.default.sizeZ - 1, 3, 3, 3);
    }
    World.prototype.draw = function () {
        var w = this;
        this.refreshArrowField();
        this.controls.update();
        if (this.field == 1) {
            this.particles.forEach(function (p) {
                if (w.axis == 'x') {
                    p.mesh.position.x += w.current;
                    if (p.mesh.position.x > w.wireLength)
                        p.mesh.position.x = -w.wireLength - 2;
                }
                else if (w.axis == 'y') {
                    p.mesh.position.y += w.current;
                    if (p.mesh.position.y > w.wireLength)
                        p.mesh.position.y = -w.wireLength - 2;
                }
                else if (w.axis == 'z') {
                    p.mesh.position.z += w.current;
                    if (p.mesh.position.z > w.wireLength)
                        p.mesh.position.z = -w.wireLength - 2;
                }
            });
        }
        this.renderer.render(this.scene, this.camera);
    };
    World.prototype.clearWorld = function () {
        this.particles = [];
        var cId = this.scene.children.length - 1;
        while (cId > 0) {
            if (this.scene.children[cId].type == "Mesh") {
                this.scene.remove(this.scene.children[cId]);
            }
            cId--;
        }
    };
    World.prototype.clearArrowField = function () {
        this.arrowField.arrows = [];
        var cId = this.scene.children.length - 1;
        while (cId > 0) {
            if (this.scene.children[cId].type == "ArrowHelper") {
                this.scene.remove(this.scene.children[cId]);
            }
            cId--;
        }
    };
    World.prototype.addParticle = function (p) {
        this.particles.push(p);
    };
    World.prototype.updateParticles = function () {
        var w = this;
        this.clearWorld();
        for (var i = -w.wireLength; i <= w.wireLength; i += 2) {
            var newP = new Particle(this.THREE, 1, this.axis == 'x' ? i : 0, this.axis == 'y' ? i : 0, this.axis == 'z' ? i : 0, '#ff0000');
            this.addParticle(newP);
        }
        ;
        var cylinderGeometry = new this.THREE.CylinderGeometry(1, 1, (w.wireLength) * 2 + 2, 16);
        if (this.axis == 'x')
            cylinderGeometry.rotateZ(Math.PI * 0.5);
        else if (this.axis == 'z')
            cylinderGeometry.rotateX(Math.PI * 0.5);
        var material = new this.THREE.MeshStandardMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        var cylinder = new this.THREE.Mesh(cylinderGeometry, material);
        w.scene.add(cylinder);
        this.particles.forEach(function (p) {
            w.scene.add(p.mesh);
        });
        this.arrowField.calculateFieldPhysics(this);
        this.arrowField.arrows.forEach(function (a) {
            w.scene.add(a.arrowHelper);
        });
    };
    World.prototype.updateArrowField = function () {
        var w = this;
        w.clearArrowField();
        w.arrowField.regenerateArrows(this.THREE);
        this.arrowField.calculateFieldPhysics(this);
        this.arrowField.arrows.forEach(function (a) {
            w.scene.add(a.arrowHelper);
        });
    };
    World.prototype.refreshArrowField = function () {
        this.arrowField.calculateFieldPhysics(this);
    };
    return World;
}());
define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var world, resizeTimer = null;
    var lengthInput, lengthLabel = null;
    function init(THREE) {
        world = new World(THREE);
        world.updateParticles();
        var infoPanel = document.createElement("div");
        infoPanel.setAttribute("id", "info-panel");
        infoPanel.classList.add("ui");
        var line0 = document.createElement("p");
        var fieldLabel = document.createElement("label");
        fieldLabel.setAttribute("for", "field");
        fieldLabel.textContent = "Field";
        var fieldSelect = document.createElement("select");
        fieldSelect.setAttribute("id", "field");
        fieldSelect.innerHTML = "<option value=0>Electric</option><option value=1>Magnetic</option>";
        fieldSelect.value = world.field.toString();
        fieldSelect.addEventListener("change", function () {
            world.field = parseInt(fieldSelect.value);
        });
        line0.appendChild(fieldLabel);
        line0.appendChild(fieldSelect);
        var autoRotateLabel = document.createElement("label");
        autoRotateLabel.setAttribute("for", "auto-rotate");
        autoRotateLabel.textContent = "Auto-Rotate";
        var autoRotateInput = document.createElement("input");
        autoRotateInput.setAttribute("id", "auto-rotate");
        autoRotateInput.setAttribute("type", "checkbox");
        autoRotateInput.checked = world.controls.autoRotate;
        autoRotateInput.addEventListener("change", function () {
            world.controls.autoRotate = autoRotateInput.checked;
        });
        line0.appendChild(autoRotateLabel);
        line0.appendChild(autoRotateInput);
        var line1 = document.createElement("p");
        var axisLabel = document.createElement("label");
        axisLabel.setAttribute("for", "axis");
        axisLabel.textContent = "Wire Axis";
        var axisSelect = document.createElement("select");
        axisSelect.setAttribute("id", "axis");
        axisSelect.innerHTML = "<option value='x'>X</option><option value='y'>Y</option><option value='z'>Z</option>";
        axisSelect.value = world.axis;
        axisSelect.addEventListener("change", function () {
            world.axis = this.value;
            world.updateParticles();
        });
        var scaleLabel = document.createElement("label");
        scaleLabel.setAttribute("for", "field");
        scaleLabel.textContent = "Field";
        var scaleSelect = document.createElement("select");
        scaleSelect.setAttribute("id", "field");
        scaleSelect.innerHTML = "<option value=0>Length</option><option value=1>Color</option>";
        scaleSelect.value = world.arrowField.visual.toString();
        scaleSelect.addEventListener("change", function () {
            world.arrowField.visual = parseInt(scaleSelect.value);
        });
        line1.appendChild(axisLabel);
        line1.appendChild(axisSelect);
        line1.appendChild(scaleLabel);
        line1.appendChild(scaleSelect);
        var line2 = document.createElement("p");
        lengthLabel = document.createElement("label");
        lengthLabel.setAttribute("for", "length");
        lengthLabel.textContent = "Wire Length ";
        lengthInput = document.createElement("input");
        lengthInput.setAttribute("id", "length");
        lengthInput.setAttribute("min", "0");
        lengthInput.setAttribute("max", "49");
        lengthInput.type = "range";
        lengthInput.value = world.wireLength.toString();
        lengthInput.addEventListener("input", moveDragged);
        lengthInput.addEventListener("mouseup", function () {
            lengthLabel.textContent = "Wire Length ";
        });
        line2.appendChild(lengthLabel);
        line2.appendChild(lengthInput);
        var line3 = document.createElement("p");
        var sizeXLabel = document.createElement("label");
        sizeXLabel.setAttribute("for", "size-x-input");
        sizeXLabel.textContent = "Field Size X";
        var sizeXInput = document.createElement("input");
        sizeXInput.setAttribute("id", "size-x-input");
        sizeXInput.setAttribute("type", "number");
        sizeXInput.setAttribute("min", "1");
        sizeXInput.setAttribute("max", "9");
        sizeXInput.value = world.default.sizeX.toString();
        sizeXInput.addEventListener("change", function () {
            world.arrowField.sizeX = parseInt(sizeXInput.value) - 1;
            world.updateArrowField();
        });
        var sizeYLabel = document.createElement("label");
        sizeYLabel.setAttribute("for", "size-y-input");
        sizeYLabel.textContent = "Y";
        var sizeYInput = document.createElement("input");
        sizeYInput.setAttribute("id", "size-y-input");
        sizeYInput.setAttribute("type", "number");
        sizeYInput.setAttribute("min", "1");
        sizeYInput.setAttribute("max", "9");
        sizeYInput.value = world.default.sizeY.toString();
        sizeYInput.addEventListener("change", function () {
            world.arrowField.sizeY = parseInt(sizeYInput.value) - 1;
            world.updateArrowField();
        });
        var sizeZLabel = document.createElement("label");
        sizeZLabel.setAttribute("for", "size-z-input");
        sizeZLabel.textContent = "Z";
        var sizeZInput = document.createElement("input");
        sizeZInput.setAttribute("id", "size-z-input");
        sizeZInput.setAttribute("type", "number");
        sizeZInput.setAttribute("min", "1");
        sizeZInput.setAttribute("max", "9");
        sizeZInput.value = world.default.sizeZ.toString();
        sizeZInput.addEventListener("change", function () {
            world.arrowField.sizeZ = parseInt(sizeZInput.value) - 1;
            world.updateArrowField();
        });
        line3.appendChild(sizeXLabel);
        line3.appendChild(sizeXInput);
        line3.appendChild(sizeYLabel);
        line3.appendChild(sizeYInput);
        line3.appendChild(sizeZLabel);
        line3.appendChild(sizeZInput);
        infoPanel.appendChild(line0);
        infoPanel.appendChild(line1);
        infoPanel.appendChild(line2);
        infoPanel.appendChild(line3);
        document.body.appendChild(infoPanel);
        window.addEventListener("resize", function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(rendererSizeReset, 250);
        });
        draw();
    }
    exports.init = init;
    function moveDragged() {
        world.wireLength = lengthInput.value;
        world.updateParticles();
        lengthLabel.textContent = parseInt(lengthInput.value) + 1 + " ";
    }
    function rendererSizeReset() {
        world.renderer.setSize(window.innerWidth, window.innerHeight);
        world.camera.aspect = window.innerWidth / window.innerHeight;
        world.camera.updateProjectionMatrix();
    }
    function draw() {
        world.draw();
        requestAnimationFrame(draw);
    }
});
