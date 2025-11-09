// Define um nome para o cache atual, incrementado para forçar a atualização.
const CACHE_NAME = 'vetagro-sustentavel-v4';

// Lista de arquivos essenciais para o funcionamento offline do app
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione aqui outros assets estáticos importantes se necessário
  // Ex: '/logo.png', '/styles.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  // Espera a instalação terminar para então fazer o cache dos arquivos
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Força o novo Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
});

// Intercepta as requisições de rede
self.addEventListener('fetch', event => {
  event.respondWith(
    // Procura por uma resposta no cache primeiro
    caches.match(event.request)
      .then(response => {
        // Se encontrar no cache, retorna a resposta do cache
        if (response) {
          return response;
        }

        // Se não encontrar, faz a requisição à rede
        return fetch(event.request).then(
          networkResponse => {
            // Se a requisição for bem-sucedida, clona e armazena no cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Se o cache não estiver na lista de permissões, apaga ele
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Garante que o Service Worker ativado tome controle da página imediatamente
      return self.clients.claim();
    })
  );
});