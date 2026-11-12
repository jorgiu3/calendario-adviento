# 🎄 Calendario de Adviento

Un pueblo navideño nevado con 24 casitas. Cada casita se enciende su día de diciembre (según la fecha del móvil de quien la abre), trae un minijuego o reto y, al superarlo, un regalo: una carta, una foto, un vale o una pista del gran regalo del día 24.

## Cómo personalizarlo

Todo el contenido está en **`contenido.js`**. No hace falta tocar nada más.

1. Cambia `paraQuien`, `deQuien`, el título y la bienvenida.
2. Para cada día, cambia el reto (`reto`) y el premio (`premio`). Arriba del archivo tienes la lista de tipos de reto y lo que admite cada uno.
3. Sube vuestras fotos a la carpeta `fotos/` y escribe su nombre en el archivo, por ejemplo `foto: "fotos/playa.jpg"`. Para el puzle van mejor las fotos cuadradas (si no, se recorta el centro).
4. Para música propia, sube un mp3 (por ejemplo a `musica/cancion.mp3`) y ponlo en `musica`. Si lo dejas vacío suena una melodía de caja de música.
5. Las pistas de todos los días se juntan en el día 24, donde se responde a `regaloFinal.pregunta`.

Se puede editar directamente en GitHub: abre `contenido.js`, pulsa el lápiz ✏️, cambia el texto y pulsa **Commit changes**. En un minuto la web se actualiza.

## Modo prueba

Para ver y probar todas las casillas antes de diciembre, añade `?prueba=TU_CLAVE` al final de la dirección (`TU_CLAVE` es lo que pongas en `claveModoPrueba` dentro de `contenido.js`). Aparece una barra amarilla para borrar el progreso de prueba o salir. El modo prueba guarda su progreso aparte, así que no afecta al de ella.

## ✅ Antes de enseñárselo

- [ ] Cambia `claveModoPrueba` por una clave que solo sepas tú, o déjala vacía (`""`) para desactivar el modo prueba.
- [ ] Revisa los 24 días: pon tus textos, preguntas, respuestas y regalos (ahora hay contenido de ejemplo).
- [ ] Cambia las fotos de ejemplo por las vuestras. Redúcelas a unos 1200 px de lado: las fotos del móvil de 4–8 MB hacen que el puzle y el memory vayan lentos.
- [ ] Prueba todo con el modo prueba en tu móvil y pulsa «Borrar progreso» al terminar.
- [ ] Comprueba que `anio` es el año correcto.

Si después de editar `contenido.js` la web muestra «Hay un error en contenido.js», revisa las comas y comillas cerca de lo último que cambiaste. Si un reto está mal configurado, la casilla lo avisa y deja abrir el regalo igualmente.

## Publicar en GitHub Pages

1. Sube estos archivos a un repositorio de GitHub.
2. En el repositorio, ve a **Settings → Pages**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`, y guarda.
3. En un par de minutos la web estará en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

No hay que compilar nada: son archivos estáticos con rutas relativas.

## Probar en tu ordenador

Abre `index.html` en el navegador, o mejor, desde esta carpeta ejecuta `python3 -m http.server` y entra en http://localhost:8000.

## A tener en cuenta

- El progreso se guarda en el navegador de ella (localStorage). Si abre la web en otro móvil o borra los datos del navegador, tendrá que volver a superar los retos.
- Las fechas usan el reloj del dispositivo. El contenido está en `contenido.js`, así que alguien que mire el código fuente podría ver las respuestas: es un regalo, no una caja fuerte 😉.
