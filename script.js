// Funciones para escapar caracteres especiales de una cadena HTML
function escapeHtml(text) {
  if (!text) return '';
  // Esta es una expresión regular correcta: /.../g
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

async function loadNews() {
  const newsContainer = document.getElementById('news-container');
  // Asegúrate de que el archivo JSON use la clave "noticias_list"
  try {
    const response = await fetch('noticias.json');
    if (!response.ok) throw new Error('No se encontró noticias.json');
    const data = await response.json();
    const noticias = data.noticias_list || []; // Usamos la clave correcta para el CMS

    if (!noticias.length) {
      newsContainer.innerHTML = '<p>No hay noticias disponibles.</p>';
      return;
    }
    newsContainer.innerHTML = '';
    noticias.slice(0, 6).forEach(news => {
      const safeTitle = escapeHtml(news.titulo || 'Noticia');
      newsContainer.innerHTML += `
        <article>
          <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}">
          <h4>${news.titulo}</h4>
          <p>${news.resumen}</p>
          <div class="author-info">
            <img src="${news.logo_cuadrado || 'https://via.placeholder.com/50x50?text=Logo'}" alt="Logo del autor" class="author-logo">
            <span>Por: ${news.autor || 'Redacción'}</span>
          </div>
          <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
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
    const data = await response.json();
    const noticias = data.noticias_list || []; // Usamos la clave correcta para el CMS
    
    const destacadas = noticias.filter(n => n.destacada);
    const lista = destacadas.length ? destacadas : noticias.slice(0, 3);

    lista.forEach(news => {
      const safeTitle = escapeHtml(news.titulo || 'Noticia');
      carouselInner.innerHTML += `
        <div class="carousel-item">
          <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}">
          <div class="carousel-content">
            <h3>${news.titulo}</h3>
            <p>${news.resumen}</p>
            <div class="author-info">
              <img src="${news.logo_horizontal || 'https://via.placeholder.com/50x50?text=Logo'}" alt="Logo del autor" class="author-logo-horizontal">
              <span>Por: ${news.autor || 'Redacción'}</span>
            </div>
            <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
          </div>
        </div>`;
    });

    // Muestra el primer elemento y habilita el carrusel
    const firstItem = document.querySelector('.carousel-item');
    if (firstItem) {
        firstItem.classList.add('active'); // O el estilo CSS que uses para mostrar el primero
    }

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
  
  fetch('noticias.json')
    .then(r => r.json())
    .then(data => {
      const noticias = data.noticias_list || [];
      const filteredNews = noticias
        .filter(n => n.titulo.toLowerCase().includes(query) || n.resumen.toLowerCase().includes(query));
      
      newsContainer.innerHTML = ''; // Limpiamos antes de empezar a agregar
      
      if (filteredNews.length === 0) {
          newsContainer.innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
          return;
      }
      
      filteredNews
        .slice(0, 6)
        .forEach(news => {
          const safeTitle = escapeHtml(news.titulo || 'Noticia');
          newsContainer.innerHTML += `
            <article>
              <img src="${news.imagen || 'https://via.placeholder.com/800x400?text=Imagen+No+Disponible'}" alt="${news.titulo}">
              <h4>${news.titulo}</h4>
              <p>${news.resumen}</p>
              <div class="author-info">
                <img src="${news.logo_cuadrado || 'https://via.placeholder.com/50x50?text=Logo'}" alt="Logo del autor" class="author-logo">
                <span>Por: ${news.autor || 'Redacción'}</span>
              </div>
              <button class="share-btn" onclick="shareArticle('${safeTitle}')">Compartir</button>
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
  const text = `¡Mira esta noticia en México Se Enteré Qué!: ${title}`;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(()=>{});
  } else {
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
  document.getElementById('cookie-banner').style.display = 'block';
}

function hideCookieBanner() {
  document.getElementById('cookie-banner').style.display = 'none';
}

function loadAdSense() {
  if (document.getElementById('adsbygoogle-js')) return; 
  const s = document.createElement('script');
  s.id = 'adsbygoogle-js';
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
  s.crossOrigin = 'anonymous';
  s.onload = () => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).forEach(cfg => (window.adsbygoogle = window.adsbygoogle || []).push(cfg));
    } catch (e) { console.warn('No se pudo inicializar anuncios:', e); }
  };
  document.head.appendChild(s);
}

// --- Modal de la App ---
function showAppModal() {
  if (localStorage.getItem('app-modal-seen')) return;

  setTimeout(() => {
    document.getElementById('app-modal').style.display = 'flex';
    localStorage.setItem('app-modal-seen', 'true');
  }, 2000);
}

function hideAppModal() {
  document.getElementById('app-modal').style.display = 'none';
}

// --- Evento Principal (Unificado) ---
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  loadCarousel();

  const consent = localStorage.getItem('cookies-consent');
  if (!consent) {
    openCookieBanner();
  } else {
    if (consent === 'accepted') {
      loadAdSense();
    }
    showAppModal(); 
  }

  // Manejadores de eventos de botones
  const acceptBtn = document.getElementById('accept-cookies');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookies-consent', 'accepted');
      hideCookieBanner();
      loadAdSense();
      showAppModal(); 
    });
  }

  const rejectBtn = document.getElementById('reject-cookies');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cookies-consent', 'rejected');
      hideCookieBanner();
      showAppModal(); 
    });
  }
});
