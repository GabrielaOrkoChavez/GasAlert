(function(){
const slidesEl = document.getElementById('slides');
const slides = Array.from(document.querySelectorAll('.slide'));
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let index = 0;
const total = slides.length;
const delay = 6000;


function update(){
slidesEl.style.transform = `translateX(${ -index * 100 }%)`;
}
function next(){ index = (index + 1) % total; update(); }
function prev(){ index = (index - 1 + total) % total; update(); }


nextBtn.addEventListener('click', ()=>{ next(); });
prevBtn.addEventListener('click', ()=>{ prev(); });
setInterval(next, delay);
})();