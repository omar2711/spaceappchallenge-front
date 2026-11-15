// Fuente: NASA (NSSDCA, science.nasa.gov, JPL). Fechas en UT.
// Donde falta un dato se usa TBD ("[por completar]"); no se inventa nada.
export const TBD = '[por completar]'

export type Body = 'moon' | 'mars' | 'beyond'

export const BODY_LABEL: Record<Body, string> = {
  moon: 'Luna',
  mars: 'Marte',
  beyond: 'Más allá',
}

export type ExtraSource = { label: string; url: string }

export type Artifact = {
  id: string
  body: Body
  name: string
  arrivalLabel: 'Llegada' | 'Lanzamiento' | 'Aterrizaje'
  arrival: string
  sortDate: string // AAAA-MM-DD, solo para ordenar
  place: string
  coords: string
  status: string
  whatHappened: string
  endDate: string
  endCause?: string
  note?: string
  sourceUrl: string
  extraSources?: ExtraSource[]
}

const list: Artifact[] = [
  {
    id: 'surveyor-3',
    body: 'moon',
    name: 'Surveyor 3',
    arrivalLabel: 'Llegada',
    arrival: '20 de abril de 1967 (aterrizó tras rebotar dos veces)',
    sortDate: '1967-04-20',
    place: 'Sureste de Oceanus Procellarum',
    coords: '3° S, 23.41° O',
    status: 'En la superficie, inactivo',
    whatHappened:
      'Módulo robótico de NASA/JPL. Cavó zanjas con su pala. Los astronautas del Apollo 12 lo visitaron y trajeron piezas, entre ellas la pala y el sistema de cámara.',
    endDate: 'Último contacto: 4 de mayo de 1967, dos días después de empezar la noche lunar.',
    sourceUrl: 'https://science.nasa.gov/mission/surveyor-3/',
  },
  {
    id: 'apollo-12-lm',
    body: 'moon',
    name: 'Apollo 12 · módulo lunar «Intrepid» y estación ALSEP',
    arrivalLabel: 'Llegada',
    arrival: '19 de noviembre de 1969 (UT)',
    sortDate: '1969-11-19',
    place: 'Oceanus Procellarum, a unos 180 m de Surveyor 3',
    coords: '3.0128° S, 23.4219° O',
    status:
      'Etapa de descenso y estación ALSEP en la superficie. Etapa de ascenso estrellada a propósito.',
    whatHappened:
      'La etapa de ascenso se estrelló contra la Luna. Produjo el primer sismo lunar artificial registrado.',
    endDate: 'Estación ALSEP apagada el 30 de septiembre de 1977.',
    note: 'La página de Surveyor 3 da otra fecha de llegada (18 de noviembre, por hora de EE. UU.). Aquí se usa UT.',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C',
  },
  {
    id: 'apollo-15-lm',
    body: 'moon',
    name: 'Apollo 15 · módulo lunar «Falcon» y estación ALSEP',
    arrivalLabel: 'Llegada',
    arrival: '30 de julio de 1971 (UT)',
    sortDate: '1971-07-30',
    place: 'Mare Imbrium, al pie de los montes Apeninos',
    coords: '26.13239° N, 3.63330° E',
    status: 'Etapa de descenso y ALSEP en la superficie. Etapa de ascenso estrellada.',
    whatHappened:
      'Llevó el primer vehículo lunar (LRV) usado en la Luna. Dejó una placa en memoria de 14 exploradores espaciales fallecidos.',
    endDate:
      'La etapa de ascenso impactó el 3 de agosto de 1971 en 26.36° N, 0.25° E. ALSEP apagado el 30 de septiembre de 1977.',
    sourceUrl: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
  },
  {
    id: 'viking-1',
    body: 'mars',
    name: 'Viking 1 (módulo de aterrizaje)',
    arrivalLabel: 'Llegada',
    arrival: '20 de julio de 1976',
    sortDate: '1976-07-20',
    place: 'Laderas occidentales de Chryse Planitia',
    coords: '22.483° N, 47.94° O',
    status: 'Módulo en la superficie. Orbitador apagado.',
    whatHappened:
      'Primer aterrizaje plenamente exitoso en Marte. El módulo dejó de funcionar tras recibir una orden defectuosa. El orbitador se quedó sin propelente de control de actitud.',
    endDate: 'Orbitador apagado el 7 de agosto de 1980. Módulo, el 11 de noviembre de 1982.',
    note: 'Otra página de NASA da fechas distintas para los orbitadores Viking. Aquí se usa la página de la misión.',
    sourceUrl: 'https://science.nasa.gov/mission/viking-1/',
  },
  {
    id: 'pathfinder-sojourner',
    body: 'mars',
    name: 'Mars Pathfinder y el rover Sojourner',
    arrivalLabel: 'Llegada',
    arrival: '4 de julio de 1997',
    sortDate: '1997-07-04',
    place: 'Ares Vallis',
    // TODO: añadir enlace de fuente adicional (coordenadas)
    coords: '19.33° N, 33.55° O (según JPL)',
    status: 'En la superficie, sin contacto',
    whatHappened:
      'Llegó dentro de bolsas de aire que rebotaron por la superficie. Soltó a Sojourner, el primer rover en Marte.',
    endDate: 'Última transmisión: 27 de septiembre de 1997.',
    endCause: TBD,
    note: 'JPL dice que probablemente fue la batería, pero la causa real quizá nunca se sepa.',
    sourceUrl: 'https://science.nasa.gov/mission/mars-pathfinder/',
    extraSources: [
      {
        label: 'JPL (causa del fin)',
        url: 'https://www.jpl.nasa.gov/news/mars-pathfinder-winds-down-after-phenomenal-mission/',
      },
    ],
  },
  {
    id: 'spirit',
    body: 'mars',
    name: 'Spirit',
    arrivalLabel: 'Llegada',
    arrival: '4 de enero de 2004 (UT)',
    sortDate: '2004-01-04',
    place: 'Cráter Gusev',
    coords: TBD,
    status: 'En la superficie, inactivo',
    whatHappened: 'Rover gemelo de Opportunity. Recorrió 7,73 km en más de 6 años.',
    endDate: 'Último contacto: 22 de marzo de 2010.',
    note: 'La página de la misión da el 3 de enero, por hora de EE. UU.',
    sourceUrl: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
    extraSources: [
      {
        label: 'JPL (último contacto)',
        url: 'https://www.jpl.nasa.gov/news/nasa-concludes-attempts-to-contact-mars-rover-spirit/',
      },
      {
        label: 'NSSDCA (distancia recorrida)',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A',
      },
    ],
  },
  {
    id: 'opportunity',
    body: 'mars',
    name: 'Opportunity',
    arrivalLabel: 'Llegada',
    arrival: '25 de enero de 2004 (UT)',
    sortDate: '2004-01-25',
    place: 'Meridiani Planum',
    coords: TBD,
    status: 'En la superficie, inactivo',
    whatHappened:
      'Recorrió 45,16 km. Se quedó en silencio cuando una tormenta de polvo cubrió el planeta.',
    endDate:
      'Último contacto: 10 de junio de 2018. Misión declarada terminada el 13 de febrero de 2019.',
    note: 'La página de la misión da el 24 de enero, por hora de EE. UU.',
    sourceUrl: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
    extraSources: [
      {
        label: 'JPL (fin de la misión)',
        url: 'https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/',
      },
    ],
  },
  {
    id: 'insight',
    body: 'mars',
    name: 'InSight',
    arrivalLabel: 'Llegada',
    arrival: '26 de noviembre de 2018',
    sortDate: '2018-11-26',
    place: 'Elysium Planitia',
    coords: 'Unos 4.5° N, 135.9° E',
    status: 'En la superficie, retirado',
    whatHappened:
      'Midió sismos de Marte. El polvo cubrió sus paneles solares y no pudo recargar las baterías.',
    endDate: '15 de diciembre de 2022',
    sourceUrl: 'https://science.nasa.gov/mission/insight/',
    // TODO: añadir enlace de fuente adicional (causa del fin)
  },
  {
    id: 'ingenuity',
    body: 'mars',
    name: 'Ingenuity (helicóptero)',
    arrivalLabel: 'Llegada',
    arrival: '18 de febrero de 2021',
    sortDate: '2021-02-18',
    place: 'Cráter Jezero, zona «Valinor Hills»',
    coords: TBD,
    status: 'En la superficie, sin poder volar. Funciona como banco de pruebas fijo.',
    whatHappened:
      'Primera aeronave con motor en volar en otro planeta (19 de abril de 2021). Hizo 72 vuelos y 17,0 km. Un aterrizaje brusco en el último vuelo dañó sus palas.',
    endDate: 'Último vuelo: 18 de enero de 2024. Misión completada: 25 de enero de 2024.',
    sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
    extraSources: [
      {
        label: 'JPL (causa del fin y estado)',
        url: 'https://www.jpl.nasa.gov/news/nasas-ingenuity-mars-helicopter-team-says-goodbye-for-now/',
      },
    ],
  },
  // MÁS ALLÁ: no están en la Luna ni en Marte.
  {
    id: 'pioneer-10',
    body: 'beyond',
    name: 'Pioneer 10',
    arrivalLabel: 'Lanzamiento',
    arrival: '2 de marzo de 1972',
    sortDate: '1972-03-02',
    place: 'Saliendo del sistema solar, rumbo a Aldebarán',
    coords: 'No aplica (no está en una superficie)',
    status: 'En el espacio interestelar',
    whatHappened:
      'Pasó cerca de Júpiter (máxima aproximación: 4 de diciembre de 1973). El contacto rutinario terminó el 31 de marzo de 1997 por razones de presupuesto. Su última señal llegó cuando la fuente de energía ya no alimentaba bien el transmisor.',
    endDate: 'Última señal: 23 de enero de 2003.',
    sourceUrl: 'https://science.nasa.gov/mission/pioneer-10/',
  },
  {
    id: 'near-shoemaker',
    body: 'beyond',
    name: 'NEAR Shoemaker',
    arrivalLabel: 'Aterrizaje',
    arrival: '12 de febrero de 2001, en el asteroide Eros',
    sortDate: '2001-02-12',
    place: 'Superficie de Eros, al sur de Himeros',
    coords: TBD,
    status: 'En la superficie del asteroide Eros',
    whatHappened:
      'Entró en órbita de Eros el 14 de febrero de 2000 y aterrizó en el asteroide el 12 de febrero de 2001.',
    endDate: 'Último contacto: 28 de febrero de 2001, por el frío extremo (unos −173 °C).',
    sourceUrl: 'https://science.nasa.gov/mission/near-shoemaker/',
  },
  {
    id: 'dawn',
    body: 'beyond',
    name: 'Dawn',
    arrivalLabel: 'Lanzamiento',
    arrival: '27 de septiembre de 2007',
    sortDate: '2007-09-27',
    place: 'Órbita de Ceres',
    coords: 'No aplica (está en órbita)',
    status: 'En órbita de Ceres',
    whatHappened:
      'Orbitó Vesta y Ceres. Al quedarse sin combustible, NASA dio por terminada la misión; Dawn sigue dando vueltas a Ceres como una "luna" nueva.',
    endDate: 'Fin de la misión: 1 de noviembre de 2018, sin combustible.',
    sourceUrl: 'https://science.nasa.gov/mission/dawn/',
  },
  {
    id: 'kepler',
    body: 'beyond',
    name: 'Kepler',
    arrivalLabel: 'Lanzamiento',
    arrival: '6 de marzo de 2009',
    sortDate: '2009-03-06',
    place: 'Órbita alrededor del Sol',
    coords: 'No aplica (está en órbita)',
    status: 'Retirado, en órbita alrededor del Sol',
    whatHappened:
      'Se retiró al quedarse sin combustible, dentro de una órbita segura y lejos de la Tierra.',
    endDate: 'Retirado el 30 de octubre de 2018, al quedarse sin combustible.',
    sourceUrl: 'https://science.nasa.gov/mission/kepler/',
  },
]

// Orden cronológico por fecha de llegada (o lanzamiento / aterrizaje).
export const artifacts: Artifact[] = [...list].sort((a, b) => a.sortDate.localeCompare(b.sortDate))
