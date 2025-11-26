
if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => { 

        navigator.serviceWorker.register('./service-worker.js') 
            .then(reg => {
                console.log('Service Worker registrado con éxito:', reg);
            })
            .catch(error => {
                console.error('Fallo en el registro del Service Worker:', error);
            });
    });
}

// Funciones para escapar caracteres especiales de una cadena HTML (Seguridad XSS)
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[&<>"']/g, function(match) {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return match;
        }
    });
}

// --- Variables Globales ---
let currentIndex = 0;
let autoSlide;
let deferredPrompt; 

// --- Funciones de Utilidad (Alerta Temporal) ---

function alertMessage(message) {
    console.warn("Mensaje para el usuario:", message);
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => { tempDiv.style.opacity = 1; }, 10);
    
    setTimeout(() => {
        tempDiv.style.opacity = 0;
        setTimeout(() => { document.body.removeChild(tempDiv); }, 300);
    }, 3000);
}

// --- Carga de JSON y Datos ---

async function getNewsData() {
    // **TU JSON DE NOTICIAS COMPLETO Y FINALIZADO CON TODAS LAS NOTICIAS DE ATIZAPÁN**
    const newsJsonData = {
        "noticias_list": [
            {
              "id": "2e3c0d60-7a5d-4f1f-a0b2-7c3d4e5f6g7h", 
              "titulo": "Asesinan a Camilo Ochoa, 'El Alucín', en su domicilio en Temixco",
              "resumen": "El influencer Camilo Ochoa, conocido como 'El Alucín', fue asesinado a balazos en su domicilio de Temixco, Morelos. La Fiscalía estatal ha abierto una investigación. Ochoa, originario de Mazatlán, Sinaloa, había sido señalado en varios volantes por su presunta conexión con el Cártel de Sinaloa, específicamente con la facción de 'Los Chapitos'. Reportes recientes indican que la muerte del influencer, que era conocido por su contenido en redes sociales y por una entrevista reciente con la periodista Adela Micha, ha generado especulaciones sobre un ajuste de cuentas. La familia de la víctima no ha emitido una declaración oficial sobre lo ocurrido.",
              "imagen": "https://i.postimg.cc/zfJ0KVJ4/FB-IMG-1755480044118.jpg",
              "categoria": "policía", 
              "fecha": "2025-08-17",
              "ciudad": "Atizapán",
              "autor": "Javier Huerta Martinez",
              "destacada": false
            },
            {
              "id": "a9b8c7d6-e5f4-3g2h-1i0j-k9l8m7n6o5p4",
              "titulo": "Baches afectan casi el 80 % del Valle de México, según denunciantes",
              "resumen": "Denuncias ciudadanas, apoyadas por imágenes y videos, revelan que los baches se han convertido en un problema crítico y generalizado en el Valle de México, afectando aproximadamente el 80% de las vialidades. Municipios como Ecatepec y Nezahualcóyotl, así como diversas alcaldías de la Ciudad de México, reportan un aumento en la cantidad de hoyos en sus calles. Este deterioro vial no solo causa daños mecánicos a los vehículos, sino que también genera un gran descontento entre los habitantes. A pesar de los programas de bacheo y las aplicaciones de reporte, muchos residentes señalan que las reparaciones son insuficientes y de baja calidad, o que simplemente no se realizan a tiempo, dejando las calles en un estado deplorable.",
              "imagen": "https://i.postimg.cc/xdr6Ct7j/FB-IMG-1755466516879.jpg",
              "categoria": "infraestructura",
              "fecha": "2025-08-17",
              "ciudad": "Nacional",
              "autor": "Javier Huerta Martinez",
              "destacada": false
            },
            {
              "id": "1f2g3h4i-5j6k-7l8m-9n0o-p1q2r3s4t5u6",
              "titulo": "Familia de AMLO en el foco mediático tras rumores de mudanza presidencial",
              "resumen": "Versiones sin confirmar, que circulan principalmente en redes sociales, han desatado una ola de especulaciones sobre una supuesta mudanza de la familia del expresidente Andrés Manuel López Obrador. Los rumores han captado la atención mediática y han generado debates sobre la vida privada de la familia presidencial. Algunos informes sugieren que la familia podría estar planificando una mudanza al extranjero, posiblemente a España, lo que ha revivido discusiones sobre la seguridad y los movimientos del exmandatario y sus familiares. Hasta el momento, no se ha emitido ninguna declaración oficial que confirme o desmienta estos rumores.",
              "imagen": "https://i.postimg.cc/sX5dxMKq/f3eed-16-08-2025-bety-1.jpg",
              "categoria": "política",
              "fecha": "2025-08-17",
              "ciudad": "Nacional",
              "autor": "Javier Huerta Martinez",
              "destacada": true 
            },
            {
              "id": "c7d6e5f4-3g2h-1i0j-k9l8-m7n6o5p4q3r2",
              "titulo": "🚨 México se entere qué: Rescatan a 15 personas atrapadas en Teleférico de Torreón",
              "resumen": "Momentos de tensión se vivieron en Torreón, Coahuila, cuando una falla mecánica dejó varadas a 15 personas en las góndolas del teleférico de la ciudad. Elementos de Protección Civil y bomberos realizaron un impresionante operativo de rescate que duró varias horas. Todos los tripulantes fueron puestos a salvo sin lesiones graves, aunque algunos presentaron crisis nerviosa. El incidente ha desatado debate en redes sociales sobre la seguridad de este tipo de transportes turísticos en México.",
              "imagen": "https://i.postimg.cc/d08j8525/telefericotorreonsl-312b03dd-focus-0-0-1200-600.webp",
              "categoria": "sucesos",
              "fecha": "2025-08-17",
              "ciudad": "Nacional",
              "autor": "",
              "destacada": false
            },
            {
              "id": "b8c7d6e5-f4g3-h2i1-j0k9-l8m7n6o5p4q3",
              "titulo": "🔥 México se entere qué: Incendio arrasa mercado en Monterrey",
              "resumen": "Un fuerte incendio consumió gran parte de un mercado popular en Monterrey durante la madrugada. Testigos relataron que las llamas se propagaron con rapidez debido a materiales inflamables en los locales. Bomberos de varios municipios llegaron para sofocar el siniestro, que dejó pérdidas millonarias y al menos 40 locales afectados. Aunque no se reportaron víctimas mortales, el hecho ha encendido la indignación ciudadana ante la falta de medidas de prevención y control en mercados municipales.",
              "imagen": "https://i.postimg.cc/J4nx9c8h/incendio-consume-nueve-locales-en-un-mercado-de-monterrey-2496html-incendio-nljpg-8123html-f0dbfbc7.webp",
              "categoria": "sociedad",
              "fecha": "2025-08-17",
              "ciudad": "Nacional",
              "autor": "",
              "destacada": false
            },
            // --- NOTICIAS LOCALES DE ATIZAPÁN (Anteriores) ---
            {
                "id": "new-atizapan-001",
                "titulo": "Asaltan restaurante de comida rápida en Las Alamedas de Atizapán",
                "resumen": "Un grupo de tres sujetos armados irrumpió en el establecimiento de hamburguesas a las 9 PM. Se llevaron dinero de la caja y pertenencias de los clientes. La policía municipal inició una persecución.",
                "imagen": "https://placehold.co/1200x600/FF0000/FFFFFF?text=ATIZAPAN+ALARMA",
                "categoria": "atizapan", 
                "fecha": "2025-11-25",
                "ciudad": "Atizapán",
                "autor": "Redacción Policía",
                "destacada": true 
            },
            {
                "id": "as-seg-20251125", 
                "titulo": "Implementan nuevo rondín de vigilancia en Jardines de Atizapán",
                "resumen": "Vecinos y autoridades acuerdan establecer patrullajes nocturnos ante el aumento de robos a casa habitación. El operativo durará 90 días.",
                "imagen": "https://miblog.com/imagenes/patrullaje_jardines.jpg", 
                "categoria": "atizapan", 
                "fecha": "2025-11-25",
                "ciudad": "Atizapán",
                "autor": "Redacción Atizapán",
                "destacada": false 
            },
            // --- NOTICIAS LOCALES DE ATIZAPÁN (NUEVAS) ---
            {
                "id": "ati-seg-1201",
                "titulo": "Refuerzan vigilancia en la zona escolar de Lomas de Atizapán",
                "resumen": "La Dirección de Seguridad Pública implementó un operativo de reforzamiento en las inmediaciones de escuelas primarias y secundarias. La medida busca prevenir el robo a estudiantes y padres de familia en horas pico. Se han desplegado 10 elementos adicionales y 4 patrullas en los principales accesos viales.",
                "imagen": "https://placehold.co/1200x600/0033CC/FFFFFF?text=ATIZAPAN+ESCUELAS",
                "categoria": "atizapan",
                "fecha": "2025-11-25",
                "ciudad": "Atizapán",
                "autor": "Javier H. Martínez",
                "destacada": false
            },
            {
                "id": "ati-inf-1202",
                "titulo": "Vecinos de Las Alamedas exigen mantenimiento urgente al alumbrado público",
                "resumen": "El 60% de las luminarias en el Fraccionamiento Las Alamedas están reportadas como fuera de servicio, lo que ha elevado la preocupación por la seguridad nocturna. Habitantes exigen una respuesta inmediata del ayuntamiento para rehabilitar el servicio, señalando que la falta de luz es un foco de inseguridad y accidentes.",
                "imagen": "https://placehold.co/1200x600/808080/FFFFFF?text=LUMINARIAS+ALAMEDAS",
                "categoria": "atizapan",
                "fecha": "2025-11-24",
                "ciudad": "Atizapán",
                "autor": "Redacción Infraestructura",
                "destacada": true
            },
            {
                "id": "ati-soc-1203",
                "titulo": "Exitosa jornada de esterilización canina gratuita en la colonia México 86",
                "resumen": "El Centro de Control Canino y Bienestar Animal de Atizapán realizó una jornada masiva de esterilización y vacunación en la colonia México 86, atendiendo a más de 150 mascotas. La campaña busca fomentar la tenencia responsable y controlar la población de animales en situación de calle. Vecinos agradecen la iniciativa y piden que se extienda a otras zonas del municipio.",
                "imagen": "https://placehold.co/1200x600/00CC00/FFFFFF?text=ESTERILIZACIÓN+ATIZAPÁN",
                "categoria": "atizapan",
                "fecha": "2025-11-23",
                "ciudad": "Atizapán",
                "autor": "Colaborador Social",
                "destacada": false
            }
        ]
    };
    
    return newsJsonData.noticias_list || [];
}

