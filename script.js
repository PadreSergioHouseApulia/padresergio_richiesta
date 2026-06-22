// --- FUNZIONE MAGICA: TEMA ORARIO ---
let temaAttuale = "";

function applicaTemaOrario() {
    const ora = new Date().getHours();
    const greetIt = document.getElementById('greeting-it');
    const greetEn = document.getElementById('greeting-en');
    let nuovoTema = "";
    
    if (ora >= 6 && ora < 12) {
        nuovoTema = "mattina";
    } else if (ora >= 12 && ora < 18) {
        nuovoTema = "pomeriggio";
    } else if (ora >= 18 && ora < 21) {
        nuovoTema = "tramonto";
    } else {
        nuovoTema = "notte";
    }

    if (temaAttuale !== nuovoTema) {
        temaAttuale = nuovoTema;
        document.body.classList.remove('theme-sunset', 'theme-night');
        
        if (nuovoTema === "mattina") {
            greetIt.innerHTML = "Buongiorno dalla Puglia";
            greetEn.innerHTML = "Good morning from Puglia";
        } else if (nuovoTema === "pomeriggio") {
            greetIt.innerHTML = "Buon pomeriggio dalla Puglia";
            greetEn.innerHTML = "Good afternoon from Puglia";
        } else if (nuovoTema === "tramonto") {
            greetIt.innerHTML = "Buonasera, il sole tramonta in Puglia...";
            greetEn.innerHTML = "Good evening, the sun sets in Puglia...";
            document.body.classList.add('theme-sunset');
        } else {
            greetIt.innerHTML = "Buonanotte dalla Puglia";
            greetEn.innerHTML = "Good night from Puglia";
            document.body.classList.add('theme-night');
        }
    }
}

// Applica IL TEMA ALL'ISTANTE senza aspettare le foto
applicaTemaOrario();

window.onload = () => {
    
    // 1. Rimuovi il Pre-loader e SBLOCCA LO SCROLL (Tempi bilanciati)
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('preloader-hidden');
        
        // MAGIA: Sblocca lo scroll della pagina togliendo la classe al body
        document.body.classList.remove('no-scroll');
        
        // Rimuovi dal DOM dopo la transizione (0.6s)
        setTimeout(() => { preloader.style.display = 'none'; }, 600);
    }, 1400); // Entra in azione dopo esattamente 1.4 secondi

    // 2. OROLOGIO INVISIBILE: Controlla se l'ora è cambiata ogni 60 secondi
    setInterval(applicaTemaOrario, 60000);

    const saved = localStorage.getItem('pref-lang');
    if (saved) {
        changeLang(saved);
    } else {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.toLowerCase().startsWith('it')) {
            changeLang('it');
        } else {
            changeLang('en');
        }
    }
};

// --- EFFETTO PARALLASSE HERO ---
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroSlideshow = document.querySelector('.hero-slideshow');
    const heroContent = document.querySelector('.hero-content');
    
    // Attiva il parallasse solo se siamo nella zona della copertina
    if(heroSlideshow && scrollY < window.innerHeight) {
        // Il background scorre più lentamente rispetto alla pagina (effetto profondità)
        heroSlideshow.style.transform = `translateY(${scrollY * 0.4}px)`;
        
        // Il testo scorre leggermente e sfuma
        heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
        heroContent.style.opacity = 1 - (scrollY / 400); 
    }
});

// --- FUNZIONI LINGUA E MENU ---
function changeLang(lang) {
    if (lang === 'en') {
        document.body.classList.add('lang-en');
        document.getElementById('btn-en').classList.add('active');
        document.getElementById('btn-it').classList.remove('active');
    } else {
        document.body.classList.remove('lang-en');
        document.getElementById('btn-it').classList.add('active');
        document.getElementById('btn-en').classList.remove('active');
    }
    localStorage.setItem('pref-lang', lang);
}

function toggleMenu() {
    if(window.innerWidth <= 768) {
        document.getElementById("menuNavigazione").classList.toggle("active");
    }
}

