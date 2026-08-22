// type: "choice" | "text"
export const questSteps = [
  {
    placeId: "bayanaul",
    videoLabel: {
      ru: "Гранитные скалы и сосновые леса Баянаула",
      kz: "Баянауылдың гранит жартастары мен қарағай ормандары",
      en: "The granite cliffs and pine forests of Bayanaul",
    },
    question: {
      ru: "Как называется одно из самых известных озёр национального парка Баянаул?",
      kz: "Баянауыл ұлттық паркінің ең танымал көлдерінің бірі қалай аталады?",
      en: "What is the name of one of the most famous lakes in Bayanaul National Park?",
    },
    type: "text",
    acceptedAnswers: ["жасыбай", "озеро жасыбай", "жасыбай көлі", "жасыбай коли", "zhasybai", "zhasybai lake"],
    correctDisplay: { ru: "Жасыбай", kz: "Жасыбай", en: "Zhasybai" },
    explanation: {
      ru: "Озеро Жасыбай названо в честь батыра, погибшего в этих местах. Это одно из самых живописных мест Баянаульского нацпарка.",
      kz: "Жасыбай көлі осы жерде қаза тапқан батыр құрметіне аталған. Бұл Баянауыл ұлттық паркінің ең көрікті жерлерінің бірі.",
      en: "Lake Zhasybai is named after a batyr who died in this area. It's one of the most scenic spots in Bayanaul National Park.",
    },
  },
  {
    placeId: "korgalzhyn",
    videoLabel: {
      ru: "Розовые фламинго Коргалжынского заповедника",
      kz: "Қорғалжын қорығының қызғылт фламингосы",
      en: "The greater flamingos of Korgalzhyn Reserve",
    },
    question: {
      ru: "Какой природный объект особенно известен в Коргалжынском заповеднике?",
      kz: "Қорғалжын қорығында қандай табиғи нысан ерекше танымал?",
      en: "What natural feature is Korgalzhyn Reserve especially known for?",
    },
    type: "choice",
    options: {
      ru: ["Фламинго", "Верблюд", "Архар", "Медведь"],
      kz: ["Фламинго", "Түйе", "Арқар", "Аю"],
      en: ["Flamingo", "Camel", "Argali", "Bear"],
    },
    correctIndex: 0,
    explanation: {
      ru: "Коргалжынский заповедник — самая северная точка гнездования розовых фламинго в мире.",
      kz: "Қорғалжын қорығы — әлемдегі қызғылт фламингоның ең солтүстіктегі ұя салу нүктесі.",
      en: "Korgalzhyn Reserve is the world's northernmost nesting site of the greater flamingo.",
    },
  },
  {
    placeId: "karkaraly",
    videoLabel: {
      ru: "Сосновые леса на гранитных сопках Каркаралы",
      kz: "Қарқаралының гранит адырларындағы қарағай орманы",
      en: "Pine forest on the granite hills of Karkaraly",
    },
    question: {
      ru: "Каркаралы часто называют «островом» посреди степи. Каким?",
      kz: "Қарқаралыны дала ортасындағы «арал» деп жиі атайды. Қандай?",
      en: "Karkaraly is often called an “island” in the middle of the steppe. What kind?",
    },
    type: "choice",
    options: {
      ru: ["Островом тайги", "Островом пустыни", "Островом песка", "Островом льда"],
      kz: ["Тайга аралы", "Шөл аралы", "Құм аралы", "Мұз аралы"],
      en: ["Island of taiga", "Island of desert", "Island of sand", "Island of ice"],
    },
    correctIndex: 0,
    explanation: {
      ru: "Хвойный лес на гранитных сопках Каркаралы настолько нехарактерен для степи, что этот массив называют «островом тайги в степи».",
      kz: "Қарқаралының гранит адырларындағы қылқанды орман далаға тым тән емес, сондықтан бұл массив «даладағы тайга аралы» деп аталады.",
      en: "The coniferous forest on Karkaraly's granite hills is so atypical for the steppe that the area is called a “taiga island in the steppe”.",
    },
  },
  {
    placeId: "ulytau",
    videoLabel: {
      ru: "Древние горы и мавзолеи Улытау",
      kz: "Ұлытаудың көне таулары мен кесенелері",
      en: "The ancient mountains and mausoleums of Ulytau",
    },
    question: {
      ru: "Улытау считается духовным центром чего?",
      kz: "Ұлытау неге рухани орталық саналады?",
      en: "Ulytau is considered a spiritual centre of what?",
    },
    type: "choice",
    options: {
      ru: ["Казахской государственности", "Морской торговли", "Горнолыжного спорта", "Кинематографа"],
      kz: ["Қазақ мемлекеттілігінің", "Теңіз саудасының", "Тау шаңғы спортының", "Кинематографияның"],
      en: ["Kazakh statehood", "Maritime trade", "Alpine skiing", "Cinema"],
    },
    correctIndex: 0,
    explanation: {
      ru: "На Улытау расположены мавзолеи ханов и место, где, по преданию, был провозглашён Абылай хан — регион считается духовным центром казахской государственности.",
      kz: "Ұлытауда хандардың кесенелері және аңыз бойынша Абылай хан жарияланған жер орналасқан — аймақ қазақ мемлекеттілігінің рухани орталығы саналады.",
      en: "Ulytau holds the mausoleums of khans and the legendary site where Ablai Khan was proclaimed — the region is seen as a spiritual centre of Kazakh statehood.",
    },
  },
  {
    placeId: "burabay",
    videoLabel: {
      ru: "Озеро Боровое и скала Жумбактас",
      kz: "Бурабай көлі мен Жұмбақтас жартасы",
      en: "Lake Borovoye and the Zhumbaktas rock",
    },
    question: {
      ru: "Как называют Бурабай за сходство пейзажей с горной страной в Европе?",
      kz: "Бурабайды Еуропадағы таулы елмен ландшафты ұқсастығы үшін қалай атайды?",
      en: "What is Burabay nicknamed for its resemblance to a mountainous European country?",
    },
    type: "choice",
    options: {
      ru: ["Казахстанская Швейцария", "Казахстанская Норвегия", "Казахстанские Альпы", "Казахстанская Исландия"],
      kz: ["Қазақстан Швейцариясы", "Қазақстан Норвегиясы", "Қазақстан Альпісі", "Қазақстан Исландиясы"],
      en: ["The Switzerland of Kazakhstan", "The Norway of Kazakhstan", "The Alps of Kazakhstan", "The Iceland of Kazakhstan"],
    },
    correctIndex: 0,
    explanation: {
      ru: "За сосновые леса, скалы и чистые озёра Бурабай нередко называют «казахстанской Швейцарией».",
      kz: "Қарағай ормандары, жартастары мен таза көлдері үшін Бурабайды жиі «Қазақстан Швейцариясы» деп атайды.",
      en: "With its pine forests, cliffs and clear lakes, Burabay is often called the “Switzerland of Kazakhstan”.",
    },
  },
];

export function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ").replace(/ё/g, "е");
}
