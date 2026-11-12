/* =====================================================================
   🎄 CONTENIDO DEL CALENDARIO — este es el único archivo que tienes que tocar
   =====================================================================

   - Cambia los textos entre comillas "..." por los tuyos.
   - Las fotos van en la carpeta "fotos/". Escribe aquí su nombre, por ejemplo
     foto: "fotos/playa.jpg". Para el puzle, mejor fotos cuadradas.
   - Las respuestas no distinguen mayúsculas ni tildes ("Málaga" = "malaga").
     Puedes aceptar varias respuestas con una lista: ["roma", "italia"].
   - Cuidado con las comas: cada bloque { ... } va separado por una coma.

   TIPOS DE RETO (campo "tipo"):
     "quiz"        Preguntas con opciones sobre vosotros. En "correcta" pon el texto
                   exacto de la opción buena, o su número empezando en 0
                   (0 = primera opción, 1 = segunda…).
     "adivinanza"  Una pregunta o acertijo con respuesta escrita.
     "codigo"      Pista del mundo real: busca un código escondido en casa.
     "puzle"       Puzle de una foto (toca dos piezas para cambiarlas).
     "memoria"     Encontrar parejas (fotos o emojis).
     "sopa"        Sopa de letras con vuestras palabras.
     "rasca"       Rasca y gana.
     "cifrado"     Mensaje secreto con las letras desplazadas.
     "copos"       Minijuego: atrapa copos de nieve antes de que acabe el tiempo.
     "ahorcado"    Adivina la palabra letra a letra.
     "ordenar"     Toca los recuerdos en orden.
     "ninguno"     Sin reto, se abre directamente.
     "final"       (solo día 24) Junta todas las pistas para descubrir el gran regalo.

   PREMIO de cada día (todo es opcional, pon solo lo que quieras):
     carta  Un mensaje tuyo (usa \n para saltar de línea).
     foto   Una foto vuestra.
     pista  Una pieza del acertijo final; se guarda en el álbum.
     vale   Un vale canjeable ("Vale por un masaje").
     enlace Un enlace, por ejemplo a una canción: { texto: "Nuestra canción", url: "https://..." }
   ===================================================================== */

