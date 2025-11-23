// Funciones para escapar caracteres especiales de una cadena HTML
function escapeHtml(text) {
  if (!text) return '';
  // Expresión regular correcta
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
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'block';
}

function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.style.display = 'none';
}

// Función corregida para evitar el error .forEach is not a function
function loadAdSense() {
  if (document.getElementById('adsbygoogle-js')) return; 
  const s = document.createElement('script');
  s.id = 'adsbygoogle-js';
  s.async = true;
  // **RECUERDA CAMBIAR ESTO POR TU ID DE ADSENSE REAL**
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX'; 
  s.crossOrigin = 'anonymous';
  s.onload = () => {
    try {
      // Inicia la cola de AdSense de forma segura
      (window.adsbygoogle = window.adsbygoogle || []).push({}); 
    } catch (e) { console.warn('No se pudo inicializar anuncios:', e); }
  };
  document.head.appendChild(s);
}

// --- Modal de la App ---
function showAppModal() {
  const appModal = document.getElementById('app-modal');
  if (appModal && !localStorage.getItem('app-modal-seen')) {
    setTimeout(() => {
      appModal.style.display = 'flex';
      localStorage.setItem('app-modal-seen', 'true');
    }, 2000);
  }
}

function hideAppModal() {
  const appModal = document.getElementById('app-modal');
  if (appModal) appModal.style.display = 'none';
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

// =======================================================
// LÓGICA JAVASCRIPT PRINCIPAL
// El código se ejecuta dentro de DOMContentLoaded para evitar errores
// de 'Cannot read properties of null (reading addEventListener)'
// =======================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Funciones de Utilidad ---

    /**
     * Función auxiliar para mostrar un mensaje temporal al usuario sin usar alert().
     */
    function alertMessage(message) {
        console.warn("Mensaje para el usuario:", message);
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 5px; z-index: 2000; box-shadow: 0 4px 8px rgba(0,0,0,0.2); opacity: 0; transition: opacity 0.3s;';
        tempDiv.textContent = message;
        document.body.appendChild(tempDiv);
        
        // Animación de entrada
        setTimeout(() => {
            tempDiv.style.opacity = 1;
        }, 10);
        
        // Animación de salida después de 3 segundos
        setTimeout(() => {
            tempDiv.style.opacity = 0;
            setTimeout(() => {
                document.body.removeChild(tempDiv);
            }, 300);
        }, 3000);
    }

    // --- Funciones de Navegación y Búsqueda ---
    
    // Asignamos las funciones al scope global para que puedan ser llamadas
    // directamente desde el atributo 'onclick' en el HTML.

    window.toggleMenu = function() {
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('open');
            
            // Cierra la búsqueda si el menú se abre (limpieza de UI en móvil)
            const searchInput = document.getElementById('search-input');
            if (window.innerWidth < 768 && searchInput) {
                searchInput.classList.remove('visible');
            }
        }
    }

    window.toggleSearch = function() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.classList.toggle('visible');
            
            // Cierra el menú si la búsqueda se abre
            const navMenu = document.getElementById('nav-menu');
            if (navMenu) {
                navMenu.classList.remove('open');
            }
        }
    }

    window.searchNews = function() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            const query = searchInput.value;
            console.log('Búsqueda simulada por:', query);
            alertMessage('Búsqueda simulada para: ' + query);
            // Lógica de búsqueda real iría aquí
        }
    }
    
    // --- Lógica del Carrusel ---
    
    window.carouselIndex = 0;
    window.moveCarousel = function(direction) {
        // Aquí iría la lógica para mover las diapositivas del carrusel (DOM manipulation)
        window.carouselIndex += direction;
        console.log('Movimiento de carrusel:', window.carouselIndex);
        alertMessage(`Carrusel movido al índice: ${window.carouselIndex}`);
    }


    // --- Lógica de Cookies ---
    
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    
    // Función para mostrar el banner
    window.openCookieBanner = function() {
        if (cookieBanner) {
             cookieBanner.style.display = 'block';
        }
    }

    if (acceptBtn && rejectBtn && cookieBanner) {
        
        const handleCookieAction = (action) => {
            // Lógica para guardar la preferencia (p.ej., en localStorage o una cookie)
            console.log(`Cookies: Acción '${action}' registrada.`);
            
            cookieBanner.style.display = 'none';
            alertMessage(`Preferencias de cookies guardadas: ${action}.`);
        };

        // Escuchadores de eventos para los botones del banner
        acceptBtn.addEventListener('click', () => handleCookieAction('Aceptadas'));
        rejectBtn.addEventListener('click', () => handleCookieAction('Rechazadas'));
        
        // Muestra el banner al cargar (si no hay preferencia guardada previamente)
        setTimeout(() => {
            // Simulación: solo mostramos si no está oculto por el CSS
            if (cookieBanner.style.display !== 'none') {
                openCookieBanner();
            }
        }, 1000);
    }
    
    // --- DEBUGGING EXTRA ---
    
    // Esto es un ejemplo de cómo se vería el código que causaba tu error,
    // si intentara ejecutarse antes de que existiera el elemento:
    /*
    const shareButton = document.getElementById('el-elemento-que-no-existe');
    // Si shareButton es null, la siguiente línea falla:
    // shareButton.addEventListener('click', () => {}); 
    */
    
    // Si tienes un archivo 'share-modal.js', asegúrate de que use el patrón
    // document.addEventListener('DOMContentLoaded', ...) para evitar el error 'null'.
    
});
