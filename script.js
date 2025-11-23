// Funciones para escapar caracteres especiales de una cadena HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return ''; // Manejar valores no string
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

// --- Variables Globales (Para Carrusel) ---
let currentIndex = 0;
let autoSlide;

// --- Funciones de Utilidad (Hacerlas globales) ---

/**
 * Función auxiliar para mostrar un mensaje temporal al usuario sin usar alert().
 */
function alertMessage(message) {
    console.warn("Mensaje para el usuario:", message);
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = 'position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;';
    tempDiv.textContent = message;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => {
        tempDiv.style.opacity = 1;
    }, 10);
    
    setTimeout(() => {
        tempDiv.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(tempDiv);
        }, 300);
    }, 3000);
}

// --- Carga de JSON y Renderizado ---

async function getNewsData() {
    // URL simulada del JSON de noticias
    const newsJsonData = {
        "noticias_list": [
            { "id": "2e3c0d60", "titulo": "Asesinan a Camilo Ochoa, 'El Alucín', en su domicilio en Temixco", "resumen": "El influencer Camilo Ochoa, conocido como 'El Alucín', fue asesinado a balazos...", "imagen": "https://i.postimg.cc/zfJ0KVJ4/FB-IMG-1755480044118.jpg", "categoria": "policía", "autor": "Javier Huerta Martinez", "destacada": false },
            { "id": "a9b8c7d6", "titulo": "Baches afectan casi el 80 % del Valle de México, según denunciantes", "resumen": "Denuncias ciudadanas, apoyadas por imágenes y videos, revelan que los baches se han convertido en un problema crítico y generalizado...", "imagen": "https://i.postimg.cc/xdr6Ct7j/FB-IMG-1755466516879.jpg", "categoria": "infraestructura", "autor": "Javier Huerta Martinez", "destacada": false },
            { "id": "1f2g3h4i", "titulo": "Familia de AMLO en el foco mediático tras rumores de mudanza presidencial", "resumen": "Versiones sin confirmar, que circulan principalmente en redes sociales, han desatado una ola de especulaciones sobre una supuesta mudanza...", "imagen": "https://i.postimg.cc/sX5dxMKq/f3eed-16-08-2025-bety-1.jpg", "categoria": "política", "autor": "Javier Huerta Martinez", "destacada": true },
            { "id": "c7d6e5f4", "titulo": "🚨 México se entere qué: Rescatan a 15 personas atrapadas en Teleférico de Torreón", "resumen": "Momentos de tensión se vivieron en Torreón, Coahuila, cuando una falla mecánica dejó varadas a 15 personas en las góndolas...", "imagen": "https://i.postimg.cc/d08j8525/telefericotorreonsl-312b03dd-focus-0-0-1200-600.webp", "categoria": "sucesos", "autor": "", "destacada": false },
            { "id": "b8c7d6e5", "titulo": "🔥 México se entere qué: Incendio arrasa mercado en Monterrey", "resumen": "Un fuerte incendio consumió gran parte de un mercado popular en Monterrey durante la madrugada...", "imagen": "https://i.postimg.cc/J4nx9c8h/incendio-consume-nueve-locales-en-un-mercado-de-monterrey-2496html-incendio-nljpg-8123html-f0dbfbc7.webp", "categoria": "sociedad", "autor": "", "destacada": false }
        ]
    };
    
    // En un sitio real, usarías:
    // const response = await fetch('noticias.json');
    // const data = await response.json();
    // return data.noticias_list || [];
    
    return newsJsonData.noticias_list || [];
}


