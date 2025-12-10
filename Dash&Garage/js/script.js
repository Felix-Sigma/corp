const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const opacityRange = document.getElementById('opacityRange');
const penBtn = document.getElementById('penBtn');
const eraserBtn = document.getElementById('eraserBtn');
const clearCanvas = document.getElementById('clearCanvas');
const carPreview = document.getElementById('carPreview');
const prevCarBtn = document.getElementById('prevCar');
const nextCarBtn = document.getElementById('nextCar');
const saveCarBtn = document.getElementById('saveCar');
const pointerCircle = document.getElementById('pointerCircle');

let painting = false;
let isEraser = false;
let currentCarIndex = 0;

let cars = JSON.parse(localStorage.getItem('cars')) || [];

// Skapa canvas-image för varje bil om inte redan
cars.forEach(c => { if(!c.canvasImage) c.canvasImage = null; });

// === Pensel / Suddgummi ===
penBtn.addEventListener('click', () => {
  isEraser = false;
  penBtn.classList.add('active');
  eraserBtn.classList.remove('active');
});
eraserBtn.addEventListener('click', () => {
  isEraser = true;
  eraserBtn.classList.add('active');
  penBtn.classList.remove('active');
});

// === Start / Stop ritning ===
canvas.addEventListener('mousedown', e => { painting = true; draw(e); });
canvas.addEventListener('mouseup', () => { painting = false; ctx.beginPath(); });
canvas.addEventListener('mouseout', () => { painting = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);

function draw(e){
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Update muspekare cirkel
  pointerCircle.style.width = brushSize.value*2 + 'px';
  pointerCircle.style.height = brushSize.value*2 + 'px';
  pointerCircle.style.left = e.clientX + 'px';
  pointerCircle.style.top = e.clientY + 'px';

  if(!painting) return;

  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isEraser ? '#fff' : colorPicker.value;
  ctx.globalAlpha = opacityRange.value;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

// Rensa canvas
clearCanvas.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
});

// === Garage / bilpreview ===
function renderCarPreview() {
  carPreview.innerHTML = '';
  if(cars.length === 0){
    carPreview.innerHTML = '<p>Inga bilar</p>';
    return;
  }
  const car = cars[currentCarIndex];
  const div = document.createElement('div');
  div.innerHTML = `<strong>${car.model}</strong> | År:${car.year} | Km:${car.km}`;
  div.style.cursor = 'pointer';
  div.addEventListener('click', () => loadCarCanvas(car));
  carPreview.appendChild(div);
}
renderCarPreview();

function loadCarCanvas(car){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(car.canvasImage){
    const img = new Image();
    img.onload = () => ctx.drawImage(img,0,0);
    img.src = car.canvasImage;
  } else {
    // Rita enkel default bil
    ctx.fillStyle = '#007bff';
    ctx.fillRect(100,200,200,50);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(130,255,20,0,Math.PI*2);
    ctx.arc(270,255,20,0,Math.PI*2);
    ctx.fill();
  }
}

// Scrolla mellan bilar
prevCarBtn.addEventListener('click', () => {
  if(cars.length===0) return;
  currentCarIndex = (currentCarIndex-1 + cars.length) % cars.length;
  renderCarPreview();
  loadCarCanvas(cars[currentCarIndex]);
});
nextCarBtn.addEventListener('click', () => {
  if(cars.length===0) return;
  currentCarIndex = (currentCarIndex+1) % cars.length;
  renderCarPreview();
  loadCarCanvas(cars[currentCarIndex]);
});

// Spara målning
saveCarBtn.addEventListener('click', () => {
  if(cars.length===0) return;
  const car = cars[currentCarIndex];
  car.canvasImage = canvas.toDataURL();
  localStorage.setItem('cars', JSON.stringify(cars));
  alert('Målning sparad!');
});
