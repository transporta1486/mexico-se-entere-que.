// =================================================================
// IMPORTS DE FIREBASE (Necesitas estas etiquetas en tu index.html)
// <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>
// =================================================================

// =================================================================
// DECLARACIONES GLOBALES
// =================================================================
let currentIndex = 0;
let autoSlide;
let deferredPrompt; 
let newsData = []; // Caché local para la búsqueda

// =================================================================
// 1. CONFIGURACIÓN DE FIREBASE E INICIALIZACIÓN
// =================================================================

// Credenciales copiadas de la Consola de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBPbCmeaCd6sYJoO_9JqEWzWievDw_fFwc", 
    authDomain: "noticiaspwa-58270.firebaseapp.com",
    projectId: "noticiaspwa-58270",
    storageBucket: "noticiaspwa-58270.firebasestorage.app",
    messagingSenderId: "758477934480",
    appId: "1:758477934480:web:10f781e64eff91b21a2d15",
};

// Inicializa Firebase y crea la instancia de Firestore
// NOTA: firebase.initializeApp solo funcionará si los scripts de Firebase están cargados en el HTML.
// Ya no es necesario inicializar aquí si lo haces con los scripts en el HTML. 
// Asumiremos que el objeto 'firebase' está disponible globalmente.
// Si no lo está, esta línea causará un error. 
// Si estás usando los scripts v8.10.0, déjalo así.

try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.warn("Firebase ya inicializado o la librería no está cargada:", e);
}

const db = firebase.firestore();

// =================================================================
// 2. FUNCIÓN PARA CARGAR Y MOSTRAR NOTICIAS DESDE FIRESTORE
// =================================================================

/**
 * Carga las noticias desde Firestore, las guarda en newsData y las renderiza.
 * @param {string} category El filtro de categoría ('todos' para todas).
 * @param {string} containerId El ID del contenedor HTML para la lista principal.
 */
async function loadFilteredNewsFromFirestore(category = 'todos', containerId = 'news-container') {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '<div class="loading-spinner">Cargando noticias...</div>'; 

    try {
        let query = db.collection('noticias')
                      .orderBy('fecha', 'desc')
                      .limit(6); // Limita a las 6 noticias más recientes

        // Aplica el filtro de categoría si no es 'todos'
        if (category !== 'todos') {
            query = query.where('categoria', '==', category.toLowerCase());
        }

        const snapshot = await query.get();
        // Mapea los documentos para extraer solo los datos
        const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        newsData = news; // Guarda los datos para la búsqueda

        // Limpia y renderiza
        newsContainer.innerHTML = ''; 
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">No se encontraron noticias disponibles en esta sección.</p>';
            return;
        }

        renderNewsList(news, newsContainer);

    } catch (error) {
        console.error("Error al cargar las noticias desde Firestore: ", error);
        newsContainer.innerHTML = '<h2>Error al conectar con la base de datos. (Revisa la consola)</h2>';
    }
}

/**
 * Carga los artículos destacados para el carrusel.
 * @param {string} category El filtro de categoría ('todos' para todas).
 */
