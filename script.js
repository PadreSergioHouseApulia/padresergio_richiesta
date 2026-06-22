// --- LINK DEL TUO GOOGLE SCRIPT ---
const LINK_GOOGLE = "https://script.google.com/macros/s/AKfycbzQyMUZjs7HdGLPa_Cdv1HqDbRtjqecHT2uQyyIqRDYStUKwZL1Mrya7VicNDbvSRpC/exec";

// --- LOGICA CALENDARIO AIRBNB (FLATPICKR) ---
let calArrivo, calPartenza;
let dateOccupate = [];

async function caricaCalendario() {
    try {
        // Chiede al tuo Google Script tutte le date bloccate (Airbnb + Sito)
        const risposta = await fetch(LINK_GOOGLE + "?action=getOccupiedDates");
        const dateGrezze = await risposta.json();
        
        // TRADUZIONE: Trasforma i blocchi complessi in un formato che Flatpickr capisce (range di date)
        dateOccupate = [];
        if (dateGrezze && !dateGrezze[0]?.error) {
            dateGrezze.forEach(blocco => {
                if (blocco.from && blocco.to) {
                    dateOccupate.push({
                        from: blocco.from,
                        to: blocco.to
                    });
                }
            });
        }
    } catch (e) {
        console.error("Errore caricamento calendario", e);
    }
    inizializzaFlatpickr();
}

function inizializzaFlatpickr() {
    const configArrivo = {
        locale: "it",
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: dateOccupate,
        onChange: function(selectedDates, dateStr, instance) {
            // Quando scelgo l'arrivo, la partenza deve essere come minimo il giorno dopo
            let minCheckout = new Date(selectedDates[0]);
            minCheckout.setDate(minCheckout.getDate() + 1);
            calPartenza.set("minDate", minCheckout);
        }
    };

    const configPartenza = {
        locale: "it",
        minDate: new Date().fp_incr(1), // Domani
        dateFormat: "Y-m-d",
        disable: dateOccupate
    };

    calArrivo = flatpickr("#arrivo", configArrivo);
    calPartenza = flatpickr("#partenza", configPartenza);
}

// --- DIZIONARIO TRADUZIONI ---
const traduzioni = {
    it: {
        placeholder: "Es. Viaggiamo con un cagnolino...",
        opt1: "1 Ospite", opt2: "2 Ospiti", opt3: "3 Ospiti", opt4: "4 Ospiti", opt5: "5 o più Ospiti",
        successTitle: "Richiesta Inviata! ✈️",
        successDesc: "Grazie per averci contattato. Ti risponderemo al più presto con la disponibilità e le tariffe.",
        errore: "Errore di connessione. Riprova.",
        titoloType: "Richiedi Disponibilità"
    },
    en: {
        placeholder: "E.g. We are traveling with a small dog...",
        opt1: "1 Guest", opt2: "2 Guests", opt3: "3 Guests", opt4: "4 Guests", opt5: "5 or more Guests",
        successTitle: "Request Sent! ✈️",
        successDesc: "Thank you for contacting us. We will reply as soon as possible with availability and rates.",
        errore: "Connection error. Please try again.",
        titoloType: "Request Availability"
    }
};

let linguaAttuale = 'it';
let typeInterval; 

// --- FUNZIONE MACCHINA DA SCRIVERE ---
function avviaTypewriter(lang) {
    clearInterval(typeInterval);
    const textToType = traduzioni[lang].titoloType;
    const container = document.getElementById('typewriter-text');
    container.innerHTML = "";
    let i = 0;
    
    typeInterval = setInterval(() => {
        if (i < textToType.length) {
            container.innerHTML += textToType.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval); 
        }
    }, 70); 
}

