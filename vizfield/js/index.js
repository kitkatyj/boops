var Arrow = (function () {
    function Arrow(THREE, originX, originY, originZ, length, color) {
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
    function ArrowField(THREE, sizeX, sizeY, sizeZ, densityX, densityY, densityZ) {
        this.arrows = [];
        this.kConstant = 1;
        this.maxIntensity = 0;
        this.normalizeStrength = true;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.densityX = densityX;
        this.densityY = densityY;
        this.densityZ = densityZ;
        var stepX = Math.floor(this.sizeX / densityX);
        var stepY = Math.floor(this.sizeY / densityY);
        var stepZ = Math.floor(this.sizeZ / densityZ);
        for (var x = -this.sizeX; x <= this.sizeX; x += stepX) {
            for (var y = -this.sizeY; y <= this.sizeY; y += stepY) {
                for (var z = -this.sizeZ; z <= this.sizeZ; z += stepZ) {
                    var newA = new Arrow(THREE, x, y, z);
                    this.addArrow(newA);
                }
            }
        }
    }
    ArrowField.prototype.addArrow = function (a) {
        this.arrows.push(a);
    };
    ArrowField.prototype.calculateFieldPhysics = function (THREE, particles) {
        var f = this;
        this.arrows.forEach(function (a) {
            particles.forEach(function (p, index) {
                var xDistance = a.origin.x - p.posX;
                var yDistance = a.origin.y - p.posY;
                var zDistance = a.origin.z - p.posZ;
                var newD = f.electricField(p.charge, xDistance, yDistance, zDistance);
                var finalP = (particles.length == index + 1);
                a.addDirection(THREE, newD.x, newD.y, newD.z, finalP);
                a.strength = newD.strength;
                if (f.maxIntensity < newD.strength && newD.strength != Infinity)
                    f.maxIntensity = newD.strength;
            });
        });
        if (!this.normalizeStrength) {
            this.arrows.forEach(function (a) {
                var newLength = Math.log(100 * a.strength / f.maxIntensity) / 2;
                a.arrowHelper.setLength(newLength, newLength * 0.2, newLength * 0.3);
            });
        }
    };
    ArrowField.prototype.electricField = function (charge, xDistance, yDistance, zDistance) {
        var distance = this.pythagoras3d(xDistance, yDistance, zDistance);
        var theta = Math.atan2(yDistance, xDistance);
        var phi = Math.acos(zDistance / distance);
        var result = this.kConstant * charge / (distance * distance);
        return {
            strength: Math.abs(result),
            x: result * Math.sin(phi) * Math.cos(theta),
            y: result * Math.sin(phi) * Math.sin(theta),
            z: result * Math.cos(phi)
        };
    };
    ArrowField.prototype.pythagoras3d = function (x, y, z) {
        return Math.sqrt(x * x + y * y + z * z);
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
        this.geometry = new THREE.SphereGeometry(1, 16, 16);
        this.geometry.translate(posX, posY, posZ);
        this.material = new THREE.MeshStandardMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
    return Particle;
}());
var World = (function () {
    function World(THREE) {
        this.particles = [];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.camera.position.x = 20;
        this.camera.position.y = 10;
        this.camera.position.z = 40;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.pointLight = new THREE.PointLight(0xffffff, 1);
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.pointLight.position.x = 20;
        this.pointLight.position.y = 20;
        this.pointLight.position.z = 20;
        this.scene.add(this.pointLight, this.ambientLight);
        this.arrowField = new ArrowField(THREE, 8, 24, 8, 1.5, 4.5, 1.5);
        console.log(this);
    }
    World.prototype.draw = function () {
        this.controls.update();
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
    World.prototype.addParticle = function (p) {
        this.particles.push(p);
    };
    World.prototype.updateParticles = function (THREE, length) {
        var w = this;
        this.clearWorld();
        for (var i = -length; i <= length; i += 2) {
            var newP = new Particle(THREE, 1, 0, i, 0, '#ff0000');
            this.addParticle(newP);
        }
        ;
        var cylinderGeometry = new THREE.CylinderGeometry(1, 1, (length + 1) * 2, 16);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, wireframe: true });
        var cylinder = new THREE.Mesh(cylinderGeometry, material);
        w.scene.add(cylinder);
        this.particles.forEach(function (p) {
            w.scene.add(p.mesh);
        });
        this.arrowField.calculateFieldPhysics(THREE, this.particles);
        this.arrowField.arrows.forEach(function (a) {
            w.scene.add(a.arrowHelper);
        });
    };
    return World;
}());
define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var world, resizeTimer = null;
    var defaultLength = 10;
    function init(THREE) {
        world = new World(THREE);
        world.updateParticles(THREE, defaultLength);
        var infoPanel = document.createElement("div");
        infoPanel.setAttribute("id", "info-panel");
        infoPanel.classList.add("ui");
        var lengthLabel = document.createElement("label");
        lengthLabel.setAttribute("for", "length");
        lengthLabel.textContent = "Length ";
        var lengthInput = document.createElement("input");
        lengthInput.setAttribute("id", "length");
        lengthInput.setAttribute("min", "0");
        lengthInput.type = "number";
        lengthInput.value = defaultLength.toString();
        lengthInput.addEventListener("change", function () {
            world.updateParticles(THREE, parseInt(lengthInput.value));
        });
        infoPanel.appendChild(lengthLabel);
        infoPanel.appendChild(lengthInput);
        document.body.appendChild(infoPanel);
        window.addEventListener("resize", function (e) {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(rendererSizeReset, 250);
        });
        draw();
    }
    exports.init = init;
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
