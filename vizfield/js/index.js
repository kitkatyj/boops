var Arrow = (function () {
    function Arrow(THREE, originX, originY, originZ, length, color) {
        this.headLength = 0.5;
        this.headWidth = 0.3;
        this.color = color || '#ffffff';
        this.length = length || 1;
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
    function ArrowField(THREE, sizeX, sizeY, sizeZ, density) {
        this.arrows = [];
        this.kConstant = 1;
        this.maxIntensity = 0;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;
        this.density = density;
        var stepX = Math.floor(this.sizeX / density);
        var stepY = Math.floor(this.sizeY / density);
        var stepZ = Math.floor(this.sizeZ / density);
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
        this.arrows.forEach(function (a) {
            var newLength = Math.log(100 * a.strength / f.maxIntensity) / 2;
            a.arrowHelper.setLength(newLength, newLength * 0.2, newLength * 0.3);
        });
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
        var newP1 = new Particle(THREE, 1, 0, 2, 0, '#ff0000');
        var newP3 = new Particle(THREE, -1, 0, -2, 0, '#0000ff');
        this.addParticle(newP1);
        this.addParticle(newP3);
        var w = this;
        this.particles.forEach(function (p) {
            w.scene.add(p.mesh);
        });
        this.camera.position.x = 15;
        this.camera.position.y = 15;
        this.camera.position.z = 15;
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.pointLight = new THREE.PointLight(0xffffff, 1);
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.pointLight.position.x = 20;
        this.pointLight.position.y = 10;
        this.pointLight.position.z = 20;
        this.scene.add(this.pointLight, this.ambientLight);
        this.arrowField = new ArrowField(THREE, 8, 8, 8, 2);
        this.arrowField.calculateFieldPhysics(THREE, this.particles);
        this.arrowField.arrows.forEach(function (a) {
            w.scene.add(a.arrowHelper);
        });
        console.log(this.arrowField);
    }
    World.prototype.draw = function () {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    };
    World.prototype.clearWorld = function () {
        this.particles = [];
    };
    World.prototype.addParticle = function (p) {
        this.particles.push(p);
    };
    return World;
}());
define("index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var world, resizeTimer = null;
    function init(THREE) {
        world = new World(THREE);
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
