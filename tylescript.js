const palette = document.querySelector('#c64colours');
const container = document.querySelector('section');
const mirrorxbutton = document.querySelector('#mirrorx');
const mirrorybutton = document.querySelector('#mirrory');

const canvas = document.querySelector('#main');
let cx = canvas.getContext('2d');  
cx.imageSmoothingEnabled = false;
cx.strokeStyle = '#000000';
canvas.width = canvas.height = 200;

const resize = document.querySelector('#resize');
resize.width = resize.height = 20;
let rx = resize.getContext('2d');
rx.imageSmoothingEnabled = false;

let colour = '000000';
let pixelsizex = 20;
let pixelsizey = 10;
let mousedown = false;
let oldx = null;
let oldy = null;
let chosencolour = null;
let click = false;
let pixels = [];
let mirrorx = mirrorxbutton.checked;
let mirrory = mirrorybutton.checked;

const resizecanvas = (w,h) => {
    resize.width = w;
    resize.height = h;
    canvas.width = (w * pixelsizex) / 2;
    canvas.height = h * pixelsizey;
}

const onmousedown = (ev) => {
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

const paint = (x, y) =>{
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
    rx.drawImage(canvas, 0, 0, canvas.width/10, canvas.height/10);
    document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
}

const pickcolour = (ev) => {
    if (chosencolour) {
        chosencolour.classList.remove('current');
    }
    let t = ev.target;
    if (t.nodeName === 'LI') { 
        colour = '#' + t.dataset.col; 
        t.classList.add('current');
    }
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
const gettilesize = (ev) => {
    let val = document.querySelector('#size').value;
    let w = val.split('x')[0];
    let h = val.split('x')[1];
    resizecanvas(w ,h);
    ev.preventDefault();
}
const clearcanvases = (ev) => {
    cx.clearRect(0, 0, canvas.width, canvas.height);
    rx.clearRect(0, 0, resize.width, resize.height);
    document.body.style.background="url(" + resize.toDataURL("image/png")+ ") repeat";
}

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

canvas.addEventListener('mouseout', onmouseout, false);
canvas.addEventListener('mousedown', onmousedown, false);
canvas.addEventListener('click', clicked, false);
canvas.addEventListener('mouseup', onmouseup, false);
canvas.addEventListener('mousemove', onmousemove, false);
palette.addEventListener('click', pickcolour, false);
document.querySelector('form').addEventListener('submit', gettilesize, false);
mirrorxbuttonxbuton.addEventListener('click', (ev) => { mirrorx = ev.target.checked; });
mirrorybutton.addEventListener('click', (ev) => { mirrory = ev.target.checked; });
// document.querySelector('#undo').addEventListener('click', (ev) => {
//   cx.putImageData(pixels, 0, 0,);
//   ev.preventDefault();
// });
document.querySelector('#clear').addEventListener('click', clearcanvases);
window.addEventListener('paste', getClipboardImage, false);
container.addEventListener('drop', imageFromDrop, false);
container.addEventListener('dragover', (ev) => {
    ev.preventDefault();
}, false);