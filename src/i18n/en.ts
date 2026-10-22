import type { DictShape } from "./types.ts";
import { es } from "./es.ts";

/**
 * Diccionario en inglés. Tiene que tener **exactamente** las mismas claves que
 * `es.ts`: si falta o sobra una, el typecheck falla.
 */
export const en: DictShape<typeof es> = {
  meta: {
    siteName: "Cuando Juega el Xeneize",
    defaultTitle: "When Does Boca Juniors Play — Upcoming Matches",
    defaultDescription:
      "When does Boca Juniors play: upcoming matches, rivals, kickoff times and results for the Xeneize. Unofficial site. Official channel: bocajuniors.com.ar",
    appName: "Cuando Juega!",
    unofficial: "Unofficial site",
  },

  nav: {
    home: "Home",
    info: "Info",
    install: "Install App 📥",
    installShort: "Install app",
    openMenu: "Open menu",
    main: "Main",
    legal: "Legal",
    brandHome: "Cuando Juega el Xeneize — Home",
    languageSwitcher: "Language",
    switchToEnglish: "English",
    switchToSpanish: "Español",
  },

  footer: {
    disclaimer:
      "Unofficial site. Not affiliated with the AFA or Club Atlético Boca Juniors.",
    data: "Fixtures, results and stats provided by ESPN.",
    cookiesText:
      "By continuing to browse you accept the use of statistics cookies. You can reject them or read more in the Cookie Policy.",
    cookiesPolicy: "Cookie Policy",
    copyright: "© {year} Cuando Juega el Xeneize",
    terms: "Terms",
    privacy: "Privacy",
    cookiesLink: "Cookies",
    contact: "Contact",
  },

  cookieBanner: {
    label: "Cookie notice",
    text: "We use local storage for the site to work and, with your permission, statistics cookies (Google Analytics 4 and Microsoft Clarity) to learn how it is used. You can accept or reject the statistics ones. More info in the cookie policy.",
    accept: "Accept",
    reject: "Reject",
  },

  install: {
    text: "Install Cuando Juega el Xeneize as an app: direct access from your home screen, no stores.",
    ios: "On iPhone/iPad: tap Share and then Add to Home Screen.",
    install: "Install",
    dismiss: "Not now",
  },

  notify: {
    compact:
      "Want a reminder? Turn on notifications and you will know 1 hour before kickoff, when the line-ups come out.",
    title: "Notifications",
    full: "Turn on alerts and we will notify you 1 hour before Boca plays. No spam: one alert per match.",
    enableShort: "Turn on alerts",
    enable: "Turn on notifications",
    disable: "Turn off notifications",
    ios: "On iPhone/iPad install the app first (Share → Add to Home Screen) and then turn on notifications from the installed icon.",
    soonLabel: "Coming soon:",
    soon: "you will be able to turn on alerts so we can notify you when Boca is about to play.",
    unsupported: "Your browser does not support notifications.",
    enabled: "Notifications enabled.",
    disabled: "Notifications disabled.",
    denied: "Permission denied. You can enable it from your browser.",
    ready: "All set! You will get the alert 1 hour before kickoff.",
    error: "Could not enable: {message}",
  },

  share: {
    label: "Share",
    close: "Close",
    copy: "Copy link",
    asImage: "Share as image",
    shareImage: "Share image",
    downloadImage: "Download image",
    copied: "Link copied",
  },

  timeline: {
    heading: "Boca Juniors upcoming matches",
    filterLabel: "Filter matches",
    tabs: {
      previous: "PAST",
      all: "ALL",
      upcoming: "UPCOMING",
    },
    groups: {
      previous: "PAST",
      live: "LIVE",
      next: "NEXT",
      upcoming: "UPCOMING",
    },
    badges: {
      finished: "FULL-TIME",
      live: "LIVE",
      next: "NEXT",
      scheduled: "SCHEDULED",
    },
    noUpcoming:
      "There are no upcoming matches right now. The fixtures update automatically as soon as a new date is confirmed.",
    noMatches: "No matches available right now.",
    timeTbd: "Kickoff time to be confirmed",
    aggregate: "Aggregate: Boca {boca} - {rival} {rivalName}",
    aggregateShort: "Aggregate {boca}-{rival}",
    penalties: "(pen. {boca}-{rival})",
    leaders: {
      leading: "Boca ahead",
      behind: "Boca behind",
      tied: "Tied series",
    },
    viewDetail: "View details: {teams}",
  },

  status: {
    finished: "Full-time",
    live: "Live",
    next: "Next",
    scheduled: "Scheduled",
  },

  condition: {
    home: "Home",
    away: "Away",
  },

  dates: {
    long: "{month} {day}, {year}",
    hour: "{time}",
  },

  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],

  monthsShort: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],

  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

  countdown: {
    days: "{n} days to go",
    oneDay: "1 day to go",
    today: "Today",
    imminent: "Kickoff imminent",
    hours: "{n} h to go",
  },

  formation: {
    starters: "Starting XI",
    keeper: "Goalkeeper",
    defenders: "Defenders",
    midfielders: "Midfielders",
    forwards: "Forwards",
  },

  competitions: {
    "arg.1": "Argentine Primera División",
    "arg.copa": "Copa Argentina",
    "conmebol.libertadores": "Copa Libertadores",
    "conmebol.sudamericana": "Copa Sudamericana",
  },

  phases: {
    "torneo-apertura": "Apertura Tournament",
    "torneo-clausura": "Clausura Tournament",
    "group-stage": "Group Stage",
    "knockout-round-playoffs": "Playoffs",
    "round-of-64": "Round of 64",
    "round-of-32": "Round of 32",
    "round-of-16": "Round of 16",
    quarterfinals: "Quarter-finals",
    semifinals: "Semi-finals",
    final: "Final",
  },

  rounds: {
    matchday: "Matchday {n}",
    legs: {
      first: "First leg",
      second: "Second leg",
    },
  },

  seo: {
    titleFinished: "Boca {boca} - {rivalScore} {rival}: full-time result ({competition}) | Cuando Juega el Xeneize",
    titleLive: "Boca vs {rival} live: score and stats ({competition}) | Cuando Juega el Xeneize",
    titleUpcoming: "Boca vs {rival}: date, kickoff time and how to watch ({competition}) | Cuando Juega el Xeneize",
    descFinished:
      "Result of {score}: how Boca went out in {competition}{round} on {date}. Aggregate, line-ups and stats. Unofficial site.",
    descLive:
      "Boca vs {rival} live in {competition}: current score, events and match stats. Unofficial site.",
    descUpcoming:
      "Boca vs {rival} in {competition}{round} on {date}{hour}{venue}. Line-ups, history and how to watch. Unofficial site.",
    hour: " at {time}",
    venue: " at {venue}",
    round: " ({round})",
    eventDescription: "{teams} for {competition}{round} on {date}{hour}.",
    eventHour: " at {time}",
  },

  faq: {
    qWhen: "When does Boca play vs {rival}?",
    aWhen: "Boca vs {rival} is played on {day} {date}{hour}, in the {tournament}.",
    qTime: "What time does Boca play vs {rival}?",
    aTime: "At {time} (Argentina time).",
    qWhere: "Where does Boca play vs {rival}?",
    aWhere: "At {venue}.",
    qChannel: "Which TV channel shows Boca vs {rival}?",
    aChannel: "On {channel}.",
    qTournament: "Which competition does Boca play vs {rival} in?",
    aTournament: "In the {tournament}.",
    qResult: "How did Boca vs {rival} end?",
    aResult: "{score}",
    aResultAggregate: " Aggregate: Boca {boca} - {rival} {rivalName}.",
  },

  preview: {
    hosts: "hosts",
    visits: "visits",
    text: "Boca {verb} {rival} in the {tournament} on {date}{hour}{venue}. Line-ups, stats and the result are updated close to kickoff.",
  },

  facts: {
    leading: "Boca leads the tie {boca} to {rival}.",
    behind: "Boca is behind on aggregate: {boca} to {rival}.",
    tied: "The tie is level at {boca} to {rival}.",
    penalties: "First leg penalties: Boca {boca} - {rival}.",
    home: "Boca plays at home at {venue}{city}.",
    away: "Boca plays away at {venue}{city}.",
    city: " ({city})",
    form: "In the last {n} matches: {w} {win}{wPlural}, {d} {draw}{dPlural} and {l} {loss}{lPlural}.",
    win: "win",
    winPlural: "s",
    draw: "draw",
    drawPlural: "s",
    loss: "loss",
    lossPlural: "es",
    lastMatch: "Last match: {text}.",
  },

  match: {
    vs: "vs",
    global: "Aggregate",
    penalties: "Penalties",
    advanced: "Boca qualified for the next round",
    inProgress: "Match in progress",
    timeTbd: "Kickoff time to be confirmed",
    venueTbd: "To be confirmed",
    labelDate: "Date",
    labelVenue: "Stadium",
    labelTournament: "Competition",
    labelTv: "TV",
    shareResult: "Share result",
    shareLive: "Share live",
    shareMatch: "Share match",
    previewFinished: "Match summary",
    previewLive: "Live",
    previewUpcoming: "Match preview",
    noContent:
      "There is no extended content for this match yet. The match sheet and the result update automatically.",
    breadcrumb: "Breadcrumb",
    breadcrumbHome: "Home",
    breadcrumbMatches: "Matches",
    backToMatches: "← Back to all matches",
    updatedAt: "Data updated: {date} (Argentina time).",
  },

  eventTypes: {
    goal: "Goal",
    "penalty-goal": "Goal (penalty)",
    "own-goal": "Own goal",
    "penalty-missed": "Penalty missed",
    "yellow-card": "Yellow card",
    "yellow-redcard": "Red card (2nd yellow)",
    "red-card": "Red card",
    substitution: "Substitution",
    event: "Event",
  },

  stats: {
    foulsCommitted: "Fouls",
    yellowCards: "Yellow cards",
    redCards: "Red cards",
    offsides: "Offsides",
    wonCorners: "Corners",
    saves: "Saves",
    possessionPct: "Possession",
    totalShots: "Shots",
    shotsOnTarget: "Shots on target",
    shotPct: "Shots on target (%)",
    penaltyKickGoals: "Penalty goals",
    penaltyKickShots: "Penalties",
    accuratePasses: "Accurate passes",
    totalPasses: "Passes",
    passPct: "Pass accuracy (%)",
    totalCrosses: "Crosses",
    crossPct: "Cross accuracy (%)",
    totalLongBalls: "Long balls",
    blockedShots: "Blocked shots",
    totalTackles: "Tackles",
    interceptions: "Interceptions",
    totalClearance: "Clearances",
  },

  sections: {
    lineups: "Line-ups",
    lineupsProbable: " (probable)",
    lineupsSoon: "They will be published close to kickoff.",
    lineupsNotify: "We will notify you as soon as they are confirmed.",
    lineupsUnofficial: "Unofficial, it may change until confirmed.",
    subs: "Substitutes {team} ({count})",
    events: "Match events",
    stats: "Match stats",
    keyFacts: "Key facts",
    recent: "Latest matches",
    faq: "Frequently asked questions",
    techTitle: "Match sheet",
    techDate: "Date",
    techVenue: "Stadium",
    techTournament: "Competition",
    techPhase: "Round",
    techReferee: "Referee",
    techTv: "TV",
    tbd: "To be confirmed",
    referee: "Referee: {referee}.",
    formWin: "Won",
    formDraw: "Drew",
    formLoss: "Lost",
    subDetail: "{out} off, {in} on",
  },

  feed: {
    description: "Boca Juniors upcoming matches and results. Unofficial site.",
  },

  og: {
    brand: "WHEN DOES BOCA PLAY",
    title: "WHEN DOES BOCA JUNIORS PLAY",
    subtitle: "Next match, date, kickoff time, opponent and recent results",
    url: "cuandojuegaelxeneize.com.ar",
  },

  llms: {
    title: "When Does Boca Play",
    description:
      "Independent (NOT official) information site showing when Boca Juniors play: next match, date, kickoff time, opponent, competition, TV channel and recent results. Content in English.",
    keyFactsTitle: "Key facts:",
    keyFacts: [
      '- Purpose: answer "when does Boca play?" quickly with fixtures and results.',
      "- Unofficial site: not affiliated with Boca Juniors, the AFA or CONMEBOL. Official channel: https://www.bocajuniors.com.ar",
      "Data source: ESPN public API (site.api.espn.com).",
      "- The data may contain errors or be out of date; double-check on the official channels.",
      "Contact: delnorte.destinos@gmail.com",
    ],
    pagesTitle: "Pages:",
    pages: {
      home: "Home (fixtures and next match)",
      matches: "All matches",
      info: "About, FAQ and data sources",
      contact: "Contact",
      terms: "Terms",
      privacy: "Privacy",
      cookies: "Cookies",
    },
    matchesTitle: "Matches:",
    status: {
      finished: "Full-time",
      upcoming: "Upcoming",
    },
    matchLine: "- [{status}] Boca vs {rival} — {date}{time} — {competition} — {url}",
  },

  pages: {
    home: {
      title: "When Does Boca Juniors Play — Next Match and Results",
      description:
        "When does Boca Juniors play: next match, date, kickoff time, opponent and recent results. Unofficial Boca Juniors fixtures site.",
      h1: "When does Boca Juniors play",
      shareTitle: "When does Boca Juniors play",
      shareText: "Boca Juniors upcoming matches, kickoff times and results",
      seeAll: "See all matches →",
    },

    matches: {
      title: "Boca Juniors Matches — Fixtures and Results | Cuando Juega el Xeneize",
      description:
        "All Boca Juniors matches: upcoming fixtures and recent results with line-ups, stats and aggregate score. Unofficial site.",
      h1: "Boca Juniors matches",
      intro:
        "Boca Juniors fixtures and results. Open any match to see line-ups, stats and the aggregate score of two-legged ties.",
      upcoming: "Upcoming matches",
      results: "Results",
      empty: "No matches available right now.",
    },

    rivals: {
      title: "Boca Juniors Rivals — Matches and Results | Cuando Juega el Xeneize",
      description:
        "All Boca Juniors rivals with their matches and results. Open the history of each rival. Unofficial site.",
      h1: "Boca Juniors rivals",
      intro: "Matches and results of Boca against every rival.",
      one: "match",
      many: "matches",
      detailTitle: "Boca vs {rival} — Matches and Results | Cuando Juega el Xeneize",
      detailDescription:
        "All Boca Juniors matches against {rival}: results, upcoming fixtures and stats. Unofficial site.",
      detailIntro: "Boca Juniors matches against {rival}: results and upcoming fixtures.",
      breadcrumb: "Rivals",
      back: "← All rivals",
    },

    tournaments: {
      title: "Boca Juniors Competitions — Fixtures and Results | Cuando Juega el Xeneize",
      description:
        "Leagues and cup competitions Boca Juniors plays in, with fixtures and results. Unofficial site.",
      h1: "Boca Juniors competitions",
      intro: "Leagues and cup competitions Boca plays in, with fixtures and results.",
      one: "match",
      many: "matches",
      detailTitle: "Boca in {tournament} — Fixtures and Results | Cuando Juega el Xeneize",
      detailH1: "Boca in {tournament}",
      detailDescription:
        "Boca Juniors matches in {tournament}: fixtures, results and upcoming games. Unofficial site.",
      detailIntro: "Boca Juniors fixtures and results in {tournament}.",
      breadcrumb: "Competitions",
      back: "← All competitions",
    },

    info: {
      title: "About",
      description:
        "Who we are, frequently asked questions, data sources, notifications and contact info for Cuando Juega el Xeneize.",
      intro:
        "Everything you need to know about **Cuando Juega el Xeneize**: what it is, where the data comes from, how it is updated and how to reach us.",
      aboutTitle: "Who we are",
      about1:
        "We are an independent fan-run information site whose only goal is to show, quickly and clearly, **when Boca Juniors play**, with their upcoming matches, kickoff times and results.",
      about2:
        "**This is not an official site:** we are not affiliated, associated, authorised or endorsed by Club Atlético Boca Juniors, the AFA or CONMEBOL. The official channel is [bocajuniors.com.ar](https://www.bocajuniors.com.ar).",
      faqTitle: "Frequently asked questions",
      sourcesTitle: "Data sources",
      sourcesText:
        "The fixtures, results, line-ups and stats are built from the public **ESPN** API (site.api.espn.com). We do our best, but the information may contain errors, be incomplete or out of date. We do not guarantee its accuracy.",
      contactTitle: "Contact",
      contactText:
        "For questions, corrections or claims write to [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com) or visit the [Contact]({contact}) page.",
      legalTitle: "Legal",
      faqs: [
        {
          q: "When does Boca play?",
          a: "The home page always shows the next highlighted match with its date, kickoff time, opponent and competition. Below it you will find the recent results and the upcoming fixtures.",
        },
        {
          q: "Is this an official site?",
          a: "No. Cuando Juega el Xeneize is an independent information site, not affiliated with or endorsed by Club Atlético Boca Juniors, the AFA or CONMEBOL. The official channel is bocajuniors.com.ar.",
        },
        {
          q: "Where does the match data come from?",
          a: "From the public ESPN API (site.api.espn.com). The information may contain errors or be out of date; always double-check on the official channels.",
        },
        {
          q: "Where can I watch the match?",
          a: "When the data is available, we show the TV channel on the highlighted match. If it is missing, the broadcast may not be confirmed yet.",
        },
        {
          q: "How are the results updated?",
          a: "An automatic process completes the results of matches already played and keeps the fixtures up to date. Still, when in doubt, trust the official information.",
        },
        {
          q: "How do you use cookies and analytics?",
          a: "We use analytics cookies (Google Analytics 4 and Microsoft Clarity) to understand how the site is used. In the European Union, the European Economic Area, the United Kingdom, Switzerland and Brazil we ask for prior consent; everywhere else we assume you accept them by continuing to browse. You can reject them and read the details in the Cookie Policy.",
        },
      ],
    },

    contact: {
      title: "Contact",
      description:
        "Contact Cuando Juega el Xeneize for questions, corrections and legal claims.",
      intro: "For questions, data corrections, suggestions or claims, write to us at:",
      email: "delnorte.destinos@gmail.com",
      ipTitle: "Intellectual property claims",
      ipText:
        "If you hold rights and believe that any content on this site infringes them, write to us with the content in question, proof of your rights and a way to contact you. We will handle the request promptly and, where appropriate, remove or modify the content.",
      linksTitle: "Other links",
      links: {
        about: "Who we are",
        terms: "Terms and Conditions",
        privacy: "Privacy Policy",
        cookies: "Cookie Policy",
      },
    },

    notFound: {
      title: "Page not found — Cuando Juega el Xeneize",
      description: "The page you are looking for does not exist. Go back home to see when Boca Juniors play.",
      code: "Error 404",
      h1: "Page not found",
      text: "The page you are looking for does not exist or has moved.",
      back: "Back to home",
    },

    legal: {
      updated: "Last updated: {date}",
      cookies: {
        title: "Cookie Policy",
        description:
          "Which cookies and local storage Cuando Juega el Xeneize uses and how to manage them.",
        blocks: [
          {
            type: "p",
            text: "This page explains which cookies and local storage technologies the site uses and how you can manage them.",
          },
          { type: "h2", text: "1. What they are" },
          {
            type: "p",
            text: "Cookies are small files a site stores in your browser. Local storage (localStorage) is a similar technology that lets a site keep information on your device.",
          },
          { type: "h2", text: "2. What we use" },
          {
            type: "ul",
            items: [
              "**Necessary (always on):** local storage to keep a copy of the matches and your cookie preference. It is essential for the site to work and does not require consent.",
              "**Analytics (optional):** Google Analytics 4 and Microsoft Clarity, which only load if you accept. GA4 measures site usage in an aggregated and anonymous way (with IP anonymisation); Clarity provides heatmaps and anonymised session recordings to understand the user experience.",
              "**Advertising (optional):** Google AdSense and its partners may use cookies to show ads, including personalised ads based on your browsing. Where required, prior consent is requested through Google's consent management platform (CMP).",
            ],
          },
          { type: "h2", text: "3. How to manage them" },
          {
            type: "p",
            text: "If you are in the **European Union, the European Economic Area, the United Kingdom, Switzerland or Brazil**, we show you a notice to **accept or reject** the analytics cookies before they load.",
          },
          {
            type: "p",
            text: "In the **rest of the world** (for example, **Argentina**), we assume that **continuing to browse means you accept** analytics and advertising cookies. In every case your choice is stored in your browser and you can change it by clearing local storage or from your browser settings.",
          },
          {
            type: "p",
            text: "For **advertising**, in the regions that require it (EEA, UK and Switzerland), Google also shows a consent notice (CMP) for personalised ads.",
          },
          { type: "h2", text: "4. More information" },
          {
            type: "p",
            text: "See also the [Privacy Policy]({privacy}). Questions: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },

      privacy: {
        title: "Privacy Policy",
        description:
          "How Cuando Juega el Xeneize handles data and local storage, including Google Analytics and Microsoft Clarity.",
        blocks: [
          {
            type: "p",
            text: "This Policy describes how information is handled on this site, in line with the Argentine Personal Data Protection Act No. 25,326 and general privacy criteria.",
          },
          { type: "h2", text: "1. Controller" },
          {
            type: "p",
            text: "The controller of this site is **Cuando Juega el Xeneize**. Contact: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
          { type: "h2", text: "2. What data we process" },
          {
            type: "p",
            text: "We do not request or store personally identifiable data (name, national ID, phone number, etc.) to use the site. We may process:",
          },
          {
            type: "ul",
            items: [
              "**Local storage (localStorage):** we keep a copy of the matches and your cookie preference in your own browser, to improve loading speed and behaviour. It is not sent to our servers.",
              "**Hosting provider logs:** the hosting service may record technical data (IP address, date/time, browser type) for security and operations.",
              "**Usage data (analytics):** if you accept analytics cookies, Google Analytics 4 collects aggregated and anonymous browsing data (page views, device, approximate location) and Microsoft Clarity collects heatmaps and anonymised session recordings.",
              "**Advertising data:** Google AdSense and its partners may process data (such as cookie identifiers and IP) to show ads, including personalised ones. Where required, prior consent is requested.",
              "**Push notifications (optional):** if you enable alerts, we store your device identifier (push endpoint) and your preferences, solely to notify you before each match and with the final result. You can disable them at any time and have your data deleted by writing to us.",
            ],
          },
          { type: "h2", text: "3. Cookies and local storage" },
          {
            type: "p",
            text: "We use local storage required for the site to work and analytics cookies. If you are in the European Union, the European Economic Area, the United Kingdom, Switzerland or Brazil, we ask for prior consent for the latter. In the rest of the world, we assume that continuing to browse means you accept them. You can reject them or change your choice at any time. See the [Cookie Policy]({cookies}).",
          },
          { type: "h2", text: "4. Google Analytics and Microsoft Clarity" },
          {
            type: "p",
            text: "When you accept analytics cookies, Google Analytics 4 loads with IP anonymisation to measure site usage in an aggregated way, and Microsoft Clarity loads to generate heatmaps and anonymised session recordings. Google and Microsoft may process this data under their own policies. If you reject, neither of them loads.",
          },
          { type: "h2", text: "5. Advertising (Google AdSense)" },
          {
            type: "p",
            text: "This site may show ads through **Google AdSense** and its advertising partners. They may use cookies and identifiers to serve ads, including personalised ads based on your browsing. In the regions that require it (EEA, UK and Switzerland) prior consent is requested through Google's consent management platform (CMP). You can manage or turn off personalised ads at [adssettings.google.com](https://adssettings.google.com).",
          },
          { type: "h2", text: "6. Purpose and basis" },
          {
            type: "p",
            text: "We process data to run and improve the site, guarantee its security and, with your consent, obtain usage statistics and show ads. We do not sell or transfer personal data to third parties for commercial purposes.",
          },
          { type: "h2", text: "7. Your rights" },
          {
            type: "p",
            text: "You can request access, rectification, updating or deletion of your personal data by writing to [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com). The Agencia de Acceso a la Información Pública is the controlling body in Argentina (Act 25,326).",
          },
          { type: "h2", text: "8. Security" },
          {
            type: "p",
            text: "We adopt reasonable measures to protect the information. No system is 100% secure, so we cannot guarantee absolute security.",
          },
          { type: "h2", text: "9. Minors" },
          {
            type: "p",
            text: "This site is not aimed at minors and does not deliberately collect data from minors.",
          },
          { type: "h2", text: "10. Changes" },
          {
            type: "p",
            text: "We may update this Policy. The last updated date is shown at the top of the page.",
          },
          { type: "h2", text: "11. Contact" },
          {
            type: "p",
            text: "For any privacy question: [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },

      terms: {
        title: "Terms and Conditions",
        description:
          "Terms and conditions of use for Cuando Juega el Xeneize, an unofficial information site.",
        blocks: [
          {
            type: "p",
            text: "By accessing and using this site you accept these Terms and Conditions. If you do not agree, please do not use the site.",
          },
          { type: "h2", text: "1. Service description" },
          {
            type: "p",
            text: "This site provides information about the Boca Juniors match schedule (dates, kickoff times, opponents, competitions and results). It is a **free, informational** service, provided \"as is\" and \"as available\", without any kind of guarantee.",
          },
          { type: "h2", text: "2. No affiliation" },
          {
            type: "p",
            text: "This site **is not official** and is not affiliated, associated, authorised or endorsed by Club Atlético Boca Juniors, the AFA, CONMEBOL or any related entity. References to those entities are purely descriptive.",
          },
          { type: "h2", text: "3. Intellectual property" },
          {
            type: "p",
            text: "The brands, names, crests, images and other distinctive signs of clubs, tournaments and competitions belong to their respective owners and are used here for informational and descriptive purposes only, without any assignment, licence or waiver of rights. The logo, original texts and design of this site belong to their authors.",
          },
          { type: "h2", text: "4. Source of the data" },
          {
            type: "p",
            text: "The fixtures, results, line-ups, events and stats shown on this site come from **ESPN** (espn.com) and are updated automatically. The crests displayed belong to their respective clubs and are hosted on ESPN's servers. We thank ESPN for making this information available for informational purposes.",
          },
          { type: "h2", text: "5. Accuracy of the information" },
          {
            type: "p",
            text: "The information may contain errors, omissions or be out of date. Kickoff times and dates may change at the discretion of the sporting organisations. **We do not guarantee the accuracy, completeness or currency** of the data. Always check the official channels before making decisions based on it.",
          },
          { type: "h2", text: "6. Limitation of liability" },
          {
            type: "p",
            text: "To the fullest extent permitted by law, we are not liable for any direct, indirect, incidental or consequential damages arising from the use of, or inability to use, the site, nor for decisions taken on the basis of its information.",
          },
          { type: "h2", text: "7. Third-party links" },
          {
            type: "p",
            text: "The site may contain links to third-party sites (for example, the club's official site). We do not control them and are not responsible for their content, policies or availability.",
          },
          { type: "h2", text: "8. Prohibited use" },
          {
            type: "ul",
            items: [
              "Using the site for unlawful or unauthorised purposes.",
              "Impersonating third parties or giving the impression that this site is official.",
              "Mass data extraction (scraping) that affects the operation of the service.",
              "Introducing malicious code or interfering with the site's security.",
            ],
          },
          { type: "h2", text: "9. Changes" },
          {
            type: "p",
            text: "We may change these Terms and the site content at any time. Changes take effect as soon as they are published on this page.",
          },
          { type: "h2", text: "10. Governing law and jurisdiction" },
          {
            type: "p",
            text: "These Terms are governed by the laws of the Argentine Republic. Any dispute will be submitted to the ordinary courts of the Argentine Republic.",
          },
          { type: "h2", text: "11. Contact" },
          {
            type: "p",
            text: "For questions or claims, write to [delnorte.destinos@gmail.com](mailto:delnorte.destinos@gmail.com).",
          },
        ],
      },
    },
  },
};