// --- Renderizado de Listas y Carrusel (CÓDIGO SIN CAMBIOS) ---

function renderNews(newsList, containerId) {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;

    if (!newsList.length) {
        newsContainer.innerHTML = '<p class="no-news">No se encontraron noticias para esta sección.</p>';
        return;
    }

    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const isCarousel = containerId === 'carousel-inner';
        
        // URL de la Noticia Individual: crucial para cargar el artículo
        const newsUrl = `noticia.html?id=${news.id}`; 
        
        const articleContent = isCarousel ? `
            <a href="${newsUrl}" class="carousel-link">
                <img src="${news.imagen || 'https://via.placeholder.co/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                <div class="carousel-content">
                    <h3>${safeTitle}</h3>
                    <p>${escapeHtml(news.resumen).substring(0, 150)}...</p>
                    <div class="author-info">
                        <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                    </div>
                </div>
            </a>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
        ` : `
            <article>
                <a href="${newsUrl}">
                    <img src="${news.imagen || 'https://via.placeholder.co/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                    <h4>${safeTitle}</h4>
                    <p>${escapeHtml(news.resumen).substring(0, 100)}...</p>
                </a>
                <div class="author-info">
                    <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
            </article>
        `;

        const tag = isCarousel ? 'div' : 'span';
        const classNames = isCarousel ? 'carousel-item' : 'news-card'; 

        if (isCarousel) {
             newsContainer.innerHTML += `<${tag} class="${classNames}">${articleContent}</${tag}>`;
        } else {
             newsContainer.innerHTML += `<div class="${classNames}">${articleContent}</div>`;
        }
    });
}


