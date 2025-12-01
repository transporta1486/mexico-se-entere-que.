// --- Importaciones de Firebase (Asegúrate de que estas rutas son accesibles en tu proyecto) ---
import { initializeApp, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    onSnapshot, 
    // Comentamos orderBy para evitar el error de índice de Firestore 
    // orderBy 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Habilitar logs de debug de Firebase para diagnóstico
setLogLevel('debug'); 

// -----------------------------------------------------------
// CONFIGURACIÓN GLOBAL (Variables proporcionadas por el entorno)
// -----------------------------------------------------------
// Usar valores predeterminados si las variables de Canvas no están definidas
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let auth;
let db;
let userId = null;

// Referencias a elementos DOM
const newsListDiv = document.getElementById('newsList');
const loadingStatusEl = document.getElementById('loadingStatus');
const userIdDisplay = document.getElementById('userIdDisplay');


// -----------------------------------------------------------
// INICIALIZACIÓN DE FIREBASE Y AUTH
// -----------------------------------------------------------

/**
 * Inicializa la aplicación Firebase con la configuración proporcionada.
 */
function initializeFirebase() {
    try {
        const firebaseConfigString = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
        const firebaseConfig = JSON.parse(firebaseConfigString);

        if (!firebaseConfig || !firebaseConfig.projectId) {
            throw new Error('Configuración de Firebase incompleta.');
        }

        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app); 
        return true;

    } catch (error) {
        console.error("CRÍTICO: Error al inicializar Firebase:", error.message);
        loadingStatusEl.textContent = `❌ Error de inicio de Firebase: ${error.message}`;
        return false;
    }
}

/**
 * Configura la autenticación y establece el listener de estado.
 */
async function setupAuthentication() {
    try {
        // Firmar sesión usando el token personalizado o de forma anónima
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        // Listener de cambios de estado de autenticación
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                userIdDisplay.textContent = user.uid;
                // Una vez autenticado, iniciamos la escucha de datos
                listenForNews(); 
            } else {
                userIdDisplay.textContent = 'Anónimo';
            }
        });

    } catch (error) {
        console.error("CRÍTICO: Error en la autenticación:", error);
        loadingStatusEl.textContent = `❌ Error de autenticación: ${error.message}`;
    }
}


// -----------------------------------------------------------
// LÓGICA DE FIREBASE FIRETSORE (LISTADO EN TIEMPO REAL)
// -----------------------------------------------------------

/**
 * Configura la escucha en tiempo real de la colección de noticias.
 */
function listenForNews() {
    // Asegurarse de que Firebase está listo
    if (!db || !userId) {
        console.warn("Firestore o ID de usuario no disponibles para escuchar noticias.");
        return;
    }

    // Ruta a la colección privada de noticias del usuario
    // artifacts/{appId}/users/{userId}/noticias
    const newsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/noticias`);
    
    // Crear la consulta (sin orderBy para evitar errores de índice)
    const q = query(newsCollectionRef); 
    
    loadingStatusEl.textContent = 'Conectando a la base de datos...';
    
    // onSnapshot: Escucha en tiempo real de cambios en la colección
    onSnapshot(q, (querySnapshot) => {
        const newsItems = [];
        querySnapshot.forEach((doc) => {
            // Se asume que los documentos guardan un campo 'fecha'
            newsItems.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar las noticias por fecha dentro del código JavaScript (Descendente)
        // Se asume que el campo es "fecha" y está en formato Date o string comparable
        newsItems.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        renderNews(newsItems);

    }, (error) => {
        console.error("Error al escuchar noticias:", error);
        loadingStatusEl.textContent = `❌ Error de conexión en tiempo real: ${error.message}`;
    });
}


// -----------------------------------------------------------
// RENDERIZADO DE NOTICIAS
// -----------------------------------------------------------

/**
 * Genera el HTML de la lista de noticias.
 * @param {Array<Object>} items - Array de objetos de noticias.
 */
function renderNews(items) {
    newsListDiv.innerHTML = ''; // Limpiar lista
    loadingStatusEl.classList.add('hidden'); // Ocultar mensaje de carga

    if (items.length === 0) {
        loadingStatusEl.classList.remove('hidden');
        loadingStatusEl.textContent = 'Aún no hay noticias publicadas. Utiliza el enlace de Administración para subir contenido.';
        return;
    }

    items.forEach(data => {
        // Fallback de imagen en caso de que no haya URL o falle
        const imageUrl = data.imagenUrl || 'https://placehold.co/400x200/94A3B8/FFFFFF?text=Sin+Imagen';

        const newsCard = `
            <div id="news-${data.id}" 
                 class="card bg-white p-5 rounded-lg shadow-lg border border-gray-100 cursor-pointer" 
                 onclick="window.showNewsDetailPage('${data.id}')">
                
                <img src="${imageUrl}" 
                     alt="${data.titulo || 'Noticia'}" 
                     class="w-full h-40 object-cover rounded-md mb-4"
                     onerror="this.onerror=null; this.src='https://placehold.co/400x200/EF4444/FFFFFF?text=Error+Carga';">
                
                <h3 class="font-bold text-xl text-gray-800 line-clamp-2">${data.titulo || 'Sin Título'}</h3>
                <p class="text-gray-600 text-sm mt-2 line-clamp-3">${data.resumen || 'Sin resumen disponible.'}</p>
                
                <div class="mt-3 flex justify-between items-center text-xs">
                    <p class="text-emerald-500 font-medium hover:text-emerald-700">Leer más →</p>
                    <p class="text-gray-400">${new Date(data.fecha).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        newsListDiv.innerHTML += newsCard;
    });
}

// -----------------------------------------------------------
// REGISTRO DEL SERVICE WORKER (PWA)
// -----------------------------------------------------------

/**
 * Registra el Service Worker.
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✅ Service Worker registrado con éxito:', reg.scope))
            .catch(error => console.error('❌ Fallo el registro del Service Worker:', error));
    } else {
        console.warn('⚠️ Este navegador no soporta Service Workers (PWA).');
    }
}


// -----------------------------------------------------------
// FUNCIÓN PARA EL DETALLE DE LA NOTICIA (Simulación de pwa_script.js)
// NOTA: Esta función DEBE existir globalmente si se usa en el onclick de index.html
// En un proyecto real, estaría en pwa_script.js. Aquí la incluimos para que funcione.
// -----------------------------------------------------------
window.showNewsDetailPage = function(newsId) {
    // Implementación de la lógica para cargar el detalle de la noticia
    console.log(`Navegando al detalle de la noticia ID: ${newsId}`);
    
    // Aquí iría el código para consultar el documento de la noticia por su ID
    // y renderizar el newsDetailContainer con el contenido completo.
    
    // Ejemplo de alerta temporal (reemplazar por UI modal o cambio de vista real)
    alert(`Cargando detalle completo de la noticia ${newsId}. ¡Implementación pendiente!`);
};


// -----------------------------------------------------------
// PUNTO DE ENTRADA PRINCIPAL DEL SCRIPT
// -----------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Registrar el service worker para la funcionalidad PWA
    registerServiceWorker(); 
    
    // 2. Iniciar Firebase y la autenticación
    if (initializeFirebase()) {
        setupAuthentication();
    }
});