// --- FUNZIONI GALLERIA LIGHTBOX ---
let indiceFotoAttuale = 0;
const fotoGalleria = Array.from(document.querySelectorAll('.foto'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

fotoGalleria.forEach((foto, index) => {
    foto.addEventListener('click', function() {
        indiceFotoAttuale = index;
        mostraFoto(indiceFotoAttuale);
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
});

function chiudiLightbox() { lightbox.style.display = 'none'; document.body.style.overflow = 'auto'; }
function cambiaFoto(n) { indiceFotoAttuale += n; mostraFoto(indiceFotoAttuale); }
function mostraFoto(n) {
    if (n >= fotoGalleria.length) { indiceFotoAttuale = 0; }
    if (n < 0) { indiceFotoAttuale = fotoGalleria.length - 1; }
    lightboxImg.src = fotoGalleria[indiceFotoAttuale].src;
}

lightbox.addEventListener('click', e => { if (e.target === lightbox) chiudiLightbox(); });

document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowLeft') cambiaFoto(-1);
        if (e.key === 'ArrowRight') cambiaFoto(1);
        if (e.key === 'Escape') chiudiLightbox();
    }
});

let xInizio = 0;
lightbox.addEventListener('touchstart', e => xInizio = e.changedTouches[0].screenX, {passive: true});
lightbox.addEventListener('touchend', e => {
    let xFine = e.changedTouches[0].screenX;
    if (xFine < xInizio - 50) cambiaFoto(1);
    if (xFine > xInizio + 50) cambiaFoto(-1);
}, {passive: true});

// --- FUNZIONI RECENSIONI GOOGLE ---
function caricaRecensioniGoogle() {
    var dummyDiv = document.createElement('div');
    var service = new google.maps.places.PlacesService(dummyDiv);
    
    var request = {
        placeId: 'ChIJR0aif2u1RxMRyLy3NrDgSUE',
        fields: ['reviews']
    };

    service.getDetails(request, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && place.reviews) {
            var html = '';
            
            place.reviews.forEach(function(review) {
                if(review.rating >= 4) {
                    var stelle = '⭐'.repeat(review.rating);
                    var testoTroncato = review.text.length > 250 ? review.text.substring(0, 250) + "..." : review.text;
                    
                    html += '<div class="recensione-card">';
                    html += '<div class="stelle">' + stelle + '</div>';
                    html += '<div class="recensione-testo">"' + testoTroncato + '"</div>';
                    html += '<div class="recensione-autore"><img src="' + review.profile_photo_url + '" alt="Foto Profilo"> ' + review.author_name + '</div>';
                    html += '<div class="recensione-data">su Google</div>';
                    html += '</div>';
                }
            });
            
            if(html !== '') {
                document.getElementById('recensioni-dinamiche').innerHTML = html;
            } else {
                document.getElementById('recensioni-dinamiche').innerHTML = '<p>Non ci sono ancora recensioni recenti.</p>';
            }
        }
    });
}
window.addEventListener('load', caricaRecensioniGoogle);

// --- FUNZIONE PER LO SLIDER DELLE ESPERIENZE ---
function muoviSlider(frecciaCliccata, direzione) {
    const container = frecciaCliccata.closest('.slider-container');
    const track = container.querySelector('.slider-track');
    const numeroElementi = track.children.length;
    
    let indiceAttuale = parseInt(track.getAttribute('data-index') || '0');
    
    indiceAttuale += direzione;
    
    if (indiceAttuale < 0) { indiceAttuale = numeroElementi - 1; }
    if (indiceAttuale >= numeroElementi) { indiceAttuale = 0; }
    
    track.setAttribute('data-index', indiceAttuale);
    track.style.transform = `translateX(-${indiceAttuale * 100}%)`;
}

// --- AUTO-SCROLL SLIDER ESPERIENZE ---
let autoScrollIntervallo = setInterval(() => {
    const tracks = document.querySelectorAll('.slider-track');
    tracks.forEach(track => {
        if(track.children.length > 1) {
            let indiceAttuale = parseInt(track.getAttribute('data-index') || '0');
            indiceAttuale++;
            if (indiceAttuale >= track.children.length) { indiceAttuale = 0; }
            track.setAttribute('data-index', indiceAttuale);
            track.style.transform = `translateX(-${indiceAttuale * 100}%)`;
        }
    });
}, 4500); 

// --- SWIPE CON IL DITO PER I CELLULARI ---
let sliderStartX = 0;
document.querySelectorAll('.slider-container').forEach(container => {
    container.addEventListener('touchstart', e => {
        sliderStartX = e.changedTouches[0].screenX;
        clearInterval(autoScrollIntervallo);
    }, {passive: true});
    
    container.addEventListener('touchend', e => {
        let sliderEndX = e.changedTouches[0].screenX;
        let frecciaDx = container.querySelector('.slider-freccia.dx');
        let frecciaSx = container.querySelector('.slider-freccia.sx');
        
        if (sliderEndX < sliderStartX - 40 && frecciaDx) { muoviSlider(frecciaDx, 1); }
        if (sliderEndX > sliderStartX + 40 && frecciaSx) { muoviSlider(frecciaSx, -1); }
    }, {passive: true});
});