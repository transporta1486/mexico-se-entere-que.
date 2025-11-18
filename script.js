/ Funciones para escapar caracteres especiales de una cadena HTML
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, function(match) {
    switch (match) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
    }
  });
}

// --- Carrusel ---
let currentIndex = 0;
let autoSlide;

// Nota: La función loadNews y loadCarousel debe modificarse para leer la nueva estructura JSON:
// { "noticias_list": [...] }

async function loadNews() {
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';
  try {
    const response = await fetch('noticias.json');
    if (!response.ok) throw new Error('No se encontró noticias.json');
    
    // Lectura del nuevo formato JSON con "noticias_list"
    const data = await response.json();
    const noticias = data.noticias_list || []; 
    
    if (!noticias.length) {
      newsContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
      return;
    }
    
    // Utilizamos slice(0, 6) para limitar a las primeras 6 noticias
    noticias.slice(0, 6).forEach(news => {
      const safeTitle = escapeHtml(news.titulo || 'Noticia');
      newsContainer.innerHTML += `
        <article class="news-card">
          <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}" class="news-image">
          <div class="news-content">
            <h4>${safeTitle}</h4>
            <p>${escapeHtml(news.resumen || '')}</p>
            <div class="author-info">
              <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
            </div>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
          </div>
        </article>`;
    });
  } catch (e) {
    console.error('Error cargando noticias:', e);
    newsContainer.innerHTML = '<p>Error al cargar noticias.</p>';
  }
}

async function loadCarousel() {
  const carouselInner = document.querySelector('.carousel-inner');
  carouselInner.innerHTML = '';
  try {
    const response = await fetch('noticias.json');
    if (!response.ok) throw new Error('No se encontró noticias.json');
    
    // Lectura del nuevo formato JSON con "noticias_list"
    const data = await response.json();
    const allNoticias = data.noticias_list || []; 

    const destacadas = allNoticias.filter(n => n.destacada);
    const lista = destacadas.length ? destacadas.slice(0, 5) : allNoticias.slice(0, 3); // Limitar destacadas

    lista.forEach(news => {
      const safeTitle = escapeHtml(news.titulo || 'Noticia');
      carouselInner.innerHTML += `
        <div class="carousel-item">
          <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}">
          <div class="carousel-content">
            <h3>${safeTitle}</h3>
            <p>${escapeHtml(news.resumen || '')}</p>
            <div class="author-info">
              <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
            </div>
          </div>
        </div>`;
    });

    if (lista.length > 1) {
      clearInterval(autoSlide);
      autoSlide = setInterval(() => moveCarousel(1), 5000);
    }
  } catch (e) {
    console.error('Error cargando carrusel:', e);
    carouselInner.innerHTML = '<p>Error al cargar noticias destacadas.</p>';
  }
}

function moveCarousel(direction) {
  const items = document.querySelectorAll('.carousel-item');
  if (items.length <= 1) return;
  currentIndex = (currentIndex + direction + items.length) % items.length;
  document.querySelector('.carousel-inner').style.transform = `translateX(-${currentIndex * 100}%)`;
}

// --- Búsqueda ---
function searchNews() {
  const query = (document.getElementById('search').value || '').toLowerCase();
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';
  fetch('noticias.json')
    .then(r => r.json())
    // Leemos el nuevo formato JSON
    .then(data => data.noticias_list || [])
    .then(noticias => {
      const filteredNews = noticias
        .filter(n => n.titulo.toLowerCase().includes(query) || (n.resumen && n.resumen.toLowerCase().includes(query)))
        .slice(0,6);
        
      if(filteredNews.length === 0) {
          newsContainer.innerHTML = `<p>No se encontraron resultados para "${escapeHtml(query)}".</p>`;
          return;
      }

      filteredNews.forEach(news => {
          const safeTitle = escapeHtml(news.titulo || 'Noticia');
          newsContainer.innerHTML += `
            <article class="news-card">
              <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}" class="news-image">
              <div class="news-content">
                <h4>${safeTitle}</h4>
                <p>${escapeHtml(news.resumen || '')}</p>
                <div class="author-info">
                  <span>Por: ${escapeHtml(news.autor || 'Redacción')}</span>
                </div>
                <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
              </div>
            </article>`;
        });
      
    })
    .catch(e => {
      console.error('Error buscando noticias:', e);
      newsContainer.innerHTML = '<p>Error al cargar noticias.</p>';
    });
}


// --- Compartir ---
function shareArticle(title) {
  const url = window.location.href;
  const text = `¡Mira esta noticia en México Se Enteró Qué!: ${title}`;
  
  if (navigator.share) {
    // Si el dispositivo soporta la API nativa de compartir (móvil)
    navigator.share({ title, text, url }).catch(()=>{});
  } else {
    // Si no soporta la API nativa, usa la URL
    alert(`Comparte este enlace: ${url}`);
  }
}

// --- Menú / búsqueda ---
function toggleMenu() {
  document.getElementById('nav-menu').classList.toggle('active');
  document.querySelector('.menu-toggle').classList.toggle('active');
}
function toggleSearch() {
  document.getElementById('search-input').classList.toggle('active');
}

// --- Cookies y AdSense condicional ---
function openCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'block';
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'none';
}

function setCookieConsent(status) {
  localStorage.setItem('cookies-consent', status);
}

// Inyecta el script de AdSense
function loadAdSense() {
  if (document.getElementById('adsbygoogle-js')) return; 
  const s = document.createElement('script');
  s.id = 'adsbygoogle-js';
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
  s.crossOrigin = 'anonymous';
  s.onload = () => {
    try {
      // Activa los bloques de anuncios que ya están en el HTML
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { console.warn('No se pudo inicializar anuncios:', e); }
  };
  document.head.appendChild(s);
}

// --- Modal de la App ---
function showAppModal() {
    const modal = document.getElementById('app-modal');
    if (!modal) return;
    
    // Si ya lo vio o lo cerró, no lo mostramos de nuevo
    if (localStorage.getItem('app-modal-seen')) return;

    setTimeout(() => {
        modal.style.display = 'flex';
        localStorage.setItem('app-modal-seen', 'true');
    }, 2000); 
}

function hideAppModal() {
    const modal = document.getElementById('app-modal');
    if (modal) modal.style.display = 'none';
}


// --- INICIALIZACIÓN PRINCIPAL (Solo un bloque DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar contenido principal
    loadNews();
    loadCarousel();

    // 2. Lógica de Cookies
    const consent = localStorage.getItem('cookies-consent');
    if (!consent) {
        openCookieBanner();
    } else {
        if (consent === 'accepted') {
            loadAdSense();
        }
        showAppModal(); 
    }
    
    // 3. Añadir Listeners de Cookies
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    
    // Manejo de errores si los botones no existen (por si hay problemas con el HTML)
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            setCookieConsent('accepted');
            hideCookieBanner();
            loadAdSense();
            showAppModal();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            setCookieConsent('rejected');
            hideCookieBanner();
            showAppModal();
        });
    }

    // 4. Asegurar que las noticias se lean desde la clave correcta (si no lo hace el fetch)
    // ESTO YA ESTÁ CORREGIDO DENTRO de loadNews, loadCarousel y searchNews.
});