// --- SALUTO INTELLIGENTE IN BASE ALL'ORARIO ---
function impostaSalutoIntelligente() {
    const ora =  new Date().getHours();
    let salutoIT, salutoEN;
    
    // 1. Prepariamo le icone SVG (Sole, Caffè, Luna) assegnando a ognuna un colore specifico
    const svgSole = `<svg class="icona-servizio" width="20px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#ffe62e"> <path d="M20.5 59.7l7-7.2c-2.5-.5-4.8-1.5-6.9-2.9l-.1 10.1"> </path> <path d="M43.5 4.3l-7 7.2c2.5.5 4.8 1.5 6.9 2.9l.1-10.1"> </path> <path d="M4.3 43.5l10.1-.1C13 41.3 12 39 11.5 36.5l-7.2 7"> </path> <path d="M59.7 20.5l-10.1.1c1.3 2.1 2.3 4.4 2.9 6.9l7.2-7"> </path> <path d="M4.3 20.5l7.2 7c.5-2.5 1.5-4.8 2.9-6.9l-10.1-.1"> </path> <path d="M59.7 43.5l-7.2-7c-.5 2.5-1.5 4.8-2.9 6.9l10.1.1"> </path> <path d="M20.5 4.3l.1 10.1c2.1-1.3 4.4-2.3 6.9-2.9l-7-7.2"> </path> <path d="M43.5 59.7l-.1-10.1C41.3 51 39 52 36.5 52.5l7 7.2"> </path> </g> <g fill="#ffce31"> <path d="M14.8 44l-4 9.3l9.3-4C18 47.8 16.2 46 14.8 44"> </path> <path d="M49.2 20l4-9.3l-9.2 4c2 1.5 3.8 3.3 5.2 5.3"> </path> <path d="M11.4 28.3L2 32l9.4 3.7c-.3-1.2-.4-2.4-.4-3.7s.1-2.5.4-3.7"> </path> <path d="M52.6 35.7L62 32l-9.4-3.7c.2 1.2.4 2.5.4 3.7c0 1.3-.1 2.5-.4 3.7"> </path> <path d="M20 14.8l-9.3-4l4 9.3c1.5-2.1 3.3-3.9 5.3-5.3"> </path> <path d="M44 49.2l9.3 4l-4-9.3C47.8 46 46 47.8 44 49.2"> </path> <path d="M35.7 11.4L32 2l-3.7 9.4c1.2-.2 2.5-.4 3.7-.4s2.5.1 3.7.4"> </path> <path d="M28.3 52.6L32 62l3.7-9.4c-1.2.3-2.4.4-3.7.4s-2.5-.1-3.7-.4"> </path> <circle cx="32" cy="32" r="19"> </circle> </g> </g></svg>`;
    
    const svgCaffe = `<svg width="20px" height="20px" viewBox="0 0 47.5 47.5" id="svg2" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" fill="#000000" stroke="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs id="defs6"> <clipPath clipPathUnits="userSpaceOnUse" id="clipPath16"> <path d="M 0,38 38,38 38,0 0,0 0,38 Z" id="path18"></path> </clipPath> <clipPath clipPathUnits="userSpaceOnUse" id="clipPath40"> <path d="M 0,38 38,38 38,0 0,0 0,38 Z" id="path42"></path> </clipPath> </defs> <g id="g10" transform="matrix(1.25,0,0,-1.25,0,47.5)"> <g id="g12"> <g clip-path="url(#clipPath16)" id="g14"> <g id="g20" transform="translate(37,11)"> <path d="m 0,0 c 0,-5.522 -8.059,-10 -18,-10 -9.941,0 -18,4.478 -18,10 0,5.522 8.059,10 18,10 C -8.059,10 0,5.522 0,0" id="path22" style="fill:#99aab5;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> <g id="g24" transform="translate(37,13)"> <path d="m 0,0 c 0,-5.522 -8.059,-10 -18,-10 -9.941,0 -18,4.478 -18,10 0,5.522 8.059,10 18,10 C -8.059,10 0,5.522 0,0" id="path26" style="fill:#ccd6dd;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> <g id="g28" transform="translate(19,6)"> <path d="m 0,0 c -14.958,0 -17,15 -17,19 l 34,0 C 17,17 15.042,0 0,0" id="path30" style="fill:#f5f8fa;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> <g id="g32" transform="translate(32.8818,30.0483)"> <path d="M 0,0 C -1.357,0.938 -3.103,1.694 -5.121,2.25 -3.246,2.826 -0.57,2.559 0,0 M 2.503,-2.692 C 4.945,7.43 -7.278,5.014 -9.701,3.106 c -1.34,0.149 -2.736,0.234 -4.181,0.234 -9.389,0 -17,-3.228 -17,-8.444 0,-5.216 7.611,-9.444 17,-9.444 9.389,0 17,4.228 17,9.444 0,0.862 -0.225,1.664 -0.615,2.412" id="path34" style="fill:#ccd6dd;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> </g> </g> <g id="g36"> <g clip-path="url(#clipPath40)" id="g38"> <g id="g44" transform="translate(34,24)"> <path d="m 0,0 c 0,-3.866 -6.716,-7 -15,-7 -8.284,0 -15,3.134 -15,7 0,3.866 6.716,7 15,7 C -6.716,7 0,3.866 0,0" id="path46" style="fill:#8a4b38;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> <g id="g48" transform="translate(21,20)"> <path d="m 0,0 c -0.256,0 -0.512,0.098 -0.707,0.293 -2.337,2.337 -2.376,4.885 -0.125,8.262 0.739,1.109 0.9,2.245 0.478,3.377 -0.461,1.235 -1.438,1.996 -1.731,2.076 -0.553,0 -0.958,0.444 -0.958,0.996 C -3.043,15.557 -2.552,16 -2,16 -1.003,16 0.395,14.847 1.183,13.375 2.217,11.442 2.093,9.336 0.832,7.445 -1.129,4.503 -0.699,3.113 0.707,1.707 1.098,1.316 1.098,0.684 0.707,0.293 0.512,0.098 0.256,0 0,0" id="path50" style="fill:#d99e82;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> <g id="g52" transform="translate(15,22)"> <path d="m 0,0 c -0.256,0 -0.512,0.098 -0.707,0.293 -2.337,2.337 -2.376,4.885 -0.125,8.262 0.727,1.091 0.894,2.082 0.494,2.947 -0.444,0.961 -1.431,1.469 -1.684,1.499 -0.552,0 -0.989,0.447 -0.989,0.999 0,0.553 0.459,1 1.011,1 0.997,0 2.584,-0.974 3.36,-2.423 C 1.841,11.678 2.413,9.816 0.832,7.445 -1.129,4.503 -0.699,3.113 0.707,1.707 1.098,1.316 1.098,0.684 0.707,0.293 0.512,0.098 0.256,0 0,0" id="path54" style="fill:#d99e82;fill-opacity:1;fill-rule:nonzero;stroke:none"></path> </g> </g> </g> </g> </g></svg>`;
    
    const svgLuna = `<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet" fill="#000000" stroke="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#FFD983" d="M30.312.776C32 19 20 32 .776 30.312c8.199 7.717 21.091 7.588 29.107-.429C37.9 21.867 38.03 8.975 30.312.776z"></path><path d="M30.705 15.915a1.163 1.163 0 1 0 1.643 1.641a1.163 1.163 0 0 0-1.643-1.641zm-16.022 14.38a1.74 1.74 0 0 0 0 2.465a1.742 1.742 0 1 0 0-2.465zm13.968-2.147a2.904 2.904 0 0 1-4.108 0a2.902 2.902 0 0 1 0-4.107a2.902 2.902 0 0 1 4.108 0a2.902 2.902 0 0 1 0 4.107z" fill="#FFCC4D"></path></g></svg>`;

    // 2. Componiamo il saluto unendo il testo all'icona giusta
    if(ora >= 5 && ora < 13) { 
        salutoIT = "Buongiorno! " + svgSole; 
        salutoEN = "Good morning! " + svgSole; 
    } else if(ora >= 13 && ora < 18) { 
        salutoIT = "Buon pomeriggio! " + svgCaffe; 
        salutoEN = "Good afternoon! " + svgCaffe; 
    } else { 
        salutoIT = "Buonasera! " + svgLuna; 
        salutoEN = "Good evening! " + svgLuna; 
    }
    
    // 3. Stampiamo tutto a schermo
    document.getElementById('smartGreeting').innerHTML = `<span lang="it">${salutoIT} Pronti per la Puglia?</span><span lang="en">${salutoEN} Ready for Puglia?</span>`;
}

