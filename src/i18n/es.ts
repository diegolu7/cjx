/**
 * Diccionario en español: **fuente de verdad** de todos los textos del sitio.
 *
 * - `src/i18n/en.ts` tiene que tener exactamente las mismas claves (lo garantiza
 *   el typecheck: `en.ts` está tipado como `DictShape<typeof es>`).
 * - Los textos de `competition` / `round` no viven acá: llegan como **códigos**
 *   desde el snapshot y se formatean en `competitionLabel()` / `roundLabel()`.
 */
export const es = {
  meta: {
    siteName: "Cuando Juega el Xeneize",
    defaultTitle: "Cuándo Juega Boca Juniors — Próximos Partidos",
    defaultDescription:
      "Cuándo juega Boca Juniors: próximos partidos, rivales, horarios y resultados del Xeneize. Sitio no oficial. Canal oficial: bocajuniors.com.ar",
    appName: "Cuando Juega!",
    unofficial: "Sitio no oficial",
  },

  nav: {
    home: "Inicio",
    info: "Info",
    install: "Instalar App 📥",
    installShort: "Instalar app",
    openMenu: "Abrir menú",
    main: "Principal",
    legal: "Legal",
    brandHome: "Cuando Juega el Xeneize — Inicio",
    languageSwitcher: "Idioma",
    switchToEnglish: "English",
    switchToSpanish: "Español",
    alerts: "Activar alertas",
    alertsOn: "Alertas activadas",
  },

  footer: {
    disclaimer:
      "Sitio no oficial. No afiliado a AFA ni al Club Atlético Boca Juniors.",
    data:
      "Datos de agenda, resultados y estadísticas provistos por ESPN.",
    cookiesText:
      "Al continuar navegando aceptás el uso de cookies de estadísticas. Podés rechazarlas o ver más en la Política de Cookies.",
    cookiesPolicy: "Política de Cookies",
    copyright: "© {year} Cuando Juega el Xeneize",
    terms: "Términos",
    privacy: "Privacidad",
    cookiesLink: "Cookies",
    contact: "Contacto",
  },

  cookieBanner: {
    label: "Aviso de cookies",
    text: "Usamos almacenamiento local para el funcionamiento del sitio y, con tu permiso, cookies de estadísticas (Google Analytics 4 y Microsoft Clarity) para saber cómo se usa. Podés aceptar o rechazar las de estadísticas. Más info en la política de cookies.",
    accept: "Aceptar",
    reject: "Rechazar",
  },

  install: {
    text: "Instalá Cuando Juega el Xeneize como app: acceso directo en tu pantalla de inicio, sin tiendas.",
    ios: "En iPhone/iPad: tocá Compartir y luego Agregar a pantalla de inicio.",
    install: "Instalar",
    dismiss: "Ahora no",
  },

  notify: {
    compact:
      "¿Querés que te avisemos? Activá las notificaciones y te enterás 1 hora antes del partido, cuando salen las formaciones.",
    title: "Notificaciones",
    full: "Activá los avisos y te notificamos 1 hora antes de que juegue Boca. Sin spam: un solo aviso por partido.",
    enableShort: "Activar avisos",
    enable: "Activar notificaciones",
    disable: "Desactivar notificaciones",
    ios: "En iPhone/iPad primero instalá la app (Compartir ➔ Agregar a pantalla de inicio) y luego activá las notificaciones desde el ícono instalado.",
    soonLabel: "Próximamente:",
    soon: "vas a poder activar avisos para que te notifiquemos cuando esté por jugar Boca.",
    unsupported: "Tu navegador no soporta notificaciones.",
    enabled: "Notificaciones activadas.",
    disabled: "Notificaciones desactivadas.",
    denied: "Permiso denegado. Podés habilitarlo desde el navegador.",
    ready: "¡Listo! Vas a recibir el aviso 1 hora antes.",
    error: "No se pudo activar: {message}",
    dialogTitle: "¿Querés activar las notificaciones?",
    dialogText:
      "Te avisamos 1 hora antes de cada partido de Boca. Sin spam: un solo aviso por partido.",
    accept: "Sí, activar",
    cancel: "Ahora no",
    onTitle: "Ya tenés las alertas activadas",
    onText: "Te avisamos 1 hora antes de cada partido de Boca.",
    turnOff: "Desactivar alertas",
    close: "Cerrar",
  },

  push: {
    title: "Boca juega en 1 hora",
    body: "Boca vs {rival}{aggregate}{time}{competition}",
    aggregate: " · Global {boca}-{rival}",
    aggregatePenalties: " · Global {boca}-{rival} (pen. {penBoca}-{penRival})",
    time: " · {time}",
    competition: " · {competition}",
  },

  share: {
    label: "Compartir",
    close: "Cerrar",
    copy: "Copiar enlace",
    asImage: "Compartir como imagen",
    shareImage: "Compartir imagen",
    downloadImage: "Descargar imagen",
    copied: "Enlace copiado",
  },

  timeline: {
    heading: "Próximos partidos de Boca Juniors",
    filterLabel: "Filtrar partidos",
    tabs: {
      previous: "ANTERIORES",
      all: "TODOS",
      upcoming: "PRÓXIMOS",
    },
    groups: {
      previous: "ANTERIORES",
      live: "EN VIVO",
      next: "PRÓXIMO",
      upcoming: "PRÓXIMOS",
    },
    badges: {
      finished: "FINAL",
      live: "EN VIVO",
      next: "PRÓXIMO",
      scheduled: "PREVISTO",
    },
    noUpcoming:
      "No hay próximos partidos por el momento. La agenda se actualiza automáticamente cuando se confirme una nueva fecha.",
    noMatches: "No hay partidos disponibles por el momento.",
    timeTbd: "Horario a confirmar",
    aggregate: "Global: Boca {boca} - {rival} {rivalName}",
    aggregateShort: "Global {boca}-{rival}",
    penalties: "(pen. {boca}-{rival})",
    leaders: {
      leading: "Boca lidera",
      behind: "Boca abajo",
      tied: "Serie igualada",
    },
    viewDetail: "Ver detalle: {teams}",
  },

  status: {
    finished: "Final",
    live: "En vivo",
    next: "Próximo",
    scheduled: "Previsto",
  },

  condition: {
    home: "Local",
    away: "Visitante",
  },

  dates: {
    long: "{day} de {month} de {year}",
    hour: "{time} hs",
  },

  months: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],

  monthsShort: ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"],

  weekdays: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],

  countdown: {
    days: "Faltan {n} días",
    oneDay: "Falta 1 día",
    today: "Es hoy",
    imminent: "En juego o por comenzar",
    hours: "Faltan {n} h",
  },

  formation: {
    starters: "Titulares",
    keeper: "Arquero",
    defenders: "Defensores",
    midfielders: "Mediocampistas",
    forwards: "Delanteros",
  },

  competitions: {
    "arg.1": "Liga Profesional",
    "arg.copa": "Copa Argentina",
    "conmebol.libertadores": "Copa Libertadores",
    "conmebol.sudamericana": "Copa Sudamericana",
  },

  phases: {
    "torneo-apertura": "Torneo Apertura",
    "torneo-clausura": "Torneo Clausura",
    "group-stage": "Fase de Grupos",
    "knockout-round-playoffs": "Playoffs",
    "round-of-64": "64avos de Final",
    "round-of-32": "32avos de Final",
    "round-of-16": "Octavos de Final",
    quarterfinals: "Cuartos de Final",
    semifinals: "Semifinales",
    final: "Final",
  },

  rounds: {
    matchday: "Fecha {n}",
    legs: {
      first: "Ida",
      second: "Vuelta",
    },
  },

  seo: {
    titleFinished: "Boca {boca} - {rivalScore} {rival}: resultado final ({competition}) | Cuando Juega el Xeneize",
    titleLive: "Boca vs {rival} en vivo: marcador y datos ({competition}) | Cuando Juega el Xeneize",
    titleUpcoming: "Boca vs {rival}: fecha, hora y cómo ver ({competition}) | Cuando Juega el Xeneize",
    descFinished:
      "Resultado de {score}: cómo salió Boca por {competition}{round} el {date}. Global, formaciones y datos. Sitio no oficial.",
    descLive:
      "Boca vs {rival} en vivo por {competition}: marcador actual, eventos y estadísticas del partido. Sitio no oficial.",
    descUpcoming:
      "Boca vs {rival} por {competition}{round} el {date}{hour}{venue}. Formaciones, historial y cómo ver. Sitio no oficial.",
    hour: " a las {time}",
    venue: " en {venue}",
    round: " ({round})",
    eventDescription: "{teams} por {competition}{round} el {date}{hour}.",
    eventHour: " a las {time} hs",
  },

  faq: {
    qWhen: "¿Cuándo juega Boca vs {rival}?",
    aWhen: "El partido Boca vs {rival} se juega el {day} {date}{hour}, por {tournament}.",
    qTime: "¿A qué hora juega Boca vs {rival}?",
    aTime: "A las {time} (hora Argentina).",
    qWhere: "¿Dónde juega Boca vs {rival}?",
    aWhere: "En {venue}.",
    qChannel: "¿Por qué canal pasan Boca vs {rival}?",
    aChannel: "Por {channel}.",
    qTournament: "¿En qué torneo juega Boca vs {rival}?",
    aTournament: "Por {tournament}.",
    qResult: "¿Cómo salió Boca vs {rival}?",
    aResult: "{score}",
    aResultAggregate: " Global: Boca {boca} - {rival} {rivalName}.",
  },

  preview: {
    hosts: "recibe a",
    visits: "visita a",
    text: "Boca {verb} {rival} por {tournament} el {date}{hour}{venue}. Las formaciones, los datos y el resultado se actualizan cerca del inicio del partido.",
  },

  facts: {
    leading: "Boca lidera el cruce por {boca} a {rival}.",
    behind: "Boca va abajo en el global: {boca} a {rival}.",
    tied: "El cruce está igualado {boca} a {rival}.",
    penalties: "Penales de la ida: Boca {boca} - {rival}.",
    home: "Boca juega de local en {venue}{city}.",
    away: "Boca juega de visitante en {venue}{city}.",
    city: " ({city})",
    form: "En los últimos {n} partidos: {w} {win}{wPlural}, {d} {draw}{dPlural} y {l} {loss}{lPlural}.",
    win: "victoria",
    winPlural: "s",
    draw: "empate",
    drawPlural: "s",
    loss: "derrota",
    lossPlural: "s",
    lastMatch: "Último partido: {text}.",
  },

  match: {
    vs: "vs",
    global: "Global",
    penalties: "Penales",
    advanced: "Boca clasificó a la siguiente fase",
    inProgress: "Partido en curso",
    timeTbd: "Horario a confirmar",
    venueTbd: "A confirmar",
    labelDate: "Fecha",
    labelVenue: "Estadio",
    labelTournament: "Torneo",
    labelTv: "TV",
    shareResult: "Compartir resultado",
    shareLive: "Compartir en vivo",
    shareMatch: "Compartir partido",
    previewFinished: "Resumen del partido",
    previewLive: "En vivo",
    previewUpcoming: "Previa del partido",
    noContent:
      "Todavía no hay contenido ampliado de este partido. La ficha y el resultado se actualizan automáticamente.",
    breadcrumb: "Migas de pan",
    breadcrumbHome: "Inicio",
    breadcrumbMatches: "Partidos",
    backToMatches: "← Volver a todos los partidos",
    updatedAt: "Datos actualizados: {date} (hora Argentina).",
  },

  eventTypes: {
    goal: "Gol",
    "penalty-goal": "Gol (penal)",
    "own-goal": "Gol en contra",
    "penalty-missed": "Pen fallado",
    "yellow-card": "Tarjeta amarilla",
    "yellow-redcard": "Tarjeta roja (2ª amarilla)",
    "red-card": "Tarjeta roja",
    substitution: "Cambio",
    event: "Evento",
  },

  stats: {
    foulsCommitted: "Faltas",
    yellowCards: "Tarjetas amarillas",
    redCards: "Tarjetas rojas",
    offsides: "Offsides",
    wonCorners: "Tiros de esquina",
    saves: "Atajadas",
    possessionPct: "Posesión",
    totalShots: "Disparos",
    shotsOnTarget: "Disparos al arco",
    shotPct: "Disparos al arco (%)",
    penaltyKickGoals: "Goles de penal",
    penaltyKickShots: "Penales",
    accuratePasses: "Pases completos",
    totalPasses: "Pases",
    passPct: "Precisión de pases (%)",
    totalCrosses: "Centros",
    crossPct: "Precisión de centros (%)",
    totalLongBalls: "Balones largos",
    blockedShots: "Disparos bloqueados",
    totalTackles: "Tackles",
    interceptions: "Intercepciones",
    totalClearance: "Despejes",
  },

  sections: {
    lineups: "Formaciones",
    lineupsProbable: " (probable)",
    lineupsSoon: "Se publicarán cerca del inicio del partido.",
    lineupsNotify: "Te avisamos por notificación cuando estén confirmadas.",
    lineupsUnofficial: "No oficial, puede variar hasta la confirmación.",
    subs: "Suplentes {team} ({count})",
    events: "Eventos del partido",
    stats: "Estadísticas del partido",
    keyFacts: "Claves del partido",
    recent: "Últimos partidos",
    faq: "Preguntas frecuentes",
    techTitle: "Ver ficha técnica",
    techDate: "Fecha",
    techVenue: "Estadio",
    techTournament: "Torneo",
    techPhase: "Fase",
    techReferee: "Árbitro",
    techTv: "TV",
    tbd: "A confirmar",
    referee: "Dirigido por el árbitro {referee}.",
    formWin: "Ganó",
    formDraw: "Empató",
    formLoss: "Perdió",
    subDetail: "Sale {out}, entra {in}",
  },

  feed: {
    description: "Próximos partidos y resultados de Boca Juniors. Sitio no oficial.",
  },

  og: {
    brand: "CUANDO JUEGA EL XENEIZE",
    title: "CUÁNDO JUEGA BOCA JUNIORS",
    subtitle: "Próximo partido, fecha, hora, rival y resultados recientes",
    url: "cuandojuegaelxeneize.com.ar",
  },

  llms: {
    title: "Cuando Juega el Xeneize",
    description:
      "Sitio informativo independiente (NO oficial) que muestra cuándo juega Boca Juniors: próximo partido, fecha, hora, rival, torneo, canal y resultados recientes. Contenido en español (Argentina).",
    keyFactsTitle: "Hechos clave:",
    keyFacts: [
      'Propósito: responder rápido "¿cuándo juega Boca?" con la agenda y los resultados.',
      "Sitio no oficial: no afiliado a Boca Juniors, AFA ni CONMEBOL. Canal oficial: https://www.bocajuniors.com.ar",
      "Fuente de datos: API publica de ESPN (site.api.espn.com).",
      "Los datos pueden contener errores o estar desactualizados; verificar en canales oficiales.",
      "Contacto: delnorte.destinos@gmail.com",
    ],
    pagesTitle: "Páginas:",
    pages: {
      home: "Inicio (agenda y próximo partido)",
      matches: "Todos los partidos",
      info: "Información, FAQ y fuentes",
      contact: "Contacto",
      terms: "Términos",
      privacy: "Privacidad",
      cookies: "Cookies",
    },
    matchesTitle: "Partidos:",
    status: {
      finished: "Finalizado",
      upcoming: "Próximo",
    },
    matchLine: "- [{status}] Boca vs {rival} — {date}{time} — {competition} — {url}",
  },

  pages: {
    home: {
      title: "Cuándo Juega Boca Juniors — Próximo Partido de Boca y Resultados",
      description:
        "Cuándo juega Boca Juniors: próximo partido, fecha, hora, rival y resultados recientes. Agenda del Xeneize actualizada. Sitio no oficial.",
      h1: "Cuándo juega Boca Juniors",
      shareTitle: "Cuándo juega Boca Juniors",
      shareText: "Cuándo juega Boca: próximos partidos, horarios y resultados",
      seeAll: "Ver todos los partidos ➔",
      seeMatchInfo: "Ver más info",
    },

    matches: {
      title: "Partidos de Boca Juniors — Calendario y Resultados | Cuando Juega el Xeneize",
      description:
        "Todos los partidos de Boca Juniors: próximos encuentros y resultados recientes con formaciones, datos y resultado global. Sitio no oficial.",
      h1: "Partidos de Boca Juniors",
      intro:
        "Calendario y resultados del Xeneize. Entrá a cada partido para ver formaciones, datos y el resultado global de los cruces de ida y vuelta.",
      upcoming: "Próximos partidos",
      results: "Resultados",
      empty: "No hay partidos disponibles por el momento.",
    },

    rivals: {
      title: "Rivales de Boca Juniors — Partidos y Resultados | Cuando Juega el Xeneize",
      description:
        "Todos los rivales de Boca Juniors con sus partidos y resultados. Entrá al historial de cada rival. Sitio no oficial.",
      h1: "Rivales de Boca Juniors",
      intro: "Partidos y resultados de Boca contra cada rival.",
      one: "partido",
      many: "partidos",
      detailTitle: "Boca vs {rival} — Partidos y Resultados | Cuando Juega el Xeneize",
      detailDescription:
        "Todos los partidos de Boca Juniors contra {rival}: resultados, próximos encuentros y datos. Sitio no oficial.",
      detailIntro: "Partidos de Boca Juniors contra {rival}: resultados y próximos encuentros.",
      breadcrumb: "Rivales",
      back: "← Todos los rivales",
    },

    tournaments: {
      title: "Torneos de Boca Juniors — Fixture y Resultados | Cuando Juega el Xeneize",
      description:
        "Torneos y copas en los que juega Boca Juniors, con fixture y resultados. Sitio no oficial.",
      h1: "Torneos de Boca Juniors",
      intro: "Torneos y copas en los que juega Boca, con fixture y resultados.",
      one: "partido",
      many: "partidos",
      detailTitle: "Boca en {tournament} — Fixture y Resultados | Cuando Juega el Xeneize",
      detailH1: "Boca en {tournament}",
      detailDescription:
        "Partidos de Boca Juniors en {tournament}: fixture, resultados y próximos encuentros. Sitio no oficial.",
      detailIntro: "Fixture y resultados de Boca Juniors en {tournament}.",
      breadcrumb: "Torneos",
      back: "← Todos los torneos",
    },

    info: {
      title: "Información",
      description:
        "Quiénes somos, preguntas frecuentes, fuentes de datos, notificaciones y contacto de Cuando Juega el Xeneize.",
      intro:
        "Todo lo que necesitás saber sobre **Cuando Juega el Xeneize**: qué es, de dónde salen los datos, cómo se actualizan y cómo contactarnos.",
      aboutTitle: "Quiénes somos",
      about1:
        "Somos un sitio informativo independiente hecho por hinchas, cuyo único objetivo es mostrar de forma rápida y clara **cuándo juega Boca Juniors**, con sus próximos partidos, horarios y resultados.",
      about2:
        "**No es un sitio oficial:** no estamos afiliados, asociados, autorizados ni respaldados por el Club Atlético Boca Juniors, la AFA ni la CONMEBOL. El canal oficial es [bocajuniors.com.ar](https://www.bocajuniors.com.ar).",
      faqTitle: "Preguntas frecuentes",
      sourcesTitle: "Fuentes de datos",
      sourcesText:
        "La agenda, los resultados, las formaciones y las estadísticas se confeccionan a partir de la API pública de **ESPN** (site.api.espn.com). Aunque ponemos cuidado, la información puede contener errores, estar incompleta o desactualizada. No garantizamos su exactitud.",
      contactTitle: "Contacto",
      contactText:
        "Para consultas, correcciones o reclamos escribinos a [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com) o visitá la página de [Contacto]({contact}).",
      legalTitle: "Legal",
      faqs: [
        {
          q: "¿Cuándo juega Boca?",
          a: "En la portada mostramos siempre el próximo partido destacado con fecha, hora, rival y torneo. Más abajo están los resultados recientes y los partidos que siguen.",
        },
        {
          q: "¿Este sitio es oficial?",
          a: "No. Cuando Juega el Xeneize es un sitio informativo independiente, no afiliado ni respaldado por el Club Atlético Boca Juniors, la AFA ni la CONMEBOL. El canal oficial es bocajuniors.com.ar.",
        },
        {
          q: "¿De dónde salen los datos de los partidos?",
          a: "De la API pública de ESPN (site.api.espn.com). La información puede contener errores o estar desactualizada; siempre conviene verificar en los canales oficiales.",
        },
        {
          q: "¿Dónde se puede ver el partido?",
          a: "Cuando el dato está disponible, mostramos el canal de TV en el partido destacado. Si no figura, puede que todavía no esté confirmada la transmisión.",
        },
        {
          q: "¿Cómo se actualizan los resultados?",
          a: "Un proceso automático completa los resultados de los partidos ya jugados y mantiene la agenda al día. Igual, ante cualquier duda, priorizá la información oficial.",
        },
        {
          q: "¿Cómo usan las cookies y la analítica?",
          a: "Usamos cookies de estadísticas (Google Analytics 4 y Microsoft Clarity) para entender cómo se usa el sitio. En la Unión Europea, el Espacio Económico Europeo, Reino Unido, Suiza y Brasil pedimos consentimiento previo; en el resto del mundo entendemos que aceptás al continuar navegando. Podés rechazarlas y ver el detalle en la Política de Cookies.",
        },
      ],
    },

    contact: {
      title: "Contacto",
      description:
        "Contacto de Cuando Juega el Xeneize para consultas, correcciones y reclamos legales.",
      intro: "Para consultas, correcciones de datos, sugerencias o reclamos, escribinos a:",
      email: "delnorte.destinos@gmail.com",
      ipTitle: "Reclamos de propiedad intelectual",
      ipText:
        "Si sos titular de derechos y considerás que algún contenido de este sitio los vulnera, escribinos indicando el contenido cuestionado, tu carácter de titular y un medio de contacto. Atenderemos el pedido a la brevedad y, de corresponder, retiraremos o modificaremos el contenido.",
      linksTitle: "Otros enlaces",
      links: {
        about: "Quiénes somos",
        terms: "Términos y Condiciones",
        privacy: "Política de Privacidad",
        cookies: "Política de Cookies",
      },
    },

    notFound: {
      title: "Página no encontrada — Cuando Juega el Xeneize",
      description: "La página que buscás no existe. Volvé al inicio para ver cuándo juega Boca Juniors.",
      code: "Error 404",
      h1: "Página no encontrada",
      text: "La página que buscás no existe o cambió de dirección.",
      back: "Volver al inicio",
    },

    legal: {
      updated: "Última actualización: {date}",
      cookies: {
        title: "Política de Cookies",
        description:
          "Qué cookies y almacenamiento local usa Cuando Juega el Xeneize y cómo gestionarlas.",
        blocks: [
          {
            type: "p",
            text: "Esta página explica qué cookies y tecnologías de almacenamiento local utiliza el sitio y cómo podés gestionarlas.",
          },
          { type: "h2", text: "1. Qué son" },
          {
            type: "p",
            text: "Las cookies son pequeños archivos que un sitio guarda en tu navegador. El almacenamiento local (localStorage) es una tecnología similar que permite guardar información en tu dispositivo.",
          },
          { type: "h2", text: "2. Qué usamos" },
          {
            type: "ul",
            items: [
              "**Necesario (siempre activo):** almacenamiento local para guardar una copia de los partidos y tu preferencia de cookies. Es imprescindible para el funcionamiento y no requiere consentimiento.",
              "**Estadísticas (opcional):** Google Analytics 4 y Microsoft Clarity, que solo se activan si aceptás. GA4 mide el uso del sitio de forma agregada y anónima (con anonimización de IP); Clarity aporta mapas de calor y grabaciones de sesión anonimizadas para entender la experiencia de uso.",
              "**Publicidad (opcional):** Google AdSense y sus socios pueden usar cookies para mostrar anuncios, incluidos anuncios personalizados según tu navegación. En las regiones que lo exigen, se pide consentimiento previo mediante una plataforma de gestión de consentimiento (CMP) de Google.",
            ],
          },
          { type: "h2", text: "3. Cómo gestionarlas" },
          {
            type: "p",
            text: "Si te encontrás en la **Unión Europea, el Espacio Económico Europeo, Reino Unido, Suiza o Brasil**, al ingresar te mostramos un aviso para **aceptar o rechazar** las cookies de estadísticas antes de cargarlas.",
          },
          {
            type: "p",
            text: "En el **resto del mundo** (por ejemplo, **Argentina**), entendemos que **al continuar navegando aceptás** el uso de cookies de estadísticas y de publicidad. En todos los casos tu elección queda guardada en tu navegador y podés cambiarla borrando el almacenamiento local o desde la configuración de tu navegador.",
          },
          {
            type: "p",
            text: "Para la **publicidad**, en las regiones que lo exigen (EEE, Reino Unido y Suiza), Google muestra además un aviso de consentimiento (CMP) para anuncios personalizados.",
          },
          { type: "h2", text: "4. Más información" },
          {
            type: "p",
            text: "Ver también la [Política de Privacidad]({privacy}). Consultas: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },

      privacy: {
        title: "Política de Privacidad",
        description:
          "Cómo trata Cuando Juega el Xeneize los datos y el almacenamiento local, incluyendo Google Analytics y Microsoft Clarity.",
        blocks: [
          {
            type: "p",
            text: "Esta Política describe cómo se trata la información en este sitio, en línea con la Ley Argentina de Protección de Datos Personales N.º 25.326 y criterios generales de privacidad.",
          },
          { type: "h2", text: "1. Responsable" },
          {
            type: "p",
            text: "El responsable del sitio es **Cuando Juega el Xeneize**. Contacto: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
          { type: "h2", text: "2. Qué datos tratamos" },
          {
            type: "p",
            text: "No solicitamos ni almacenamos datos personales identificatorios (nombre, DNI, teléfono, etc.) para usar el sitio. Podemos tratar:",
          },
          {
            type: "ul",
            items: [
              "**Almacenamiento local (localStorage):** guardamos una copia de los partidos y tu preferencia de cookies en tu propio navegador, para mejorar la carga y el funcionamiento. No se envía a nuestros servidores.",
              "**Registros del proveedor de hosting:** el servicio de alojamiento puede registrar datos técnicos (dirección IP, fecha/hora, tipo de navegador) por seguridad y operación.",
              "**Datos de uso (estadísticas):** si aceptás las cookies de estadísticas, Google Analytics 4 recopila datos agregados y anónimos de navegación (páginas vistas, dispositivo, ubicación aproximada) y Microsoft Clarity recopila mapas de calor y grabaciones de sesión anonimizadas.",
              "**Datos de publicidad:** Google AdSense y sus socios pueden tratar datos (como identificadores de cookies e IP) para mostrar anuncios, incluidos personalizados. En las regiones que lo exigen se pide consentimiento previo.",
              "**Notificaciones push (opcional):** si activás los avisos, guardamos el identificador de tu dispositivo (endpoint de push) y tus preferencias, con el único fin de enviarte notificaciones antes de cada partido y con el resultado final. Podés desactivarlas cuando quieras y eliminar tus datos escribiéndonos.",
            ],
          },
          { type: "h2", text: "3. Cookies y almacenamiento local" },
          {
            type: "p",
            text: "Usamos almacenamiento local necesario para el funcionamiento del sitio y cookies de estadísticas. Si te encontrás en la Unión Europea, el Espacio Económico Europeo, Reino Unido, Suiza o Brasil, te pedimos consentimiento previo para estas últimas. En el resto del mundo, entendemos que al continuar navegando aceptás su uso. Podés rechazarlas o cambiar tu elección cuando quieras. Ver la [Política de Cookies]({cookies}).",
          },
          { type: "h2", text: "4. Google Analytics y Microsoft Clarity" },
          {
            type: "p",
            text: "Cuando aceptás las cookies de estadísticas, se carga Google Analytics 4 con anonimización de IP para medir el uso del sitio de forma agregada, y Microsoft Clarity para generar mapas de calor y grabaciones de sesión anonimizadas. Google y Microsoft pueden tratar estos datos según sus propias políticas. Si rechazás, no se carga ninguno de los dos.",
          },
          { type: "h2", text: "5. Publicidad (Google AdSense)" },
          {
            type: "p",
            text: "Este sitio puede mostrar anuncios a través de **Google AdSense** y sus socios publicitarios. Estos pueden usar cookies e identificadores para mostrar anuncios, incluidos anuncios personalizados según tu navegación. En las regiones que lo exigen (EEE, Reino Unido y Suiza) se solicita consentimiento previo mediante una plataforma de gestión de consentimiento (CMP) de Google. Podés gestionar o desactivar los anuncios personalizados en [adssettings.google.com](https://adssettings.google.com).",
          },
          { type: "h2", text: "6. Finalidad y base" },
          {
            type: "p",
            text: "Tratamos los datos para operar y mejorar el sitio, garantizar su seguridad y, con tu consentimiento, obtener estadísticas de uso y mostrar anuncios. No vendemos ni cedemos datos personales a terceros con fines comerciales.",
          },
          { type: "h2", text: "7. Tus derechos" },
          {
            type: "p",
            text: "Podés solicitar el acceso, la rectificación, la actualización o la supresión de tus datos personales escribiendo a [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com). La Agencia de Acceso a la Información Pública es el órgano de control en Argentina (Ley 25.326).",
          },
          { type: "h2", text: "8. Seguridad" },
          {
            type: "p",
            text: "Adoptamos medidas razonables para proteger la información. Ningún sistema es 100% seguro, por lo que no podemos garantizar seguridad absoluta.",
          },
          { type: "h2", text: "9. Menores" },
          {
            type: "p",
            text: "El sitio no está dirigido a menores de edad y no recopila deliberadamente datos de menores.",
          },
          { type: "h2", text: "10. Cambios" },
          {
            type: "p",
            text: "Podemos actualizar esta Política. La fecha de última actualización figura al inicio de la página.",
          },
          { type: "h2", text: "11. Contacto" },
          {
            type: "p",
            text: "Por cualquier consulta sobre privacidad: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },

      terms: {
        title: "Términos y Condiciones",
        description:
          "Términos y condiciones de uso de Cuando Juega el Xeneize, sitio informativo no oficial.",
        blocks: [
          {
            type: "p",
            text: "Al acceder y utilizar este sitio aceptás estos Términos y Condiciones. Si no estás de acuerdo, te pedimos que no utilices el sitio.",
          },
          { type: "h2", text: "1. Descripción del servicio" },
          {
            type: "p",
            text: "Este sitio ofrece información sobre la agenda de partidos de Boca Juniors (fechas, horarios, rivales, torneos y resultados). Es un servicio **informativo y gratuito**, que se brinda \"tal cual\" y \"según disponibilidad\", sin garantías de ningún tipo.",
          },
          { type: "h2", text: "2. No afiliación" },
          {
            type: "p",
            text: "Este sitio **no es oficial** y no está afiliado, asociado, autorizado ni respaldado por el Club Atlético Boca Juniors, la AFA, la CONMEBOL ni ninguna entidad relacionada. Las referencias a dichas entidades son únicamente descriptivas.",
          },
          { type: "h2", text: "3. Propiedad intelectual" },
          {
            type: "p",
            text: "Las marcas, nombres, escudos, imágenes y demás signos distintivos de clubes, torneos y competiciones pertenecen a sus respectivos titulares y se utilizan aquí con fines informativos y descriptivos, sin que ello implique cesión, licencia ni renuncia alguna de derechos. El logotipo, los textos y el diseño originales de este sitio pertenecen a sus autores.",
          },
          { type: "h2", text: "4. Fuente de los datos" },
          {
            type: "p",
            text: "La agenda, los resultados, las formaciones, los eventos y las estadísticas que se muestran en este sitio se obtienen de **ESPN** (espn.com), y se actualizan de forma automática. Los escudos mostrados pertenecen a sus respectivos clubes y se alojan en los servidores de ESPN. Agradecemos a ESPN por poner a disposición esta información con fines informativos.",
          },
          { type: "h2", text: "5. Exactitud de la información" },
          {
            type: "p",
            text: "La información puede contener errores, omisiones o estar desactualizada. Los horarios y fechas pueden cambiar por decisión de las organizaciones deportivas. **No garantizamos la exactitud, integridad ni vigencia** de los datos. Verificá siempre la información en los canales oficiales antes de tomar decisiones basadas en ella.",
          },
          { type: "h2", text: "6. Limitación de responsabilidad" },
          {
            type: "p",
            text: "En la máxima medida permitida por la ley, no seremos responsables por daños directos, indirectos, incidentales o consecuentes derivados del uso o de la imposibilidad de usar el sitio, ni por decisiones tomadas a partir de su información.",
          },
          { type: "h2", text: "7. Enlaces a terceros" },
          {
            type: "p",
            text: "El sitio puede contener enlaces a sitios de terceros (por ejemplo, el sitio oficial del club). No controlamos ni somos responsables por su contenido, políticas o disponibilidad.",
          },
          { type: "h2", text: "8. Uso prohibido" },
          {
            type: "ul",
            items: [
              "Usar el sitio para fines ilícitos o no autorizados.",
              "Suplantar la identidad de terceros o dar a entender que este sitio es oficial.",
              "Realizar extracción masiva de datos (scraping) que afecte el funcionamiento del servicio.",
              "Introducir código malicioso o interferir con la seguridad del sitio.",
            ],
          },
          { type: "h2", text: "9. Modificaciones" },
          {
            type: "p",
            text: "Podemos modificar estos Términos y el contenido del sitio en cualquier momento. Los cambios rigen desde su publicación en esta página.",
          },
          { type: "h2", text: "10. Ley aplicable y jurisdicción" },
          {
            type: "p",
            text: "Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales ordinarios competentes de la República Argentina.",
          },
          { type: "h2", text: "11. Contacto" },
          {
            type: "p",
            text: "Para consultas o reclamos, escribinos a [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },
    },
  },
};
