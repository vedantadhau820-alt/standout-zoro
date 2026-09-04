const CACHE_NAME = "standout-v2.4 beta 22";
//const MEDIA_CACHE = "standout-media";
// NEVER versioned

const FONT_AWESOME_CACHE =
  "standout-fontawesome-v1";

const BACKGROUND_CACHE =
  "standout-background-v6";


const FONT_AWESOME_FILES = [
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2"
];


const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",

  // CSS
  "/CSS/base.css",
  "/CSS/buttons.css",
  "/CSS/components.css",
  "/CSS/features.css",
  "/CSS/effects.css",
  "/CSS/timer.css",
  "/CSS/account.css",
  "/CSS/badges.css",
  "/CSS/momentum.css",
  "/CSS/monthly-report.css",

  // JS
  "/JS/cards.js",
  "/JS/app.js",
  "/JS/background.js",
  "/JS/badges.js",
  "/JS/custom-cards.js",
  "/JS/momentum.js",
  "/JS/sound.js",

  // Icon
  "/icon.jpeg"
];


const BACKGROUND_ASSETS = [

  // SS
  "/Images/SS1.jpg",
  "/Images/SS2.jpg",
  "/Images/SS3.jpg",
  "/Images/SS4.jpg",
  "/Images/SS5.jpg",
  "/Images/SS6.jpg",
  "/Images/SS7.jpg",
  "/Images/SS8.jpg",
  "/Images/SS9.jpg",
  "/Images/SS10.jpg",
  "/Images/SS11.jpg",
  "/Images/SS12.jpg",
  "/Images/SS13.jpg",
  "/Images/SS14.jpg",
  "/Images/SS15.jpg",

  // S
  "/Images/S1.jpg",
  "/Images/S2.jpg",
  "/Images/S3.jpg",
  "/Images/S4.jpg",
  "/Images/S5.jpg",
  "/Images/S6.jpg",
  "/Images/S7.jpg",
  "/Images/S8.jpg",
  "/Images/S9.jpg",
  "/Images/S10.jpg",
  "/Images/S11.jpg",
  "/Images/S12.jpg",
  "/Images/S13.jpg",
  "/Images/S14.jpg",
  "/Images/S15.jpg",
  "/Images/S16.jpg",
  "/Images/S17.jpg",
  "/Images/S18.jpg",
  "/Images/S19.jpg",
  "/Images/S20.jpg",
  "/Images/S21.jpg",
  "/Images/S22.jpg",
  "/Images/S23.jpg",
  "/Images/S24.jpg",
  "/Images/S25.jpg",
  "/Images/S26.jpg",
  "/Images/S27.jpg",
  "/Images/S28.jpg",
  "/Images/S29.jpg",
  "/Images/S30.jpg",
  "/Images/S31.jpg",
  "/Images/S32.jpg",
  "/Images/S33.jpg",
  "/Images/S34.jpg",
  "/Images/S35.jpg",

  // B
  "/Images/B1.jpg",
  "/Images/B2.jpg",
  "/Images/B3.jpg",
  "/Images/B4.jpg",
  "/Images/B5.jpg",
  "/Images/B6.jpg",
  "/Images/B7.jpg",
  "/Images/B8.jpg",
  "/Images/B9.jpg",
  "/Images/B10.jpg",
  "/Images/B11.jpg",
  "/Images/B12.jpg",
  "/Images/B13.jpg",
  "/Images/B14.jpg",
  "/Images/B15.jpg",
  "/Images/B16.jpg",
  "/Images/B17.jpg",
  "/Images/B18.jpg",
  "/Images/B19.jpg",
  "/Images/B20.jpg",
  "/Images/B21.jpg",
  "/Images/B22.jpg",
  "/Images/B23.jpg",

  // C
  "/Images/C1.jpg",
  "/Images/C2.jpg",
  "/Images/C3.jpg",
  "/Images/C4.jpg",
  "/Images/C5.jpg",
  "/Images/C6.jpg",
  "/Images/C7.jpg",
  "/Images/C8.jpg",
  "/Images/C9.jpg",
  "/Images/C10.jpg",
  "/Images/C11.jpg",
  "/Images/C12.jpg",
  "/Images/C13.jpg",
  "/Images/C14.jpg",
  "/Images/C15.jpg",
  "/Images/C16.jpg",
  "/Images/C17.jpg",
  "/Images/C18.jpg",
  "/Images/C19.jpg",

  // D
  "/Images/D1.jpg",
  "/Images/D2.jpg",
  "/Images/D3.jpg",
  "/Images/D4.jpg",
  "/Images/D5.jpg",
  "/Images/D6.jpg",

  // X
  "/Images/X1.jpg",
  "/Images/X2.jpg",
  "/Images/X3.jpg",
  "/Images/X4.jpg",
  "/Images/X5.jpg",
  "/Images/X6.jpg",
  "/Images/X7.jpg",
  "/Images/X8.jpg",
  "/Images/X9.jpg",
  "/Images/X10.jpg",
  "/Images/X11.jpg",
  "/Images/X12.jpg",
  "/Images/X13.jpg",
  "/Images/X14.jpg",
  "/Images/X15.jpg",
  "/Images/X16.jpg",
  "/Images/X17.jpg",
  "/Images/X18.jpg",
  "/Images/X19.jpg",
  "/Images/X20.jpg",
  "/Images/X21.jpg",
  "/Images/X22.jpg",
  "/Images/X23.jpg",
  "/Images/X24.jpg",

  // A
  "/Images/A1.jpg",
  "/Images/A2.jpg",
  "/Images/A3.jpg",
  "/Images/A4.jpg",
  "/Images/A5.jpg",
  "/Images/A6.jpg",
  "/Images/A7.jpg",
  "/Images/A8.jpg",
  "/Images/A9.jpg",
  "/Images/A10.jpg",
  "/Images/A11.jpg",
  "/Images/A12.jpg",
  "/Images/A13.jpg",
  "/Images/A14.jpg",
  "/Images/A15.jpg",
  "/Images/A16.jpg",
  "/Images/A17.jpg",
  "/Images/A18.jpg",
  "/Images/A19.jpg",
  "/Images/A20.jpg",
  "/Images/A21.jpg",
  "/Images/A22.jpg",
  "/Images/A23.jpg",
  "/Images/A24.jpg",
  "/Images/A25.jpg",
  "/Images/A26.jpg",
  "/Images/A27.jpg",
  "/Images/A28.jpg",
  "/Images/A29.jpg",
  "/Images/A30.jpg",
  "/Images/A31.jpg",
  "/Images/A32.jpg",
  "/Images/A33.jpg",
  "/Images/A34.jpg",
  "/Images/A35.jpg",
  "/Images/A36.jpg",
  "/Images/A37.jpg",
  "/Images/A38.jpg",
  "/Images/A39.jpg",
  "/Images/A40.jpg",
  "/Images/A41.jpg",
  "/Images/A42.jpg",
  "/Images/A43.jpg",
  "/Images/A44.jpg",
  "/Images/A45.jpg",

  // Endgame
  "/Images/Endgame_Cap.gif",
  "/Images/Endgame_Thor.gif",

  // Sounds
  "/Music/Complete.mp3",
  "/Music/Achievements.mp3",
  "/Music/m1.mp3",
  "/Music/m2.mp3",
  "/Music/m3.mp3",
  "/Music/m4.mp3",
  "/Music/m5.mp3",
  "/Music/m6.mp3",
  "/Music/MintCard.mp3",

  // Video
  "/AchievedGoal.mp4",
  "/welcome.mp4",

  // Badges
  "/badges/aug-2026.png",
  "/badges/sep-2026.png",

  // Assets
  "/assets/season-01-Ascension.jpg",
  "/assets/season-01-beyond-limits.jpg"
];