async function loadCarouselFromFirestore(category = 'todos') {
    const carouselInner = document.getElementById('carousel-inner');
    if (!carouselInner) return;
    
    carouselInner.innerHTML = '<div class="loading-spinner">Cargando destacados...</div>';

    try {
        let query = db.collection('noticias')
                      .where('destacada', '==', true)
                      .orderBy('fecha', 'desc');

        if (category !== 'todos') {
             query = query.where('categoria', '==', category.toLowerCase());
        }

        const snapshot = await query.get();
        let destacadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Si no hay destacadas específicas, intenta cargar las 3 últimas sin filtro de categoría, o las 3 primeras generales.
        if (destacadas.length === 0) {
            console.warn(`No hay destacadas para la categoría "${category}". Cargando 3 últimas noticias generales.`);
            const generalQuery = db.collection('noticias').orderBy('fecha', 'desc').limit(3);
            const generalSnapshot = await generalQuery.get();
            destacadas = generalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        if (destacadas.length === 0) {
            carouselInner.innerHTML = '<p class="no-news-carousel">No hay noticias destacadas.</p>';
            return;
        }

        renderCarouselItems(destacadas.slice(0, 3), carouselInner);
        
        // Inicia el carrusel
        const items = document.querySelectorAll('.carousel-item');
        if (items.length > 0) {
            items[0].classList.add('active');
            clearInterval(autoSlide);
            if (items.length > 1) {
                autoSlide = setInterval(() => moveCarousel(1), 5000);
            }
        }
    } catch (error) {
        console.error("Error al cargar el carrusel desde Firestore: ", error);
        carouselInner.innerHTML = '<p class="no-news-carousel">Error al cargar el carrusel.</p>';
    }
}

/**
 * Carga un artículo individual para la página noticia.html.
 * @param {string} id El ID del documento de Firestore.
 */
async function loadSingleArticleFromFirestore(id) {
    const container = document.getElementById('news-article-container');
    const titleElement = document.querySelector('title');
    if (!container) return;
    
    container.innerHTML = '<h2>Cargando artículo...</h2>';

    try {
        const docRef = db.collection('noticias').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            container.innerHTML = '<h2>🚨 Error 404: Noticia No Encontrada</h2><p>Lo sentimos, el artículo solicitado no existe o fue eliminado.</p>';
            titleElement.textContent = 'Error 404 | México Se Enteré Qué';
            return;
        }

        const article = { id: doc.id, ...doc.data() };
        
        // Formateo de Fecha
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        // Si la fecha es un Timestamp de Firestore
        let displayDate = article.fecha ? article.fecha.toDate().toLocaleDateString('es-MX', dateOptions) : 'Fecha Desconocida';
        
        const safeTitle = escapeHtml(article.titulo);
        titleElement.textContent = safeTitle + ' | México Se Enteré Qué'; 
        
        container.innerHTML = `
            <h1>${safeTitle}</h1>
            <div class="article-meta">
                <span>📅 Publicado: ${displayDate}</span>
                <span>📍 Ciudad: ${escapeHtml(article.ciudad || 'No especificado')}</span>
                <span>✍️ Por: ${escapeHtml(article.autor || 'Redacción')}</span>
            </div>
            
            <img src="${article.imagen || 'https://placehold.co/1200x600/CCCCCC/333333?text=Imagen+Principal'}" alt="${safeTitle}" class="article-image">
            
            <section class="article-body">
                <p>${escapeHtml(article.resumen)}</p>
            </section>

            <button class="share-btn large" onclick="shareArticle('${safeTitle}')">Compartir Artículo</button>
            
            <div id="related-news-container" class="related-news-container">
                <h3>Otras noticias de ${escapeHtml(article.ciudad || 'la zona')}</h3>
                <!-- Aquí se cargan las relacionadas -->
            </div>
        `;

        // Cargar noticias relacionadas (3 de la misma categoría, excluyendo la actual)
        const relatedQuery = db.collection('noticias')
                             .where('categoria', '==', article.categoria.toLowerCase())
                             .orderBy('fecha', 'desc')
                             .limit(4);
        
        const relatedSnapshot = await relatedQuery.get();
        const relatedNews = relatedSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(n => n.id !== article.id)
            .slice(0, 3);
            
        renderNewsList(relatedNews, document.getElementById('related-news-container'));


    } catch (error) {
        console.error("Error al cargar el artículo desde Firestore: ", error);
        container.innerHTML = '<h2>Error al cargar el artículo.</h2>';
    }
}


// =================================================================
// 3. FUNCIÓN DE RENDERIZADO (Adaptada a la estructura de Firestore)
// =================================================================

/**
 * Renderiza la lista de noticias en un contenedor.
 */
