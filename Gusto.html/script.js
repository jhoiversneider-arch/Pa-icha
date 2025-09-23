// Script para el lienzo, paleta, audio y pequeñas interacciones
document.addEventListener('DOMContentLoaded', ()=> {
  // --- Paleta de colores ---
  const paletteColors = [
    "#ff3b30","#ff9500","#ffcc00","#34c759","#32d74b",
    "#0a84ff","#5856d6","#ff2d55","#ff9f1c","#ff7ab6",
    "#6ee7b7","#b28bff","#ffffff","#000000","#8b4513"
  ];
  const paletteEl = document.getElementById('palette');
  let currentColor = paletteColors[0];

  paletteColors.forEach(c=>{
    const btn = document.createElement('button');
    btn.style.background = c;
    btn.title = c;
    btn.addEventListener('click', ()=> {
      currentColor = c;
      Array.from(paletteEl.children).forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
    });
    paletteEl.appendChild(btn);
  });
  // marcar el primero
  paletteEl.children[0].classList.add('active');

  // --- Canvas para colorear ---
  const canvas = document.getElementById('drawCanvas');
  const ctx = canvas.getContext('2d', {willReadFrequently: false});
  // Ajustar tamaño para alta resolución
  function setCanvasSize(){
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(scale, scale);
    // fondo limpio
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,rect.width,rect.height);
  }
  // Inicialmente ajustar según atributos width/height (valores html) — forzar a escala responsive
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  // Because we set width/height in html, re-calc to be crisp
  setCanvasSize();
  window.addEventListener('resize', ()=> {
    // keep drawing cleared on resize for simplicity
    setCanvasSize();
  });

  let drawing=false;
  let lastX=0,lastY=0;
  const brushSizeInput = document.getElementById('brushSize');

  function getPos(e){
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : null;
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e){
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }
  function stopDraw(e){
    e && e.preventDefault();
    drawing = false;
  }
  function draw(e){
    if(!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSizeInput.value;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  // mouse
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  document.addEventListener('mouseup', stopDraw);
  // touch
  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', stopDraw);

  // botones clear / save
  document.getElementById('clearBtn').addEventListener('click', ()=> {
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,rect.width,rect.height);
  });
  document.getElementById('saveBtn').addEventListener('click', ()=> {
    // convertir a imagen y forzar descarga
    const link = document.createElement('a');
    link.download = 'mi-coloreado.png';
    // To export correct visible pixels, we create temp canvas scaled to display size
    const displayWidth = canvas.getBoundingClientRect().width;
    const displayHeight = canvas.getBoundingClientRect().height;
    // create a new canvas and draw scaled content
    const tmp = document.createElement('canvas');
    tmp.width = displayWidth;
    tmp.height = displayHeight;
    const tctx = tmp.getContext('2d');
    // draw current canvas content scaled down from internal resolution
    tctx.drawImage(canvas, 0, 0, displayWidth, displayHeight);
    link.href = tmp.toDataURL('image/png');
    link.click();
  });

  // --- Reproductor de audio (cargar local) ---
  const audioFileInput = document.getElementById('audioFile');
  const loadAudioBtn = document.getElementById('loadAudio');
  const player = document.getElementById('player');

  loadAudioBtn.addEventListener('click', ()=> {
    const file = audioFileInput.files[0];
    if(!file){
      alert('Selecciona un archivo de audio primero (MP3/OGG).');
      return;
    }
    const url = URL.createObjectURL(file);
    player.src = url;
    player.play().catch(()=>{/* ignora si autoplay falla */});
  });

  // --- Texto de dormir ---
  const sleepText = document.getElementById('sleepText');
  const applyTextBtn = document.getElementById('applyText');
  applyTextBtn.addEventListener('click', ()=> {
    const t = sleepText.value.trim();
    if(t.length === 0) {
      alert('Escribe algo sobre dormir y sueños para aplicar.');
      return;
    }
    // mostrar en footer temporalmente
    const old = document.querySelector('.topbar .subtitle');
    if(old) old.textContent = t;
    alert('Texto aplicado: ' + t);
  });

  // Seguridad: si el usuario no interactúa, el canvas queda listo para usar
  console.log('Interfaz lista — diviértete coloreando!');

});