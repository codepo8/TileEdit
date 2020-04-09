/*
  TileEdit JS
  Homepage: https://github.com/codepo8/TileEdit/
  Copyright (c) 2020 Christian Heilmann
  Code licensed under the BSD License:
  http://christianheilmann.com/license.txt
*/

/* DOM elements and buttons */

(function(){
const palette = document.querySelector('#c64colours');
const container = document.querySelector('section');
const mirrorxbutton = document.querySelector('#mirrorx');
const mirrorybutton = document.querySelector('#mirrory');
const undobutton = document.querySelector('#undo');
const save = document.querySelector('#save');
const examples = document.querySelector('#examples ul');
const toggles = document.querySelectorAll('.toggle');
const newmenu = document.querySelector('#new');
const colourfield = document.querySelector('#colour');
const c64mode = document.querySelector('#c64mode');
const multicolourmode = document.querySelector('#mc');
const mclabel = document.querySelector('label[for=mc]');

/* Paint Canvas */
const canvas = document.querySelector('#main');
let cx = canvas.getContext('2d');  
cx.imageSmoothingEnabled = false;
cx.strokeStyle = '#000000';
canvas.width = canvas.height = 200;

/* Canvas to paint tile with */
const resize = document.querySelector('#resize');
resize.width = resize.height = 20;
let rx = resize.getContext('2d');
rx.imageSmoothingEnabled = false;

let colour = '000000';
let pixelsizex = 20;
let pixelsizey = 10;
let mousedown = false;
let click = false;
let oldx = null;
let oldy = null;
let chosencolour = null;
let pixels = {};
let mirrorx = mirrorxbutton.checked;
let mirrory = mirrorybutton.checked;

/* Mouse interaction */
const onmousedown = (ev) => {
    pixels = cx.getImageData(0, 0, canvas.width, canvas.height);
    mousedown = true;
    ev.preventDefault();
}

const clicked = (ev) => {
    mousedown = false;
    let pos = getposition(ev);
    paint(pos.x, pos.y);
    ev.preventDefault();
}

const onmouseout = (ev) => {
    oldx = -1;
    oldy = -1;
    mousedown = false;
}

const onmouseup = (ev) => {
    mousedown = false;
    ev.preventDefault();
}

const onmousemove = (ev) => {
    let pos = getposition(ev);
    if (mousedown) { paint(pos.x, pos.y); } 
}

/* Canvas manipulation */

const resizecanvas = (w,h) => {
    resize.width = w;
    resize.height = h;
    canvas.width = (w * pixelsizex) / (pixelsizex/pixelsizey);
    canvas.height = h * pixelsizey;
}

const paint = (x, y) => {
    cx.beginPath();
    if (oldx > 0 && oldy > 0) {cx.moveTo(oldx, oldy);}
    x = (Math.ceil(x / pixelsizex) * pixelsizex) - pixelsizex;
    y = (Math.ceil(y / pixelsizey) * pixelsizey) - pixelsizey;
    cx.moveTo(x, y);          
    cx.fillStyle = colour;
    cx.lineHeight = 0;
    if (colour == '#transparent') {
        cx.clearRect(x, y, pixelsizex, pixelsizey);
    } else {
        cx.fillRect(x, y, pixelsizex, pixelsizey);
        if (mirrorx && !mirrory) {
            let offsetx =  (canvas.width - pixelsizex) - x;
            cx.fillRect(offsetx, y, pixelsizex, pixelsizey);
        }
        if (mirrory && !mirrorx) {
            let offsety =  (canvas.height - pixelsizey) - y;
            cx.fillRect(x, offsety, pixelsizex, pixelsizey);
        } 
        if (mirrorx && mirrory) {
            let offsetx =  (canvas.width - pixelsizex) - x;
            cx.fillRect(offsetx, y, pixelsizex, pixelsizey);
            let offsety =  (canvas.height - pixelsizey) - y;
            cx.fillRect(x, offsety, pixelsizex, pixelsizey);
            cx.fillRect(offsetx, offsety, pixelsizex, pixelsizey);
        }   
    }
    rx.clearRect(0, 0, resize.width, resize.height);
    rx.drawImage(canvas, 0, 0, canvas.width/10, canvas.height/10);
    document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
    tosavestring();
}

const getposition = ev => {
    let x = ev.clientX;
    let y = ev.clientY;
    let pos = ev.target.getBoundingClientRect();
    return {
        x: x - pos.x|0,
        y: y - pos.y|0
    };
}

const clearcanvases = (ev) => {    cx.clearRect(0, 0, canvas.width, canvas.height);
    rx.clearRect(0, 0, resize.width, resize.height);
    document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
}

const undo = (ev) => {
    if (pixels.data) {
        clearcanvases();
        cx.putImageData(pixels, 0, 0);
        rx.drawImage(canvas, 0, 0, canvas.width / 10, canvas.height / 10);
        document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
        tosavestring();
        ev.preventDefault();
    }
}

const tosavestring = () => save.href = resize.toDataURL('image/png'); 

/* DOM interaction */
const pickcolour = (ev) => {
    if (ev.type === 'change') {
        colour = colourfield.value;
    } else {
        if (chosencolour) {
            chosencolour.classList.remove('current');
        }
        let t = ev.target;
        if (t.nodeName === 'LI') { 
            colour = '#' + t.dataset.col; 
            t.classList.add('current');
            chosencolour = t;
        }
    }
}

const gettilesize = (ev) => {
    let val = document.querySelector('#size').value;
    let w = val.split('x')[0];
    let h = val.split('x')[1];
    resizecanvas(w ,h);
    clearcanvases();
    newmenu.classList.toggle('visible');
    ev.preventDefault();
}

const pickexample = (ev) => {
    let t = ev.target;
    if (t.src) { loadImage(t.src);}
    ev.preventDefault();
}
const toggle = (ev) => {
    let t = ev.target;
    t.parentNode.classList.toggle('visible');
    ev.preventDefault();
}
const modechange = (ev) => {
    if (c64mode.checked) {
        colourfield.classList.add('hidden');
        palette.classList.remove('hidden');
        mclabel.classList.remove('hidden');
    } else {
        colourfield.classList.remove('hidden');
        palette.classList.add('hidden');
        mclabel.classList.add('hidden');
        pixelsizex = 10;
        pixelsizey = 10;
    }
};
const pixelchange = (ev) => {
    if (multicolourmode.checked) {
        pixelsizex = 20;
        pixelsizey = 10;
    } else {
        pixelsizex = 10;
        pixelsizey = 10;
    }
};

/* Images into document */

const loadImage = (file, name) => {
    let img = new Image();
    img.src = file;
    img.onload = function() {
        resizecanvas(img.naturalWidth,img.naturalHeight);
        cx.imageSmoothingEnabled = false;
        cx.drawImage(img,0,0, img.naturalWidth * 10, img.naturalHeight * 10 );
        rx.drawImage(canvas, 0, 0, canvas.width / 10, canvas.height / 10);
        document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
    };
}

const getClipboardImage = (ev) => {
    let items = ev.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            let blob = items[i].getAsFile();
            loadImage(window.URL.createObjectURL(blob));
            break;
        }
    }
}      
        