/* ===========================
   INSTALL
=========================== */

self.addEventListener("install", event => {

  console.log("🟡 SW installing...");

  event.waitUntil(

    (async () => {

      const appCache =
        await caches.open(CACHE_NAME);


      /* =====================================================
         APP SHELL

         IMPORTANT:
         Do NOT use addAll() here.

         Every file is cached independently so that
         one missing file cannot break SW installation.
      ===================================================== */

      await Promise.all(

        APP_SHELL.map(
          async url => {

            try {

              const response =
                await fetch(
                  url,
                  {
                    cache: "no-cache"
                  }
                );


              if (
                response.ok
              ) {

                await appCache.put(
                  url,
                  response.clone()
                );


                console.log(
                  "✅ Shell cached:",
                  url
                );

              } else {

                console.warn(
                  "⚠️ Shell unavailable:",
                  url,
                  response.status
                );

              }

            } catch (error) {

              console.warn(
                "⚠️ Shell cache failed:",
                url,
                error
              );

            }

          }
        )

      );


      console.log(
        "✅ App shell caching finished"
      );


      /* =====================================================
         FONT AWESOME
      ===================================================== */

      const fontAwesomeCache =
        await caches.open(
          FONT_AWESOME_CACHE
        );


      for (
        const url of FONT_AWESOME_FILES
      ) {

        try {

          const response =
            await fetch(
              url,
              {
                mode: "cors"
              }
            );


          if (
            response.ok
          ) {

            await fontAwesomeCache.put(
              url,
              response.clone()
            );


            console.log(
              "✅ Font Awesome cached:",
              url
            );

          }

        } catch (error) {

          console.warn(
            "⚠️ Could not cache Font Awesome:",
            url,
            error
          );

        }

      }

    })()

  );


  self.skipWaiting();

});


/* ===========================
   MESSAGE
=========================== */

