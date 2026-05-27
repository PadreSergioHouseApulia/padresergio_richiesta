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
    const ora = new Date().getHours();
    let salutoIT, salutoEN;
    
    if(ora >= 5 && ora < 13) { 
        salutoIT = "Buongiorno! ☀️"; salutoEN = "Good morning! ☀️"; 
    } else if(ora >= 13 && ora < 18) { 
        salutoIT = "Buon pomeriggio! ☕"; salutoEN = "Good afternoon! ☕"; 
    } else { 
        salutoIT = "Buonasera! 🌙"; salutoEN = "Good evening! 🌙"; 
    }
    
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