// Función para filtrar noticias por categoría (p. ej., atizapan)
async function loadFilteredNews(category, containerId) {
    const noticias = await getNewsData();
    let filteredNews = noticias;

    if (category) {
        filteredNews = noticias.filter(n => n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
    }
    
    // Muestra solo las 6 primeras noticias
    renderNews(filteredNews.slice(0, 6), containerId);
}

// Función para cargar el carrusel filtrado por categoría
async function loadFilteredCarousel(category) {
    const noticias = await getNewsData();
    
    let destacadas = noticias;
    
    if (category) {
        // Primero intenta filtrar por destacada Y categoría
        destacadas = noticias.filter(n => n.destacada && n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
        
        // Si no hay destacadas específicas, usa cualquier noticia de esa categoría
        if (destacadas.length === 0) {
            destacadas = noticias.filter(n => n.categoria && n.categoria.toLowerCase() === category.toLowerCase());
        }
    } else {
        // index.html: usar todas las destacadas
        destacadas = noticias.filter(n => n.destacada);
    }
    
    // Si no encuentra destacadas, usa las 3 primeras noticias generales para evitar un carrusel vacío
    const lista = destacadas.length ? destacadas.slice(0, 3) : noticias.slice(0, 3);
    
    renderNews(lista, 'carousel-inner');

    const items = document.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        items[0].classList.add('active');
    }

    if (lista.length > 1) {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => moveCarousel(1), 5000);
    }
}