function renderNewsList(newsList, containerElement) {
    containerElement.innerHTML = '';
    
    if (!newsList.length) {
        containerElement.innerHTML = '<p class="no-news">No se encontraron noticias para esta sección.</p>';
        return;
    }

    newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const newsUrl = `noticia.html?id=${news.id}`; 
        
        const dateOptions = { year: 'numeric', month: 'numeric', day: 'numeric' };
        let displayDate = news.fecha ? news.fecha.toDate().toLocaleDateString('es-MX', dateOptions) : 'Fecha Desconocida';

        const articleContent = `
            <article>
                <a href="${newsUrl}">
                    <img src="${news.imagen || 'https://placehold.co/1200x600/CCCCCC/333333?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                    <div class="card-content">
                        <h4>${safeTitle}</h4>
                        <p>${escapeHtml(news.resumen).substring(0, 100)}...</p>
                        <div class="author-info">
                            <span>📅 ${displayDate}</span>
                            <span>| Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                        </div>
                    </div>
                </a>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.506l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm12 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                    </svg>
                    Compartir
                </button>
            </article>
        `;

        const newsCardDiv = document.createElement('div');
        newsCardDiv.classList.add('news-card'); 
        newsCardDiv.innerHTML = articleContent;
        containerElement.appendChild(newsCardDiv);
    });
}

/**
 * Renderiza los artículos para el carrusel.
 */
function renderCarouselItems(newsList, containerElement) {
     containerElement.innerHTML = '';
     newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const newsUrl = `noticia.html?id=${news.id}`; 
        
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        let displayDate = news.fecha ? news.fecha.toDate().toLocaleDateString('es-MX', dateOptions) : 'Fecha Desconocida';

        const articleContent = `
            <a href="${newsUrl}" class="carousel-link">
                <img src="${news.imagen || 'https://placehold.co/800x400/CCCCCC/333333?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                <div class="carousel-content">
                    <div class="ribbon">${escapeHtml(news.categoria || 'Noticias').toUpperCase()}</div>
                    <h3>${safeTitle}</h3>
                    <p>${escapeHtml(news.resumen).substring(0, 150)}...</p>
                    <div class="author-info">
                        <span>📅 ${displayDate}</span>
                        <span>| Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                    </div>
                </div>
            </a>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
        `;

        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        carouselItem.innerHTML = articleContent;
        containerElement.appendChild(carouselItem);
    });
}


// =================================================================
// 4. FUNCIONES DE UTILIDAD Y BÚSQUEDA
// =================================================================

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

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    if (items[currentIndex]) { items[currentIndex].classList.remove('active'); }

    currentIndex = (currentIndex + direction + items.length) % items.length;
    
    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
        // Ajusta el carrusel al nuevo índice
        carouselInner.style.transform = `translateX(-${currentIndex * (100 / items.length)}%)`; // Se necesitaría CSS más complejo para esto
    }
    
    if (items[currentIndex]) { items[currentIndex].classList.add('active'); }
}
window.moveCarousel = moveCarousel;


function searchNews() {
    const searchInput = document.getElementById('search');
    const newsContainer = document.getElementById('news-container');
    if (!searchInput || !newsContainer) return;
    
    const query = (searchInput.value || '').toLowerCase();
    
    // Filtra contra los datos cargados previamente desde Firestore
    const filteredNews = newsData
        .filter(n => (n.titulo || '').toLowerCase().includes(query) || (n.resumen || '').toLowerCase().includes(query) || (n.categoria || '').toLowerCase().includes(query));
    
    renderNewsList(filteredNews, newsContainer);
    alertMessage(`Resultados de búsqueda cargados para: ${escapeHtml(query)}`);
}
window.searchNews = searchNews;

