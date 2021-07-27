var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Component = (function () {
    function Component(type, imgSrc, width, height, position, connections) {
        this.connectors = [];
        this.selected = false;
        this.dragOffset = [0, 0];
        this.position = [0, 0];
        this.hovered = false;
        this.type = type;
        this.width = width;
        this.height = height;
        if (position)
            this.position = position;
        if (connections)
            this.connectors = connections;
        if (imgSrc)
            this.img = world.mapImage(this.img, imgSrc);
    }
    Component.prototype.draw = function () {
        ctx.drawImage(this.img, world.worldPosToDrawX(this.position[0] - this.width / 2), world.worldPosToDrawY(this.position[1] + this.height / 2), world.scale * this.width, world.scale * this.height);
        if (world.showConnectors) {
            this.connectors.forEach(function (c) {
                c.draw();
            });
        }
        this.hovered = ((this.position[0] - this.width / 2 < (world.cursorPosition[0] - world.cameraPosition[0]) && (world.cursorPosition[0] - world.cameraPosition[0]) < this.position[0] + this.width / 2) &&
            (this.position[1] - this.height / 2 < (world.cursorPosition[1] - world.cameraPosition[1]) && (world.cursorPosition[1] - world.cameraPosition[1]) < this.position[1] + this.height / 2));
        if (this.selected) {
            this.drawBorder('yellow', 4);
        }
        else if (this.hovered) {
            this.drawBorder('rgba(0,0,0,0.5)', 2);
        }
    };
    Component.prototype.addConnector = function (position) {
        var c = new Connector(this, position);
        this.connectors.push(c);
        return c;
    };
    Component.prototype.drawBorder = function (style, width) {
        ctx.lineWidth = width;
        ctx.strokeStyle = style;
        ctx.strokeRect(world.worldPosToDrawX(this.position[0] - this.width / 2) - width, world.worldPosToDrawY(this.position[1] + this.height / 2) - width, world.scale * this.width + width * 2, world.scale * this.height + width * 2);
    };
    return Component;
}());
var LightBulb = (function (_super) {
    __extends(LightBulb, _super);
    function LightBulb(position) {
        var _this = _super.call(this, 'lightbulb', 'lightbulb.svg', 12, 12, position) || this;
        _this.current = 0;
        _this.addConnector([-6, 0]);
        _this.addConnector([6, 0]);
        return _this;
    }
    LightBulb.prototype.setCurrent = function (current) {
        this.current = current;
        if (this.current > 0) {
            this.img = world.mapImage(this.img, 'lightbulb_light.svg');
            this.width = 16;
            this.height = 16;
        }
        else {
            this.img = world.mapImage(this.img, 'lightbulb.svg');
            this.width = 12;
            this.height = 12;
        }
    };
    return LightBulb;
}(Component));
var Cell = (function (_super) {
    __extends(Cell, _super);
    function Cell(position) {
        var _this = _super.call(this, 'cell', 'cell.svg', 5, 12, position) || this;
        _this.addConnector([-2, 0]);
        _this.addConnector([2, 0]);
        return _this;
    }
    return Cell;
}(Component));
var Connector = (function () {
    function Connector(parent, position) {
        this.parent = parent;
        this.position = position;
    }
    Connector.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc((this.parent.position[0] + world.cameraPosition[0] + this.position[0]) * world.scale + world.drawingOffset[0], (this.parent.position[1] + world.cameraPosition[1] - this.position[1]) * -world.scale + world.drawingOffset[1], 10, 0, 2 * Math.PI);
        ctx.fillStyle = world.connectionColor;
        ctx.fill();
        ctx.closePath();
    };
    Connector.prototype.getDrawingPosition = function () {
        return [
            (this.parent.position[0] + world.cameraPosition[0] + this.position[0]) * world.scale + world.drawingOffset[0],
            (this.parent.position[1] + world.cameraPosition[1] - this.position[1]) * -world.scale + world.drawingOffset[1]
        ];
    };
    return Connector;
}());
var UI = (function () {
    function UI(mainBody) {
        this.UIconfig = {
            debugVisible: true
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
            }
            else {
                u.stepForwardBtn.classList.add("disabled");
            }
            this.textContent = this.dataset.status = status;
            this.setAttribute("title", status);
            u.resetBtn.classList.remove("disabled");
        });
        var ppBtn = this.playPauseBtn;
        this.resetBtn.setAttribute("id", "reset");
        this.resetBtn.textContent = "Reset";
        this.resetBtn.classList.add("btn");
        this.resetBtn.setAttribute("title", "Reset");
        this.resetBtn.addEventListener("click", function (e) {
            world.load();
            world.paused = true;
            ppBtn.textContent = ppBtn.dataset.status = "Play";
            this.classList.add("disabled");
            u.stepForwardBtn.classList.remove("disabled");
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
    UI.prototype.updateDebug = function (world, fps) {
        var d = this.debug;
        d.innerHTML = "fps:" + fps + "<br>";
        d.innerHTML += "cursorPosition: [" + world.cursorPosition[0] + "," + world.cursorPosition[1] + "]<br>";
        d.innerHTML += "drawingOffset: [" + world.drawingOffset[0] + "," + world.drawingOffset[1] + "]<br>";
        d.innerHTML += "dragOffset: [" + world.dragOffset[0] + "," + world.dragOffset[1] + "]<br>";
        d.innerHTML += "cameraPosition: [" + world.cameraPosition[0] + "," + world.cameraPosition[1] + "]<br>";
        d.innerHTML += "shiftPress: " + world.shiftPress + "<br>";
        d.innerHTML += "dragging: " + world.dragging + "<br>";
        d.innerHTML += "scale: " + world.scale + "<br>";
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
var Wire = (function () {
    function Wire(connections) {
        this.connections = [];
        this.joints = [];
        if (connections)
            this.connections = connections;
    }
    Wire.prototype.draw = function () {
        var pos1 = this.connections[0].getDrawingPosition();
        var pos2 = this.connections[1].getDrawingPosition();
        ctx.beginPath();
        ctx.moveTo(pos1[0], pos1[1]);
        this.joints.forEach(function (j) {
            ctx.lineTo(world.worldPosToDrawX(j[0]), world.worldPosToDrawY(j[1]));
        });
        ctx.lineTo(pos2[0], pos2[1]);
        ctx.lineWidth = world.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    };
    Wire.prototype.connect = function (c) {
        this.connections.push(c);
    };
    Wire.prototype.addJoint = function (p) {
        this.joints.push(p);
    };
    return Wire;
}());
var World = (function () {
    function World() {
        this.cameraPosition = [0, 0];
        this.scale = 8;
        this.drawingOffset = [0, 0];
        this.paused = true;
        this.cursorPosition = [0, 0];
        this.dragging = false;
        this.shiftPress = false;
        this.dragOffset = [0, 0];
        this.showConnectors = true;
        this.connectionColor = '#00aa22';
        this.images = [];
        this.components = [];
        this.wires = [];
        var wTemp = localStorage.getItem("world");
        if (wTemp) {
            this.load();
        }
        else {
        }
    }
    World.prototype.mapImage = function (img, imgSrc) {
        var imgMatch = false;
        this.images.forEach(function (image) {
            if (imgSrc === image.src) {
                img = image.img;
                imgMatch = true;
            }
        });
        if (!imgMatch) {
            img = new Image();
            img.src = 'media/components/' + imgSrc;
            ;
            this.images.push({ src: imgSrc, img: img });
        }
        return img;
    };
    World.prototype.addComponent = function (c) {
        this.components.push(c);
    };
    World.prototype.addWire = function (w) {
        this.wires.push(w);
    };
    World.prototype.draw = function () {
        this.wires.forEach(function (w) {
            w.draw();
        });
        this.components.forEach(function (c) {
            c.draw();
        });
    };
    World.prototype.save = function () {
        var cache = [];
        localStorage.setItem("world", JSON.stringify(this, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) >= 0)
                    return;
                cache.push(value);
            }
            return value;
        }));
    };
    World.prototype.load = function () {
        var wTemp = JSON.parse(localStorage.getItem("world"));
        console.log(wTemp);
        this.cameraPosition = wTemp.cameraPosition;
        this.dragging = false;
        this.drawingOffset = wTemp.drawingOffset;
        this.paused = true;
        this.scale = wTemp.scale;
        this.shiftPress = false;
    };
    World.prototype.togglePlayPause = function () {
        this.paused = !this.paused;
        return this.paused;
    };
    World.prototype.worldPosToDraw = function (pos) {
        return [
            (pos[0] + this.cameraPosition[0]) * this.scale + this.drawingOffset[0],
            (pos[1] + this.cameraPosition[1]) * -this.scale + this.drawingOffset[1]
        ];
    };
    World.prototype.worldPosToDrawX = function (posX) {
        return (posX + this.cameraPosition[0]) * this.scale + this.drawingOffset[0];
    };
    World.prototype.worldPosToDrawY = function (posY) {
        return (posY + this.cameraPosition[1]) * -this.scale + this.drawingOffset[1];
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
    var l1 = new LightBulb([0, 0]);
    var l2 = new LightBulb([-10, 20]);
    l2.setCurrent(1);
    var c1 = new Cell([0, -20]);
    world.addComponent(l1);
    world.addComponent(l2);
    world.addComponent(c1);
    var w1 = new Wire();
    w1.connect(l1.connectors[0]);
    w1.connect(c1.connectors[0]);
    w1.addJoint([-12, -15]);
    world.addWire(w1);
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
        if (e.button === 2) {
            world.dragOffset[0] = world.cursorPosition[0] - world.cameraPosition[0];
            world.dragOffset[1] = world.cursorPosition[1] - world.cameraPosition[1];
            document.addEventListener("mousemove", backgroundDragged);
        }
        else {
            var particleDragged_1 = false;
            world.components.forEach(function (c) {
                if (c.hovered) {
                    c.selected = particleDragged_1 = true;
                    c.dragOffset[0] = world.cursorPosition[0] - c.position[0] - world.cameraPosition[0];
                    c.dragOffset[1] = world.cursorPosition[1] - c.position[1] - world.cameraPosition[1];
                }
                else {
                    c.selected = false;
                }
            });
            document.addEventListener("mousemove", itemDragged);
        }
    });
    canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });
    document.addEventListener("mouseup", function (e) {
        if (world.dragging) {
            if (world.paused)
                world.save();
            ui.hideUI(false);
        }
        world.dragging = false;
        document.removeEventListener("mousemove", itemDragged);
        document.removeEventListener("mousemove", backgroundDragged);
        canvas.style.cursor = "auto";
    });
    document.addEventListener("wheel", function (e) {
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
    (_a = world) === null || _a === void 0 ? void 0 : _a.draw();
    (_b = ui) === null || _b === void 0 ? void 0 : _b.updateDebug(world, times.length);
    window.requestAnimationFrame(draw);
}
function itemDragged() {
    world.dragging = true;
    world.components.forEach(function (c) {
        if (c.selected) {
            c.position[0] = parseFloat((world.cursorPosition[0] - c.dragOffset[0] - world.cameraPosition[0]).toFixed(1));
            c.position[1] = parseFloat((world.cursorPosition[1] - c.dragOffset[1] - world.cameraPosition[1]).toFixed(1));
        }
    });
}
function backgroundDragged() {
    world.dragging = true;
    world.cameraPosition[0] = parseFloat((world.cursorPosition[0] - world.dragOffset[0]).toFixed(1));
    world.cameraPosition[1] = parseFloat((world.cursorPosition[1] - world.dragOffset[1]).toFixed(1));
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
    toggleMenu();
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
window.onload = init;