const imageFromDrop = (e) => {
    let file = e.dataTransfer.files[0];
    loadImage(window.URL.createObjectURL(file), file.name);
    e.preventDefault();
}

/* Event Listeners */ 
canvas.addEventListener('mouseout', onmouseout, false);
canvas.addEventListener('mousedown', onmousedown, false);
canvas.addEventListener('click', clicked, false);
canvas.addEventListener('mouseup', onmouseup, false);
canvas.addEventListener('mousemove', onmousemove, false);
palette.addEventListener('click', pickcolour, false);
colourfield.addEventListener('change', pickcolour, false);
toggles.forEach(t => t.addEventListener('click', toggle, false));
examples.addEventListener('click', pickexample, false);
document.querySelector('form').addEventListener('submit', gettilesize, false);
mirrorxbutton.addEventListener('click', (ev) => { mirrorx = ev.target.checked; });
mirrorybutton.addEventListener('click', (ev) => { mirrory = ev.target.checked; });
c64mode.addEventListener('click', modechange, false);
multicolourmode.addEventListener('click', pixelchange, false);
undobutton.addEventListener('click', undo);
document.querySelector('#clear').addEventListener('click', clearcanvases);
window.addEventListener('paste', getClipboardImage, false);
container.addEventListener('drop', imageFromDrop, false);
container.addEventListener('dragover', (ev) => { ev.preventDefault(); }, false);

window.addEventListener('load',(ev) => {;
// Random image on start 

let alltextures = document.querySelectorAll('#examples img');
let rand = (alltextures.length * Math.random());
loadImage(alltextures[~~rand].src);

// Select first colour 

palette.querySelector('li').click();
tosavestring(); 
}); 
})();