// --- Lógica de Artículo Individual (noticia.html) (CÓDIGO SIN CAMBIOS) ---

// Función para obtener un parámetro de la URL (ej. el ID)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

async function loadSingleArticle(id) {
    const noticias = await getNewsData();
    const article = noticias.find(n => n.id === id);
    const container = document.getElementById('news-article-container');
    const titleElement = document.querySelector('title');

    if (!container) return;

    if (!article) {
        container.innerHTML = '<h2>🚨 Error 404: Noticia No Encontrada</h2><p>Lo sentimos, el artículo solicitado no existe o fue eliminado.</p>';
        titleElement.textContent = 'Error 404 | México Se Enteré Qué';
        return;
    }

    // Formateo de Fecha
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    let displayDate = article.fecha ? new Date(article.fecha).toLocaleDateString('es-MX', dateOptions) : 'Fecha Desconocida';
    
    const safeTitle = escapeHtml(article.titulo);
    titleElement.textContent = safeTitle + ' | México Se Enteré Qué'; 

    container.innerHTML = `
        <h1>${safeTitle}</h1>
        <div class="article-meta">
            <span>📅 Publicado: ${displayDate}</span>
            <span>📍 Ciudad: ${escapeHtml(article.ciudad || 'No especificado')}</span>
            <span>✍️ Por: ${escapeHtml(article.autor || 'Redacción')}</span>
        </div>
        
        <img src="${article.imagen || 'https://via.placeholder.co/1200x600?text=Imagen+Principal'}" alt="${safeTitle}" class="article-image">
        
        <section class="article-body">
            <p>${escapeHtml(article.resumen)}</p>
        </section>

        <button class="share-btn large" onclick="shareArticle('${safeTitle}')">Compartir Artículo</button>
    `;
    
    // Cargar noticias relacionadas (3 de la misma categoría, excluyendo la actual)
    const relatedNews = noticias
        .filter(n => n.categoria === article.categoria && n.id !== article.id)
        .slice(0, 3);
        
    renderNews(relatedNews, 'related-news-container');
}


// --- Carrusel Control (CÓDIGO SIN CAMBIOS) ---
function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    if (items[currentIndex]) { items[currentIndex].classList.remove('active'); }

    currentIndex = (currentIndex + direction + items.length) % items.length;
    
    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    if (items[currentIndex]) { items[currentIndex].classList.add('active'); }
}
window.moveCarousel = moveCarousel;

// --- Búsqueda (CÓDIGO SIN CAMBIOS) ---
async function searchNews() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    
    const query = (searchInput.value || '').toLowerCase();
    const noticias = await getNewsData();
    
    const filteredNews = noticias
        .filter(n => (n.titulo || '').toLowerCase().includes(query) || (n.resumen || '').toLowerCase().includes(query));
    
    renderNews(filteredNews.slice(0, 6), 'news-container');
    alertMessage(`Resultados de búsqueda cargados para: ${escapeHtml(query)}`);
}
window.searchNews = searchNews;

// --- Compartir (CÓDIGO SIN CAMBIOS) ---
function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        // API nativa de compartir
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        // Fallback: Copiar enlace
        navigator.clipboard.writeText(url).then(() => {
            alertMessage(`Enlace copiado al portapapeles: ${url}`);
        }).catch(() => {
            alertMessage(`Copia este enlace para compartir: ${url}`);
        });
    }
}
window.shareArticle = shareArticle;

