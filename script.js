document.addEventListener('DOMContentLoaded', function() {
    // SEZIONE DROPDOWN SEL LINGUA E TRADUZ
    const locales = ["en-GB", "de-DE", "es-ES", "fr-FR", "it-IT"];
    const translationsURL = "https://raw.githubusercontent.com/SimGHB91/VENICE_CHAT_Heritage/refs/heads/main/translations.json";

    // Funzione per ottenere la bandiera
    function getFlagSrc(countryCode) {
        return `https://flagsapi.com/${countryCode}/shiny/64.png`;
    }

    // Elementi
    const dropdown = document.querySelector('.dropdown');
    const dropdownBtn = document.getElementById('dropdown-btn');
    const dropdownContent = document.getElementById('dropdown-content');

    // Caricamento traduzioni
    async function loadTranslations(lang) {
        try {
            const response = await fetch(translationsURL);
            if (!response.ok) throw new Error("Errore nel caricamento del file JSON");

            const translations = await response.json();
            document.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });
        } catch (error) {
            console.error("Errore nel caricamento delle traduzioni:", error);
        }
    }

    // Selezione lingua
    function setSelectedLocale(locale) {
        const intlLocale = new Intl.Locale(locale);
        const langName = new Intl.DisplayNames([locale], {
            type: "language"
        }).of(intlLocale.language);

        dropdownContent.innerHTML = "";

        locales.filter(l => l !== locale).forEach(otherLocale => {
            const otherIntlLocale = new Intl.Locale(otherLocale);
            const otherLangName = new Intl.DisplayNames([otherLocale], {
                type: "language"
            }).of(otherIntlLocale.language);

            const li = document.createElement("li");
            li.innerHTML = `<img src="${getFlagSrc(otherIntlLocale.region)}"> ${otherLangName}`;
            li.addEventListener("click", () => {
                setSelectedLocale(otherLocale);
                loadTranslations(otherIntlLocale.language);
                localStorage.setItem("selectedLang", otherIntlLocale.language);
                dropdownContent.classList.remove('show');
            });

            dropdownContent.appendChild(li);
        });

        dropdownBtn.innerHTML = `<img src="${getFlagSrc(intlLocale.region)}"> ${langName} <span class="arrow-down"></span>`;
        loadTranslations(intlLocale.language);
    }

    // Mostra/Nascondi menu al click
    dropdownBtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    // Chiudi il menu se clicco fuori
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdownContent.classList.remove('show');
        }
    });

    // Carica la lingua salvata o predefinita
    const sessionLang = sessionStorage.getItem("selectedLang"); // Lingua salvata nella sessione
    const initialLocale = sessionLang ?
        locales.find(l => l.startsWith(sessionLang)) || "it-IT" :
        "it-IT";
    sessionStorage.setItem("selectedLang", initialLocale); // Salva la lingua per la sessione corrente
    setSelectedLocale(initialLocale);

    // SEZIONE MAPPA CAROSELLI
    // Inizializza la mappa centrata su Venezia 
    var map = L.map('map').setView([45.442323, 12.330866], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 14
    }).addTo(map);

    // Carica il file GeoJSON dal link RAW di GitHub
    fetch('https://raw.githubusercontent.com/SimGHB91/VENICE_CHAT_Heritage/refs/heads/main/Tracciato_openroute_Sestiere_Cannaregio.geojson')
        .then(response => response.json())
        .then(data => {
            // Aggiungi il GeoJSON alla mappa con lo stile estratto dalle proprietà del GeoJSON
            var geojsonLayer = L.geoJSON(data, {
                style: function(feature) {
                    return feature.properties && feature.properties.style;
                }
            }).addTo(map);

            // Zoom sulla geometria del GeoJSON
            map.fitBounds(geojsonLayer.getBounds());
        })
        .catch(error => console.error('Errore durante il caricamento del GeoJSON:', error));

    /////////////////////////////////// LIMITI VISIVI MAPPA ///////////////////////////////////////////  12.339191, 45.446659
    var southWest = L.latLng(45.439809, 12.324686),
        northEast = L.latLng(45.446659, 12.339191);
    var bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);

    ///////////// definizione del marker colorato di rosso ////////////////////////////////////
    var selectedIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    //////////////////////////////////////// DEFINISCO L'ICONE DEI MARKER /////////////////////////////////////////////////
    var defaultIcon = new L.Icon.Default();
    // Variabile per tenere traccia dell'ultimo marker cliccato
    var lastClickedMarker = null;
    // Funzione per gestire il click su un marker
    function handleMarkerClick(marker, index) {
        if (lastClickedMarker && lastClickedMarker !== marker) { // Ripristina l'icona dell'ultimo marker cliccato, se diverso dal marker attuale
            lastClickedMarker.setIcon(defaultIcon); // Cambia l'icona del marker precedente a defaultIcon
        }
        marker.setIcon(selectedIcon); // Cambia l'icona del marker cliccato a selectedIcon
        lastClickedMarker = marker; // Aggiorna l'ultimo marker cliccato
        scrollToItem(index); // Scroll alla slide corrispondente
    }

    //////////////////////////////////////////////////////// POSIZIONE FISICA MARCATORI /////////////////////////////////////////////////////////////////////////////
    var markers = []; // Array per tenere traccia di tutti i marker

    markers.push(L.marker([45.446023, 12.326116], {
        icon: selectedIcon
    }).addTo(map));
    //markers[0].bindPopup("A");
    markers[0].on('click', function() {
        handleMarkerClick(markers[0], 1);
        // Percorso corretto del file audio (assicurati che sia accessibile dal browser)
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.445865, 12.333028], {
        icon: defaultIcon
    }).addTo(map));
    //markers[1].bindPopup("B");
    markers[1].on('click', function() {
        handleMarkerClick(markers[1], 2);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.445261, 12.332352], {
        icon: defaultIcon
    }).addTo(map));
    markers[2].on('click', function() {
        handleMarkerClick(markers[2], 3);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.444047, 12.332827], {
        icon: defaultIcon
    }).addTo(map));
    markers[3].on('click', function() {
        handleMarkerClick(markers[3], 4);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.44307204806022, 12.331236004829409], {
        icon: defaultIcon
    }).addTo(map));
    markers[4].on('click', function() {
        handleMarkerClick(markers[4], 5);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.441314, 12.332851], {
        icon: defaultIcon
    }).addTo(map));
    markers[5].on('click', function() {
        handleMarkerClick(markers[5], 6);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.440539, 12.334621], {
        icon: defaultIcon
    }).addTo(map));
    markers[6].on('click', function() {
        handleMarkerClick(markers[6], 7);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    markers.push(L.marker([45.440403, 12.338186], {
        icon: defaultIcon
    }).addTo(map));
    markers[7].on('click', function() {
        handleMarkerClick(markers[7], 8);
        let audio = new Audio(''); // Percorso relativo alla cartella del progetto
        audio.play();
    });

    window.addEventListener('load', function() {
        lastClickedMarker = markers[0]; // Imposta marker 1 come selezionato
        markers[0].setIcon(selectedIcon); // Cambia l'icona del marker 1
        $('#slide-1').addClass('active'); // Imposta slide-1 come attiva, rimuovendo l'effetto maschera
    });

    ///////////////////////////////// GESTIONE GENERALE ANIMAZIONE DI SCORRIMENTO ///////////////////////////////////////////////////
    function clickMarker(markerIndex) {
        var newMarkerIndex = (markerIndex + markers.length) % markers.length;
        var marker = markers[newMarkerIndex];
        if (lastClickedMarker && lastClickedMarker !== marker) {
            lastClickedMarker.setIcon(defaultIcon);
        }
        if (marker) {
            marker.setIcon(selectedIcon);
            marker.fire('click');
            lastClickedMarker = marker;
        } else {
            console.error('Marker non trovato.');
        }
    }

    function addSlideClickEvent(slideNumber, markerIndex) {
        var slide = document.getElementById('slide-' + slideNumber);
        if (slide) {
            slide.addEventListener('click', function() {
                clickMarker(markerIndex);
            });
        } else {
            console.error('Elemento con id "slide-' + slideNumber + '" non trovato.');
        }
    }
    /// non toccare questi cicli for //////
    for (let i = 1; i <= markers.length; i++) {
        addSlideClickEvent(i, i - 1);
    }
    for (let i = 0; i < markers.length; i++) {
        addSlideClickEvent(i + 1, i);
    }

    //////////////////////////////// DA MARKER CLICCATO AVVIENE SCROLL AUTOMATICO SU CAROSELLI /////////////////////////////////////////////////////////////
    function scrollToCaroselli() {
        const caroselliElement = document.getElementById('caroselli');
        const mapElement = document.getElementById('map');

        if (caroselliElement && mapElement) {
            const mapTop = mapElement.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: mapTop,
                behavior: 'smooth'
            });
        }
    }

    function handleMarkerClick(marker, index) {
        if (lastClickedMarker && lastClickedMarker !== marker) {
            lastClickedMarker.setIcon(defaultIcon);
        }
        marker.setIcon(selectedIcon);
        lastClickedMarker = marker;
        scrollToItem(index); // Scroll alla slide corrispondente
        scrollToCaroselli(); // Scroll al carosello
    }

    ////////////////////////////////// CLICCO IL MARKER ED AVVIENE CLICK AUTOMATICO SU RELATIVA SLIDE ///////////////////////////////////////////
    ////////////////////////////////// E LA SLIDE CENTRALE VIENE ILLUMINATA //////////////////////////////////
    function scrollToItem(slideNumber) {
        $('.slide-btn').removeClass('active'); // Rimuove 'active' da tutte le slide
        $('#slide-' + slideNumber).addClass('active'); // Aggiunge 'active' solo alla slide selezionata
        $('#slide-' + slideNumber)[0].click(); // Simula il click sulla slide attiva
    }

    /////// FUNZIONE INVERSA: CLICK SU SLIDE CAROSELLO E CLICK AUTMATICO SU MARKER MAPPA //////////////////////////////////////
    function clickMarker(markerIndex) {
        var newMarkerIndex = (markerIndex + markers.length) % markers.length;
        var marker = markers[newMarkerIndex];

        if (lastClickedMarker === marker) return;

        if (lastClickedMarker && lastClickedMarker !== marker) {
            lastClickedMarker.setIcon(defaultIcon);
        }

        marker.setIcon(selectedIcon);
        lastClickedMarker = marker;

        // Rimuove attivamente la classe 'active' con un effetto graduale
        $('.slide-btn').each(function() {
            $(this).removeClass('active');
        });

        // Dopo un breve ritardo, aggiungi 'active' solo alla slide selezionata
        setTimeout(function() {
            $('#slide-' + (markerIndex + 1)).addClass('active');
        }, 1); // Aggiusta il ritardo per rendere il passaggio più fluido
    }
    // Associa ogni slide al rispettivo marker
    for (let i = 0; i < markers.length; i++) {
        addSlideClickEvent(i + 1, i); // Associa le slide ai marker
    }

    // Configura lo slider per immagini
    $('.slider-for').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        asNavFor: '.slider-nav',
        speed: 300 // Imposta una velocità di transizione più veloce
    });

    // Configura lo slider per miniature
    $('.slider-nav').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.slider-for',
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true,
        speed: 300, // Riduci la velocità di scorrimento
        responsive: [{
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 1023,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    }).on('afterChange', function(event, slick, currentSlide) {
        // Chiama la funzione ottimizzata clickMarker
        clickMarker(currentSlide);
    });
});