// --- LOGICA BUBBLE WHATSAPP ---
function mostraBubble() {
    setTimeout(() => {
        const bubble = document.getElementById('wa-bubble');
        bubble.style.display = 'block';
        setTimeout(() => bubble.style.opacity = '1', 50); 
    }, 5000); 
}

function chiudiBubble() {
    const bubble = document.getElementById('wa-bubble');
    bubble.style.opacity = '0';
    setTimeout(() => bubble.style.display = 'none', 500); 
}

// --- FUNZIONE CAMBIO LINGUA ---
function changeLang(lang) {
    linguaAttuale = lang;
    if (lang === 'en') {
        document.body.classList.add('lang-en');
        document.getElementById('btn-en').classList.add('active');
        document.getElementById('btn-it').classList.remove('active');
    } else {
        document.body.classList.remove('lang-en');
        document.getElementById('btn-it').classList.add('active');
        document.getElementById('btn-en').classList.remove('active');
    }
    
    document.getElementById('note').placeholder = traduzioni[lang].placeholder;
    document.getElementById('opt1').innerText = traduzioni[lang].opt1;
    document.getElementById('opt2').innerText = traduzioni[lang].opt2;
    document.getElementById('opt3').innerText = traduzioni[lang].opt3;
    document.getElementById('opt4').innerText = traduzioni[lang].opt4;
    document.getElementById('opt5').innerText = traduzioni[lang].opt5;

    localStorage.setItem('pref-lang-form', lang);
    avviaTypewriter(lang);
}

window.onload = () => {
    impostaSalutoIntelligente(); 
    mostraBubble(); 
    
    // Carica subito il calendario con le date di Airbnb!
    caricaCalendario();

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

window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('pref-lang-form') || 'it';
    changeLang(savedLang);
});

// --- FUNZIONE INVIO DATI A GOOGLE ---
function inviaRichiesta() {
    const form = document.getElementById('richiestaForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    document.getElementById('btnInvia').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    const payload = {
        action: "nuovaRichiesta",
        nome: document.getElementById('nome').value,
        cognome: document.getElementById('cognome').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        arrivo: document.getElementById('arrivo').value,
        partenza: document.getElementById('partenza').value,
        ospiti: document.getElementById('ospiti').value,
        note: document.getElementById('note').value
    };

    fetch(LINK_GOOGLE, { method: "POST", body: JSON.stringify(payload) })
    .then(() => {
        document.getElementById('form-container').innerHTML = `
            <h2 style="color:#5e7153; text-align:center; margin-top:20px;">${traduzioni[linguaAttuale].successTitle}</h2>
            <p style="text-align:center; color:#666; line-height: 1.5;">${traduzioni[linguaAttuale].successDesc}</p>
        `;
    })
    .catch(() => {
        alert(traduzioni[linguaAttuale].errore);
        document.getElementById('btnInvia').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    });
}