const CALENDARIO = {
  // A quién va dirigido y quién lo firma
  paraQuien: "mi amor",
  deQuien: "Jorge",

  // Año del calendario: cada casilla se abre el día X de diciembre de este año
  anio: 2026,

  // Modo prueba: abre la web con  ?prueba=TU_CLAVE  al final de la dirección
  // (por ejemplo https://usuario.github.io/calendario-adviento/?prueba=renos) para ver todo abierto.
  // ⚠️ Antes de enseñárselo, cámbiala por otra que solo sepas tú o déjala vacía: ""
  claveModoPrueba: "renos",

  titulo: "Nuestro Calendario de Adviento",
  bienvenida: "Cada día de diciembre se enciende una casita del pueblo. Supera su reto y descubrirás su regalo… y una pista del gran regalo final 🎁",

  // Música: pon la ruta de un mp3 (por ejemplo "musica/cancion.mp3").
  // Si lo dejas vacío suena una melodía suave de caja de música.
  musica: "",

  // Gran regalo final (día 24)
  regaloFinal: {
    pregunta: "Con todas tus pistas… ¿adónde nos vamos?",
    respuesta: ["roma", "a roma", "italia"],
    titulo: "¡Nos vamos a Roma! 🇮🇹",
    carta: "Feliz Navidad, mi amor.\nEn febrero nos perdemos por Roma: pasta, helados y tirar una moneda en la Fontana di Trevi para volver juntos.\nGracias por un año precioso.",
    foto: "fotos/foto4.svg"
  },

  dias: [
    {
      dia: 1,
      titulo: "Empieza la cuenta atrás",
      intro: "Para calentar, una pregunta fácil…",
      reto: {
        tipo: "quiz",
        preguntas: [
          { pregunta: "¿Dónde fue nuestra primera cita?", opciones: ["En el cine", "En una cafetería", "En la playa"], correcta: "En una cafetería" },
          { pregunta: "¿Qué pedí yo aquel día?", opciones: ["Un café con leche", "Un chocolate", "Un té"], correcta: 0 }
        ]
      },
      premio: {
        carta: "Bienvenida a tu calendario de adviento.\nCada día te espera un pequeño reto y una sorpresa. ¡Que empiece la magia!",
        pista: "Pista 1: Hará falta coger un avión ✈️"
      }
    },
    {
      dia: 2,
      titulo: "Rasca, rasca",
      intro: "Rasca la tarjeta con el dedo para descubrir tu premio.",
      reto: { tipo: "rasca", texto: "🎟️ Vale por un desayuno en la cama" },
      premio: {
        vale: "Vale por un desayuno en la cama (tú eliges el día)",
        pista: "Pista 2: Es una ciudad, no una playa 🏙️"
      }
    },
    {
      dia: 3,
      titulo: "Memoria navideña",
      intro: "Encuentra todas las parejas.",
      reto: { tipo: "memoria", cartas: ["🎄", "⛄", "🎁", "🦌", "⭐", "🍪"] },
      premio: {
        carta: "Tienes la mejor memoria del mundo… menos para dónde dejas las llaves 😘",
        pista: "Pista 3: Allí se habla una lengua muy parecida al español 🗣️"
      }
    },
    {
      dia: 4,
      titulo: "Una adivinanza",
      intro: "A ver si lo sacas…",
      reto: {
        tipo: "adivinanza",
        pregunta: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.",
        respuesta: ["pera", "la pera"],
        ayuda: "Es una fruta 🍐"
      },
      premio: {
        foto: "fotos/foto1.svg",
        carta: "Esta foto es de uno de mis días favoritos contigo.",
        pista: "Pista 4: Está en Europa 🇪🇺"
      }
    },
    {
      dia: 5,
      titulo: "Puzle de recuerdos",
      intro: "Toca dos piezas para intercambiarlas hasta recomponer la foto.",
      reto: { tipo: "puzle", foto: "fotos/foto2.svg", piezas: 3 },
      premio: {
        carta: "Encajamos igual que estas piezas 🧩",
        pista: "Pista 5: Es una de las ciudades más antiguas del mundo 🏛️"
      }
    },
    {
      dia: 6,
      titulo: "Sopa de letras",
      intro: "Encuentra nuestras palabras. Toca la primera letra y luego la última.",
      reto: { tipo: "sopa", palabras: ["BESO", "ABRAZO", "NAVIDAD", "AMOR", "NIEVE"] },
      premio: {
        vale: "Vale por una tarde de manta, peli y chocolate",
        pista: "Pista 6: Allí hay muchísimas fuentes ⛲"
      }
    },
    {
      dia: 7,
      titulo: "Misión en casa",
      intro: "Hoy el reto está en el mundo real.",
      reto: {
        tipo: "codigo",
        instrucciones: "Busca debajo del cojín grande del sofá. Allí hay un papel con un código secreto. Escríbelo aquí.",
        codigo: "NAVIDAD7"
      },
      premio: {
        carta: "¡Bien encontrado! Ya sabes que siempre me encuentras 💕",
        pista: "Pista 7: Su comida es famosa en todo el mundo 🍝"
      }
    },
    {
      dia: 8,
      titulo: "Atrapa copos",
      intro: "Toca los copos de nieve antes de que se acabe el tiempo.",
      reto: { tipo: "copos", objetivo: 15, segundos: 25 },
      premio: {
        vale: "Vale por un masaje de 20 minutos",
        pista: "Pista 8: Allí comeremos muchos helados 🍦"
      }
    },
    {
      dia: 9,
      titulo: "Mensaje secreto",
      intro: "Cada letra está desplazada. Usa la rueda para descifrarlo.",
      reto: { tipo: "cifrado", mensaje: "TE QUIERO MUCHO", desplazamiento: 3 },
      premio: {
        carta: "Y lo digo en serio, aunque esté en clave 😉",
        pista: "Pista 9: La llaman la Ciudad Eterna ♾️"
      }
    },
    {
      dia: 10,
      titulo: "El ahorcado",
      intro: "Adivina la palabra.",
      reto: { tipo: "ahorcado", palabra: "MUERDAGO", ayuda: "Planta bajo la que hay que besarse" },
      premio: {
        vale: "Vale por un beso bajo el muérdago (cuando quieras)",
        pista: "Pista 10: Tiene un país entero dentro de ella 🏰"
      }
    },
    {
      dia: 11,
      titulo: "Nuestra historia",
      intro: "Toca los recuerdos en el orden en que pasaron.",
      reto: {
        tipo: "ordenar",
        elementos: ["Nos conocimos", "Primera cita", "Primer viaje juntos", "Este calendario"]
      },
      premio: {
        carta: "Y lo mejor de nuestra historia es todo lo que queda por escribir.",
        pista: "Pista 11: Allí hay un anfiteatro enorme donde luchaban gladiadores ⚔️"
      }
    },
    {
      dia: 12,
      titulo: "¿Cuánto me conoces?",
      intro: "Tres preguntas sobre mí.",
      reto: {
        tipo: "quiz",
        preguntas: [
          { pregunta: "¿Cuál es mi comida favorita?", opciones: ["Pizza", "Sushi", "Tortilla"], correcta: 2 },
          { pregunta: "¿Qué me da más miedo?", opciones: ["Las arañas", "Las alturas", "Quedarme sin batería"], correcta: 0 },
          { pregunta: "¿Qué serie vimos en dos días?", opciones: ["Friends", "La casa de papel", "Stranger Things"], correcta: 2 }
        ]
      },
      premio: {
        enlace: { texto: "🎶 Escucha nuestra canción", url: "https://open.spotify.com/" },
        pista: "Pista 12: Está más o menos a dos horas y media de vuelo 🕑"
      }
    },
    {
      dia: 13,
      titulo: "Otro puzle",
      intro: "Esta vez un poco más difícil.",
      reto: { tipo: "puzle", foto: "fotos/foto3.svg", piezas: 4 },
      premio: {
        foto: "fotos/foto3.svg",
        pista: "Pista 13: Es la capital de su país 🏛️"
      }
    },
    {
      dia: 14,
      titulo: "Rasca y gana",
      intro: "¿Qué habrá debajo?",
      reto: { tipo: "rasca", texto: "🍕 Vale por una cena donde tú quieras" },
      premio: {
        vale: "Vale por una cena donde tú quieras",
        pista: "Pista 14: Allí todos los caminos llevan… 🛣️"
      }
    },
    {
      dia: 15,
      titulo: "Parejas de fotos",
      intro: "Encuentra las parejas de nuestras fotos.",
      reto: { tipo: "memoria", cartas: ["fotos/foto1.svg", "fotos/foto2.svg", "fotos/foto3.svg", "fotos/foto4.svg", "❤️", "🥂"] },
      premio: {
        carta: "Cada una de estas fotos tiene una historia, y todas me gustan porque sales tú.",
        pista: "Pista 15: Tiene un río llamado Tíber 🌊"
      }
    },
    {
      dia: 16,
      titulo: "Más sopa",
      intro: "Palabras de nuestro año.",
      reto: { tipo: "sopa", palabras: ["VIAJE", "RISAS", "PIZZA", "CINE", "MAR", "BAILE"], tamano: 10 },
      premio: {
        vale: "Vale por elegir tú la peli tres veces seguidas",
        pista: "Pista 16: Allí se lanza una moneda para volver algún día 🪙"
      }
    },
    {
      dia: 17,
      titulo: "Pregunta trampa",
      intro: "Solo tú lo sabes.",
      reto: {
        tipo: "adivinanza",
        pregunta: "¿Cómo se llamaba el primer restaurante al que fuimos juntos?",
        respuesta: ["la tagliatella", "tagliatella"],
        ayuda: "Era italiano 🍝"
      },
      premio: {
        carta: "Ese día ya sabía que me iba a enamorar de ti.",
        pista: "Pista 17: Su equipo de fútbol más famoso viste de amarillo y granate (y hay otro de azul celeste) ⚽"
      }
    },
    {
      dia: 18,
      titulo: "Tormenta de nieve",
      intro: "Esta vez hay que atrapar más copos.",
      reto: { tipo: "copos", objetivo: 22, segundos: 25 },
      premio: {
        vale: "Vale por una sesión de fotos juntos en la nieve",
        pista: "Pista 18: Su nombre tiene solo cuatro letras 🔤"
      }
    },
    {
      dia: 19,
      titulo: "Otro mensaje secreto",
      intro: "Descífralo.",
      reto: { tipo: "cifrado", mensaje: "ERES MI REGALO", desplazamiento: 5 },
      premio: {
        carta: "No hay regalo mejor que despertarme a tu lado.",
        pista: "Pista 19: Leída al revés, es una palabra muy nuestra 💘"
      }
    },
    {
      dia: 20,
      titulo: "Busca en el abrigo",
      intro: "Otra misión en el mundo real.",
      reto: {
        tipo: "codigo",
        instrucciones: "Mira en el bolsillo de mi abrigo favorito. Hay un papelito con un código.",
        codigo: ["RENO20", "reno 20"]
      },
      premio: {
        vale: "Vale por un día entero sin móviles, solo tú y yo",
        pista: "Pista 20: Empieza por R 🅡"
      }
    },
    {
      dia: 21,
      titulo: "Palabra secreta",
      intro: "Adivina la palabra.",
      reto: { tipo: "ahorcado", palabra: "ESCAPADA", ayuda: "Lo que vamos a hacer muy pronto 😏" },
      premio: {
        carta: "¿Ya lo sospechas? Quedan pocas pistas…",
        pista: "Pista 21: Termina por A 🅰️"
      }
    },
    {
      dia: 22,
      titulo: "Ordena la Navidad",
      intro: "Toca en orden lo que pasa en Navidad.",
      reto: { tipo: "ordenar", elementos: ["Poner el árbol", "Nochebuena", "Navidad", "Nochevieja", "Reyes"] },
      premio: {
        vale: "Vale por montar juntos el árbol el año que viene",
        pista: "Pista 22: Allí está el Coliseo 🏟️"
      }
    },
    {
      dia: 23,
      titulo: "Último quiz",
      intro: "¡Ya casi está!",
      reto: {
        tipo: "quiz",
        preguntas: [
          { pregunta: "¿Qué es lo que más me gusta de ti?", opciones: ["Tu risa", "Tus abrazos", "Todo"], correcta: 2 }
        ]
      },
      premio: {
        carta: "Mañana es el gran día. Repasa bien tus pistas en el álbum 📖",
        pista: "Pista 23: Es la ciudad del amor… al revés 😉"
      }
    },
    {
      dia: 24,
      titulo: "El gran regalo",
      intro: "Junta todas las pistas que has conseguido.",
      reto: { tipo: "final" },
      premio: {}
    }
  ]
};