self.addEventListener(
  "message",
  event => {

    if (
      event.data === "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }

  }
);


/* ===========================
   ACTIVATE
=========================== */

self.addEventListener(
  "activate",
  event => {

    console.log(
      "🟢 SW activating"
    );


    event.waitUntil(

      (async () => {

        const keys =
          await caches.keys();


        await Promise.all(

          keys.map(
            key => {

              /*
               * Keep only current caches.
               */

              if (
                key === CACHE_NAME ||
                key === FONT_AWESOME_CACHE ||
                key === BACKGROUND_CACHE
              ) {

                return Promise.resolve();

              }


              return caches.delete(
                key
              );

            }
          )

        );


        /*
         * Cache large background assets
         * after activation.
         */

        cacheBackgroundAssets()
          .catch(
            error => {

              console.warn(
                "Background asset caching failed:",
                error
              );

            }
          );


        /* =====================================================
           NOTIFY ALL CLIENTS
        ===================================================== */

        const clients =
          await self.clients.matchAll({
            includeUncontrolled: true
          });


        clients.forEach(
          client => {

            client.postMessage({
              type: "SW_UPDATED"
            });

          }
        );

      })()

    );


    self.clients.claim();

  }
);


/* =========================================================
   FETCH → CACHE STRATEGY
========================================================= */

self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    const url =
      request.url;


    const requestURL =
      new URL(url);


    const pathname =
      requestURL.pathname;


    /* =====================================================
       IGNORE NON-GET REQUESTS

       POST / PUT / DELETE etc. should never be placed
       into the Cache API.
    ===================================================== */

    if (
      request.method !== "GET"
    ) {

      return;

    }


    /* =====================================================
       FONT AWESOME / BACKGROUND ASSETS
    ===================================================== */

    if (
      FONT_AWESOME_FILES.includes(url) ||
      BACKGROUND_ASSETS.includes(pathname)
    ) {

      event.respondWith(

        (async () => {

          /*
           * CACHE FIRST
           */

          const cached =
            await caches.match(
              request
            );


          if (
            cached
          ) {

            return cached;

          }


          /*
           * NETWORK
           */

          try {

            const response =
              await fetch(
                request
              );


            /*
             * Save successful response.
             */

            if (
              response.ok
            ) {

              const cache =
                await caches.open(
                  BACKGROUND_CACHE
                );


              await cache.put(
                request,
                response.clone()
              );

            }


            return response;

          } catch (error) {

            console.warn(
              "❌ Offline asset unavailable:",
              url
            );


            throw error;

          }

        })()

      );


      return;

    }


    /* =====================================================
       APP REQUESTS

       CACHE FIRST

       If the resource is already cached:
           → return cache

       If not:
           → try network

       If network succeeds:
           → cache it

       If network fails AND this is navigation:
           → return index.html

       If network fails for another request:
           → let request fail normally
    ===================================================== */

    event.respondWith(

      (async () => {

        /*
         * 1. CACHE
         */

        const cached =
          await caches.match(
            request
          );


        if (
          cached
        ) {

          return cached;

        }


        /*
         * 2. NETWORK
         */

        try {

          const response =
            await fetch(
              request
            );


          /*
           * 3. RUNTIME CACHE
           *
           * Only cache successful
           * same-origin GET requests.
           */

          if (
            response.ok &&
            requestURL.origin ===
              self.location.origin
          ) {

            const cache =
              await caches.open(
                CACHE_NAME
              );


            await cache.put(
              request,
              response.clone()
            );

          }


          return response;

        } catch (error) {

          /*
           * 4. OFFLINE NAVIGATION
           *
           * Only HTML page navigation gets
           * the index.html fallback.
           */

          if (
            request.mode === "navigate"
          ) {

            const offlinePage =
              await caches.match(
                "/index.html"
              );


            if (
              offlinePage
            ) {

              console.log(
                "📴 Offline → index.html"
              );


              return offlinePage;

            }

          }


          /*
           * 5. Other resources
           *
           * Do not return index.html for CSS,
           * JS, images, audio, etc.
           */

          throw error;

        }

      })()

    );

  }
);


/* =========================================================
   CACHE BACKGROUND ASSETS
========================================================= */

async function cacheBackgroundAssets() {

  const cache =
    await caches.open(
      BACKGROUND_CACHE
    );


  for (
    const url of BACKGROUND_ASSETS
  ) {

    try {

      /*
       * Don't download it again if
       * already cached.
       */

      const existing =
        await cache.match(
          url
        );


      if (
        existing
      ) {

        console.log(
          "Already cached:",
          url
        );


        continue;

      }


      /*
       * Download.
       */

      const response =
        await fetch(
          url
        );


      /*
       * Cache only successful files.
       */

      if (
        response.ok
      ) {

        await cache.put(
          url,
          response.clone()
        );


        console.log(
          "✅ Background cached:",
          url
        );

      } else {

        console.warn(
          "⚠️ Background returned:",
          response.status,
          url
        );

      }

    } catch (error) {

      /*
       * One failed image/audio/video
       * must NOT stop the remaining assets.
       */

      console.warn(
        "⚠️ Background cache failed:",
        url,
        error
      );

    }

  }


  console.log(
    "✅ Background asset caching finished"
  );

  }