// --- Menú / Búsqueda (UI) (CÓDIGO SIN CAMBIOS) ---
function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const searchInputContainer = document.getElementById('search-input');

    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active'); 
        
        if (window.innerWidth < 768 && searchInputContainer) {
            searchInputContainer.classList.remove('active');
        }
    }
}
window.toggleMenu = toggleMenu;

function toggleSearch() {
    const searchInputContainer = document.getElementById('search-input');
    const navMenu = document.getElementById('nav-menu');

    if (searchInputContainer) {
        searchInputContainer.classList.toggle('active');
        if (navMenu) { navMenu.classList.remove('active'); }
        
        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}
window.toggleSearch = toggleSearch;

// --- Cookies y App Modal (PWA) (CÓDIGO CORREGIDO) ---

function openCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner && localStorage.getItem('cookies-consent') === null) {
        banner.style.display = 'block';
    }
}
window.openCookieBanner = openCookieBanner;

function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}

function isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.matchMedia('(display-mode: fullscreen)').matches || 
           window.matchMedia('(display-mode: minimal-ui)').matches;
}

function checkAppModalVisibility() {
    const appModal = document.getElementById('app-modal');
    if (!appModal) return;

    if (isPWAInstalled() || localStorage.getItem('hide-app-modal') === 'true') {
        appModal.style.display = 'none';
    } else {
        appModal.style.display = 'flex';
    }
}

function hideAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal) {
        appModal.style.display = 'none'; 
        localStorage.setItem('hide-app-modal', 'true'); // Ocultar permanentemente
    }
}
window.hideAppModal = hideAppModal;

// --- LÓGICA DE INSTALACIÓN PWA (Smart Banner) (CÓDIGO SIN CAMBIOS) ---

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

function installPWA(e) {
    e.preventDefault();
    
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                alertMessage('¡Gracias por instalar nuestra App!');
            } else {
                alertMessage('Instalación cancelada.');
            }
            deferredPrompt = null;
            hideAppModal(); 
        });
    } else {
        alertMessage('Tu navegador no soporta la instalación directa. Prueba usando el menú del navegador (ej. "Añadir a pantalla de inicio").');
    }
}
window.installPWA = installPWA; 

// --- Evento Principal (Unificado y Final) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Detección de la página actual
    const path = window.location.pathname;
    
    if (path.includes('noticia.html')) {
        // **LÓGICA PARA PÁGINA DE NOTICIA INDIVIDUAL**
        const articleId = getUrlParameter('id');
        if (articleId) {
            loadSingleArticle(articleId);
        } else {
            document.getElementById('news-article-container').innerHTML = '<h2>ID de noticia no proporcionado.</h2>';
        }
        
    } else {
        // **LÓGICA PARA PÁGINAS DE LISTADO (Index, Atizapán, etc.)**
        let categoryToFilter = null;
        
        // Mapea la URL a la categoría de noticias (usa minúsculas)
        if (path.includes('atizapan.html')) {
            categoryToFilter = 'atizapan';
        } else if (path.includes('tlalnepantla.html')) {
            categoryToFilter = 'tlalnepantla';
        } else if (path.includes('cuatitlan-izcalli.html')) {
            categoryToFilter = 'izcalli'; 
        } else if (path.includes('nicolas-romero.html')) {
            categoryToFilter = 'nicolas-romero'; 
        } else if (path.includes('naucalpan.html')) {
            categoryToFilter = 'naucalpan';
        }
        // Si es index.html, categoryToFilter es null y carga las destacadas/generales.

        loadFilteredNews(categoryToFilter, 'news-container');
        loadFilteredCarousel(categoryToFilter);
    }
    
    // 2. Lógica de PWA, Cookies, Búsqueda (Se ejecuta en todas las páginas)
    checkAppModalVisibility();

    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (!consent) {
        setTimeout(openCookieBanner, 1000); 
    }
    
    // Manejadores de eventos de cookies y búsqueda
    if (acceptBtn) {
        // *** LÍNEA CORREGIDA: Eliminamos hideAppModal() aquí ***
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
            // ¡Ya no se oculta el App Modal al aceptar cookies!
            alertMessage('Cookies aceptadas.');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'rejected');
            hideCookieBanner();
            alertMessage('Cookies rechazadas.');
        });
    }
    
    const searchButton = document.getElementById('search-button'); 
    if (searchButton) {
        searchButton.addEventListener('click', searchNews);
    }
});
