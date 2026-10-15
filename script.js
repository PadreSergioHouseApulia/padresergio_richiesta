// --- LINK DEL TUO GOOGLE SCRIPT ---
const LINK_GOOGLE = "https://script.google.com/macros/s/AKfycbzQyMUZjs7HdGLPa_Cdv1HqDbRtjqecHT2uQyyIqRDYStUKwZL1Mrya7VicNDbvSRpC/exec";

// --- VARIABILE GLOBALE PLUGIN TELEFONO ---
let itiPlugin;

// --- LOGICA CALENDARIO AIRBNB (FLATPICKR) ---
let calArrivo, calPartenza;
let dateOccupate = [];

async function caricaCalendario() {
    try {
        const risposta = await fetch(LINK_GOOGLE + "?action=getOccupiedDates");
        const dateGrezze = await risposta.json();
        
        dateOccupate = [];
        if (dateGrezze && !dateGrezze[0]?.error) {
            dateGrezze.forEach(blocco => {
                if (blocco.from && blocco.to) {
                    dateOccupate.push({ from: blocco.from, to: blocco.to });
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
        locale: "it", minDate: "today", dateFormat: "Y-m-d", disable: dateOccupate,
        onChange: function(selectedDates, dateStr, instance) {
            let minCheckout = new Date(selectedDates[0]);
            minCheckout.setDate(minCheckout.getDate() + 1);
            calPartenza.set("minDate", minCheckout);
        }
    };
    const configPartenza = {
        locale: "it", minDate: new Date().fp_incr(1), dateFormat: "Y-m-d", disable: dateOccupate
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
    
    const svgSole = `<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 5px;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const svgCaffe = `<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 5px;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
    const svgLuna = `<svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-left: 5px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    if(ora >= 5 && ora < 13) { 
        salutoIT = "Buongiorno! " + svgSole; salutoEN = "Good morning! " + svgSole; 
    } else if(ora >= 13 && ora < 18) { 
        salutoIT = "Buon pomeriggio! " + svgCaffe; salutoEN = "Good afternoon! " + svgCaffe; 
    } else { 
        salutoIT = "Buonasera! " + svgLuna; salutoEN = "Good evening! " + svgLuna; 
    }
    
    document.getElementById('smartGreeting').innerHTML = `<span lang="it">${salutoIT}</span><span lang="en">${salutoEN}</span>`;
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

// BOOTSTRAP
window.onload = () => {
    impostaSalutoIntelligente(); 
    mostraBubble(); 
    caricaCalendario();

    // Inizializza il plugin del telefono
    const inputTel = document.querySelector("#telefono");
    itiPlugin = window.intlTelInput(inputTel, {
        initialCountry: "it",
        preferredCountries: ["it", "gb", "us", "fr", "de", "es"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"
    });
};

// --- FUNZIONE INVIO DATI A GOOGLE ---
function inviaRichiesta() {
    const form = document.getElementById('richiestaForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    if (document.getElementById('telefono').value.trim() !== "" && !itiPlugin.isValidNumber()) {
        alert(linguaAttuale === 'it' ? "⚠️ Inserisci un numero di telefono valido per il Paese selezionato." : "⚠️ Please enter a valid phone number for the selected country.");
        return;
    }

    document.getElementById('btnInvia').style.display = 'none';
    document.getElementById('loading').style.display = 'block';

    const payload = {
        action: "nuovaRichiesta",
        nome: document.getElementById('nome').value,
        cognome: document.getElementById('cognome').value,
        email: document.getElementById('email').value,
        telefono: itiPlugin.getNumber(),
        arrivo: document.getElementById('arrivo').value,
        partenza: document.getElementById('partenza').value,
        ospiti: document.getElementById('ospiti').value,
        note: document.getElementById('note').value
    };

    fetch(LINK_GOOGLE, { method: "POST", body: JSON.stringify(payload) })
    .then(() => {
        document.getElementById('form-container').innerHTML = `
            <h2 style="color:var(--gold-primary); text-align:center; margin-top:20px; font-family:var(--font-heading);">${traduzioni[linguaAttuale].successTitle}</h2>
            <p style="text-align:center; color:var(--text-muted); line-height: 1.6;">${traduzioni[linguaAttuale].successDesc}</p>
        `;
    })
    .catch(() => {
        alert(traduzioni[linguaAttuale].errore);
        document.getElementById('btnInvia').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('pref-lang-form');
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
});