function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        // API nativa de compartir
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        // Fallback: Copiar enlace
        // Usamos document.execCommand('copy') como fallback más seguro en algunos entornos iFrame
        try {
            const tempInput = document.createElement('textarea');
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alertMessage(`Enlace copiado al portapapeles: ${url}`);
        } catch (err) {
            alertMessage(`Copia este enlace para compartir: ${url}`);
        }
    }
}
window.shareArticle = shareArticle;

// =================================================================
// 5. LÓGICA DE UI Y PWA
// =================================================================

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

function openCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner && localStorage.getItem('cookies-consent') === null) {
        banner.style.display = 'block';
    }
}

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
        // Solo mostrar si hay una opción de instalación
        if (deferredPrompt) {
            appModal.style.display = 'flex';
        } else {
            // Si el navegador no soporta beforeinstallprompt, lo ocultamos
            appModal.style.display = 'none';
        }
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

// LÓGICA DE INSTALACIÓN PWA (Smart Banner)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    checkAppModalVisibility(); // Revisa si debe mostrarse el banner ahora que tenemos el prompt
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


// =================================================================
// 6. INICIALIZACIÓN PRINCIPAL (DOM Content Loaded)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Registro del Service Worker ---
    if ('serviceWorker' in navigator) {
        // Importante: Usar DOMContentLoaded en lugar de 'load' para evitar InvalidStateError
        navigator.serviceWorker.register('/mexico-se-entere/service-worker.js')
            .then(reg => {
                console.log('Service Worker registrado con éxito:', reg.scope);
            })
            .catch(error => {
                // Si falla, el error podría ser por la ruta. 
                console.error('Fallo en el registro del Service Worker:', error);
            });
    }
    
    // --- Lógica de Detección de Página y Carga de Contenido ---
    
    const path = window.location.pathname;
    
    if (path.includes('noticia.html')) {
        // LÓGICA PARA PÁGINA DE NOTICIA INDIVIDUAL
        const articleId = getUrlParameter('id');
        if (articleId) {
            loadSingleArticleFromFirestore(articleId); // <-- Carga de Firebase
        } else {
            document.getElementById('news-article-container').innerHTML = '<h2>ID de noticia no proporcionado.</h2>';
        }
    } else {
        // LÓGICA PARA PÁGINAS DE LISTADO (Index, Atizapán, etc.)
        let categoryToFilter = 'todos'; // Valor por defecto
        
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

        // Carga la lista principal y el carrusel
        loadFilteredNewsFromFirestore(categoryToFilter, 'news-container'); // <-- Carga de Firebase
        loadCarouselFromFirestore(categoryToFilter); // <-- Carga de Firebase
    }

    // --- Lógica de Filtros (Botones) ---
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        // Importante: El filtro debe cargar las noticias en la lista principal, no en el carrusel
        button.addEventListener('click', (event) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            const category = event.target.getAttribute('data-category');
            
            loadFilteredNewsFromFirestore(category, 'news-container'); // <-- Recarga solo la lista principal
        });
    });
    
    // --- Lógica de UI (Cookies, Búsqueda, PWA Modal) ---
    checkAppModalVisibility();

    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const installBtn = document.getElementById('install-pwa-btn'); // Botón de instalación PWA

    if (!consent) {
        setTimeout(openCookieBanner, 1000); 
    }
    
    // Manejadores de eventos de cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
            alertMessage('Cookies aceptadas. ¡Gracias!');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'rejected');
            hideCookieBanner();
            alertMessage('Cookies rechazadas.');
        });
    }
    
    // Manejador de evento de instalación PWA
    if (installBtn) {
        installBtn.addEventListener('click', installPWA);
    }
    
    // Manejadores de eventos de búsqueda
    const searchButton = document.getElementById('search-button'); 
    const searchInput = document.getElementById('search'); 
    
    if (searchButton) {
        searchButton.addEventListener('click', searchNews);
    }
    
    // Permite buscar al presionar Enter en el input
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Evita que se envíe el formulario si está dentro de uno
                searchNews();
            }
        });
    }

});