function renderNews(newsList, containerId) {
    const newsContainer = document.getElementById(containerId);
    if (!newsContainer) return;

    if (!newsList.length) {
        newsContainer.innerHTML = '<p>No se encontraron noticias.</p>';
        return;
    }

    newsContainer.innerHTML = '';
    newsList.forEach(news => {
        const safeTitle = escapeHtml(news.titulo || 'Noticia');
        const isCarousel = containerId === 'carousel-inner';
        
        const articleContent = isCarousel ? `
            <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
            <div class="carousel-content">
                <h3>${safeTitle}</h3>
                <p>${escapeHtml(news.resumen)}</p>
                <div class="author-info">
                    <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
            </div>
        ` : `
            <article>
                <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${safeTitle}">
                <h4>${safeTitle}</h4>
                <p>${escapeHtml(news.resumen)}</p>
                <div class="author-info">
                    <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
            </article>
        `;

        const tag = isCarousel ? 'div' : 'span'; // Usar <span> o <div> para el grid container
        const classNames = isCarousel ? 'carousel-item' : '';

        // El grid-container ya tiene la clase 'news-grid', solo agregamos los artículos/spans
        if (isCarousel) {
             newsContainer.innerHTML += `<${tag} class="${classNames}">${articleContent}</${tag}>`;
        } else {
             newsContainer.innerHTML += articleContent;
        }
    });
}

async function loadNews() {
    const noticias = await getNewsData();
    renderNews(noticias.slice(0, 6), 'news-container');
}

async function loadCarousel() {
    const noticias = await getNewsData();
    const destacadas = noticias.filter(n => n.destacada);
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

// --- Carrusel Control ---

function moveCarousel(direction) {
    const items = document.querySelectorAll('.carousel-item');
    if (items.length <= 1) return;
    
    // Quita 'active' del elemento actual
    if (items[currentIndex]) {
        items[currentIndex].classList.remove('active');
    }

    // Calcula el nuevo índice
    currentIndex = (currentIndex + direction + items.length) % items.length;
    
    // Mueve la vista (requiere CSS para funcionar correctamente)
    const carouselInner = document.getElementById('carousel-inner');
    if (carouselInner) {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    
    // Añade 'active' al nuevo elemento
    if (items[currentIndex]) {
        items[currentIndex].classList.add('active');
    }
}
window.moveCarousel = moveCarousel;

// --- Búsqueda ---

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

// --- Compartir ---
function shareArticle(title) {
    const url = window.location.href;
    const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(() => {});
    } else {
        alertMessage(`Copia este enlace para compartir: ${url}`);
    }
}
window.shareArticle = shareArticle;

// --- Menú / Búsqueda (UI) ---

function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const searchInputContainer = document.getElementById('search-input');

    if (navMenu && menuToggle) {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Cierra la búsqueda si el menú se abre
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
        
        // Cierra el menú si la búsqueda se abre
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        
        // Enfoca el input de búsqueda si se hace visible
        const searchInput = document.getElementById('search');
        if (searchInputContainer.classList.contains('active') && searchInput) {
            searchInput.focus();
        }
    }
}
window.toggleSearch = toggleSearch;

// --- Cookies y App Modal ---

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

function showAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal && !localStorage.getItem('app-modal-seen') && localStorage.getItem('cookies-consent') === 'accepted') {
        setTimeout(() => {
            appModal.style.display = 'flex';
            // Lo dejamos comentado para que se muestre en cada recarga para fines de prueba
            // localStorage.setItem('app-modal-seen', 'true'); 
        }, 3000);
    }
}

function hideAppModal() {
    const appModal = document.getElementById('app-modal');
    if (appModal) appModal.style.display = 'none';
}
window.hideAppModal = hideAppModal;


// --- Evento Principal (Unificado) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga de Contenido
    loadNews();
    loadCarousel();
    
    // 2. Lógica de Cookies
    const consent = localStorage.getItem('cookies-consent');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (!consent) {
        setTimeout(openCookieBanner, 1000); // Muestra el banner después de 1s si no hay consentimiento
    } else if (consent === 'accepted') {
        // En un sitio real, aquí cargarías Google Analytics y Adsense
        showAppModal();
    }
    
    // 3. Manejadores de eventos de botones de Cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookies-consent', 'accepted');
            hideCookieBanner();
            // loadAdSense(); // Descomentar para cargar ads reales
            showAppModal();
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
    
    // 4. Manejador de Evento para el botón de búsqueda
    const searchButton = document.getElementById('search-button'); 
    if (searchButton) {
        searchButton.addEventListener('click', searchNews);
    }
});
