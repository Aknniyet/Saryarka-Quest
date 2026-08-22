export const animals = [
  {
    id: "saiga",
    name: { ru: "Сайгак", kz: "Ақбөкен", en: "Saiga antelope" },
    icon: "🦌",
    class: { ru: "Млекопитающее", kz: "Сүтқоректі", en: "Mammal" },
    short: {
      ru: "Степная антилопа с необычным носом-хоботком, символ казахстанских степей.",
      kz: "Ерекше тұмсықты дала антилопасы, қазақ даласының символы.",
      en: "A steppe antelope with a distinctive trunk-like nose — a symbol of the Kazakh steppe.",
    },
    habitat: {
      ru: "Открытые степи и полупустыни Сарыарки, совершает сезонные миграции на сотни километров.",
      kz: "Сарыарканың ашық далалары мен шөл дала аймақтары, жүздеген шақырымға маусымдық көші-қон жасайды.",
      en: "Open steppe and semi-desert of Saryarka; migrates seasonally across hundreds of kilometres.",
    },
    diet: { ru: "Травоядное", kz: "Шөппен қоректенеді", en: "Herbivore" },
    facts: {
      ru: ["Занесён в Красную книгу Казахстана", "Способен развивать скорость до 80 км/ч", "Нос помогает фильтровать пыль во время бега"],
      kz: ["Қазақстанның Қызыл кітабына енген", "80 км/сағ жылдамдыққа дейін жете алады", "Мұрны жүгіру кезінде шаңды сүзуге көмектеседі"],
      en: ["Listed in Kazakhstan's Red Data Book", "Can reach speeds of up to 80 km/h", "Its nose helps filter dust while running"],
    },
  },
  {
    id: "argali",
    name: { ru: "Архар", kz: "Арқар", en: "Argali sheep" },
    icon: "🐏",
    class: { ru: "Млекопитающее", kz: "Сүтқоректі", en: "Mammal" },
    short: {
      ru: "Крупнейший горный баран в мире, обитающий на скалистых сопках Сарыарки.",
      kz: "Сарыарканың жартасты адырларында мекендейтін әлемдегі ең ірі тау қошқары.",
      en: "The largest wild sheep in the world, found on the rocky hills of Saryarka.",
    },
    habitat: {
      ru: "Скалистые массивы и горные степи Улытау и Каркаралы.",
      kz: "Ұлытау мен Қарқаралының жартасты massив және таулы даласы.",
      en: "Rocky massifs and mountain steppe of Ulytau and Karkaraly.",
    },
    diet: { ru: "Травоядное", kz: "Шөппен қоректенеді", en: "Herbivore" },
    facts: {
      ru: ["Самцы носят массивные закрученные рога", "Занесён в Красную книгу", "Живёт небольшими стадами"],
      kz: ["Еркектерінде үлкен бұралған мүйіз болады", "Қызыл кітапқа енген", "Шағын үйірлермен өмір сүреді"],
      en: ["Males carry massive curled horns", "Listed in the Red Data Book", "Lives in small herds"],
    },
  },
  {
    id: "roe-deer",
    name: { ru: "Косуля", kz: "Елік", en: "Roe deer" },
    icon: "🦌",
    class: { ru: "Млекопитающее", kz: "Сүтқоректі", en: "Mammal" },
    short: {
      ru: "Изящное лесное копытное, обитающее в сосновых борах Баянаула и Каркаралы.",
      kz: "Баянауыл мен Қарқаралының қарағай ормандарында кездесетін нәзік орман тұяқтысы.",
      en: "A graceful forest ungulate found in the pine forests of Bayanaul and Karkaraly.",
    },
    habitat: {
      ru: "Лесостепные массивы, опушки сосновых боров.",
      kz: "Орман-дала массивтері, қарағай орманының жиегі.",
      en: "Forest-steppe patches and the edges of pine woodlands.",
    },
    diet: { ru: "Травоядное", kz: "Шөппен қоректенеді", en: "Herbivore" },
    facts: {
      ru: ["Активна в сумерках и на рассвете", "Прекрасно прыгает и плавает", "Ежегодно сбрасывает рога"],
      kz: ["Ымыртта және таңертең белсенді", "Жақсы секіре және жүзе алады", "Жыл сайын мүйізін тастайды"],
      en: ["Active at dawn and dusk", "An excellent jumper and swimmer", "Sheds its antlers every year"],
    },
  },
  {
    id: "steppe-eagle",
    name: { ru: "Степной орёл", kz: "Дала бүркіті", en: "Steppe eagle" },
    icon: "🦅",
    class: { ru: "Птица", kz: "Құс", en: "Bird" },
    short: {
      ru: "Крупная хищная птица, парящая над бескрайними степями Сарыарки.",
      kz: "Сарыарканың шексіз даласы үстінде қалықтайтын ірі жыртқыш құс.",
      en: "A large bird of prey soaring above the vast steppes of Saryarka.",
    },
    habitat: {
      ru: "Открытая степь, сопки, скальные обрывы для гнездования.",
      kz: "Ашық дала, адырлар, ұя салуға арналған жартас жарлары.",
      en: "Open steppe, hills and rocky cliffs used for nesting.",
    },
    diet: { ru: "Хищник: суслики, грызуны", en: "Carnivore: ground squirrels, rodents", kz: "Жыртқыш: саршұнақ, кеміргіштер" },
    facts: {
      ru: ["Уязвимый вид, охраняется законом", "Гнездится прямо на земле", "Видит добычу с высоты нескольких сотен метров"],
      kz: ["Осал түр, заңмен қорғалады", "Ұясын жерге салады", "Жемтігін бірнеше жүз метр биіктіктен көреді"],
      en: ["A vulnerable species protected by law", "Nests directly on the ground", "Spots prey from hundreds of metres up"],
    },
  },
  {
    id: "flamingo",
    name: { ru: "Розовый фламинго", kz: "Қызғылт фламинго", en: "Greater flamingo" },
    icon: "🦩",
    class: { ru: "Птица", kz: "Құс", en: "Bird" },
    short: {
      ru: "Символ Коргалжынского заповедника — самая северная гнездящаяся популяция фламинго в мире.",
      kz: "Қорғалжын қорығының символы — әлемдегі фламингоның ең солтүстіктегі ұя салатын популяциясы.",
      en: "The symbol of Korgalzhyn Nature Reserve — the world's northernmost breeding population of flamingos.",
    },
    habitat: {
      ru: "Мелководные солёные озёра Тенгиз и Кургальджин.",
      kz: "Теңіз және Қорғалжын көлдерінің тайыз тұзды суы.",
      en: "The shallow salt lakes Tengiz and Korgalzhyn.",
    },
    diet: { ru: "Мелкие рачки и водоросли", kz: "Ұсақ шаян тәрізділер мен балдырлар", en: "Small crustaceans and algae" },
    facts: {
      ru: ["Розовый цвет перьев зависит от пищи", "Гнездится большими колониями", "Улетает на зимовку за тысячи километров"],
      kz: ["Қауырсынның қызғылт түсі тағамға байланысты", "Үлкен колониялармен ұя салады", "Қыстауға мыңдаған шақырымға ұшып кетеді"],
      en: ["Their pink colour comes from their diet", "Nests in large colonies", "Migrates thousands of kilometres to winter"],
    },
  },
  {
    id: "marmot",
    name: { ru: "Байбак (степной сурок)", kz: "Байбақ (дала суыры)", en: "Steppe marmot (bobak)" },
    icon: "🐿️",
    class: { ru: "Млекопитающее", kz: "Сүтқоректі", en: "Mammal" },
    short: {
      ru: "Крупный грызун, живущий колониями в норах и предупреждающий сородичей громким свистом.",
      kz: "Індерде колониямен өмір сүретін, туыстарын қатты ысқырықпен ескертетін ірі кеміргіш.",
      en: "A large burrowing rodent that lives in colonies and warns others with a loud whistle.",
    },
    habitat: {
      ru: "Целинные степные участки с плотной дерновиной.",
      kz: "Тығыз шымтезекті тың дала учаскелері.",
      en: "Untouched steppe with dense turf cover.",
    },
    diet: { ru: "Травоядное", kz: "Шөппен қоректенеді", en: "Herbivore" },
    facts: {
      ru: ["Впадает в спячку почти на 8 месяцев в году", "Живёт большими колониями — «сурчиными городками»", "Роет сложные системы нор"],
      kz: ["Жылына шамамен 8 ай ұйқыға кетеді", "«Суыр қалашығы» деп аталатын үлкен колониялармен өмір сүреді", "Күрделі ін жүйесін қазады"],
      en: ["Hibernates for nearly 8 months a year", "Lives in large colonies known as “towns”", "Digs elaborate burrow systems"],
    },
  },
  {
    id: "corsac",
    name: { ru: "Корсак (степная лисица)", kz: "Қорсақ", en: "Corsac fox" },
    icon: "🦊",
    class: { ru: "Млекопитающее", kz: "Сүтқоректі", en: "Mammal" },
    short: {
      ru: "Небольшая проворная лисица открытых степей, охотится в основном по ночам.",
      kz: "Ашық дала аймағының шағын және ептi түлкісі, негізінен түнде аулайды.",
      en: "A small, agile fox of the open steppe that hunts mainly at night.",
    },
    habitat: {
      ru: "Сухие степи и полупустыни, часто селится в норах сурков и сусликов.",
      kz: "Құрғақ дала мен шөл дала, көбіне суыр мен саршұнақ індерінде мекендейді.",
      en: "Dry steppe and semi-desert; often settles in abandoned marmot or ground-squirrel burrows.",
    },
    diet: { ru: "Грызуны, насекомые, птицы", kz: "Кеміргіштер, жәндіктер, құстар", en: "Rodents, insects, birds" },
    facts: {
      ru: ["Легче и мельче обыкновенной лисицы", "Отлично приспособлен к жизни в открытой степи", "Ведёт преимущественно ночной образ жизни"],
      kz: ["Кәдімгі түлкіден жеңіл әрі кіші", "Ашық далада өмір сүруге жақсы бейімделген", "Негізінен түнгі өмір салтын ұстанады"],
      en: ["Lighter and smaller than the red fox", "Well adapted to life in open steppe", "Mostly nocturnal"],
    },
  },
  {
    id: "bustard",
    name: { ru: "Дрофа", kz: "Дуадақ", en: "Great bustard" },
    icon: "🐦",
    class: { ru: "Птица", kz: "Құс", en: "Bird" },
    short: {
      ru: "Одна из самых тяжёлых летающих птиц мира, редкий обитатель ковыльных степей.",
      kz: "Әлемдегі ең ауыр ұшатын құстардың бірі, боз шөпті даланың сирек тұрғыны.",
      en: "One of the heaviest flying birds in the world, a rare inhabitant of feather-grass steppe.",
    },
    habitat: {
      ru: "Открытые целинные степи с невысокой растительностью.",
      kz: "Аласа өсімдігі бар ашық тың далалар.",
      en: "Open, untouched steppe with low vegetation.",
    },
    diet: { ru: "Всеядное: растения, насекомые, мелкие грызуны", kz: "Бәрін жейді: өсімдіктер, жәндіктер, ұсақ кеміргіштер", en: "Omnivore: plants, insects, small rodents" },
    facts: {
      ru: ["Самцы могут весить более 16 кг", "Занесена в Красную книгу Казахстана", "Очень чувствительна к беспокойству со стороны человека"],
      kz: ["Еркектердің салмағы 16 кг-нан асуы мүмкін", "Қазақстанның Қызыл кітабына енген", "Адамның мазасыздығына өте сезімтал"],
      en: ["Males can weigh over 16 kg", "Listed in Kazakhstan's Red Data Book", "Highly sensitive to human disturbance"],
    },
  },
];

export const getAnimal = (id) => animals.find((a) => a.id === id);
