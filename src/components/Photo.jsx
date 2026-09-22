const ANIMAL_PHOTOS = {
  saiga: "/animals/saiga.webp", argali: "/animals/argali.webp",
  "roe-deer": "/animals/roe-deer.webp", "steppe-eagle": "/animals/steppe-eagle.webp",
  flamingo: "/animals/flamingo.webp", marmot: "/animals/marmot.webp",
  corsac: "/animals/corsac.webp", bustard: "/animals/bustard.webp",
  "black-stork": "/animals/black-stork.jpg", "golden-eagle": "/animals/golden-eagle.jpg",
  "pallas-cat": "/animals/pallas-cat.jpg",
  maral: "/animals/maral.png", "sika-deer": "/animals/sika-deer.png",
  moose: "/animals/moose.png", "wild-boar": "/animals/wild-boar.png",
  badger: "/animals/badger.png", lynx: "/animals/lynx.png",
  "mountain-hare": "/animals/hares.png", "brown-hare": "/animals/hares.png",
  "red-fox": "/animals/red-fox.png", wolf: "/animals/wolf.png",
};

const PLANT_PHOTOS = {
  "karkaraly-rowan": "/plants/karkaraly-rowan.png",
  "karkaraly-barberry": "/plants/karkaraly-barberry.jpg",
  "dense-sphagnum": "/plants/dense-sphagnum.jpg",
  "slender-poppy": "/plants/slender-poppy.jpg",
  "spring-adonis": "/plants/spring-adonis.jpg",
  "red-birch": "/plants/red-birch.jpg",
};

// Все пути локальные: сайт не загружает фотографии с внешних сайтов.
const PLACE_PHOTOS = {
  bayanaul: "/images/bayanaul.webp", korgalzhyn: "/images/korgalzhyn.webp",
  karkaraly: "/images/karkaraly.webp", ulytau: "/images/ulytau.webp",
  burabay: "/images/burabay.webp", zhasybay: "/images/zhasybay.webp",
  shaitankol: "/images/shaitankol.webp", begazy: "/images/begazy.webp",
  kokshetau: "/images/kokshetau.webp", shalkar: "/images/shalkar.webp",
  zerendi: "/images/zerendi.webp", kobeituz: "/images/kobeituz.webp",
  alzhir: "/images/alzhir.webp", "mashhur-jusup": "/images/mashhur-jusup.webp",
  astana: "/images/astana.webp", karlag: "/images/karlag.webp", shunak: "/images/shunak.webp",
};

export function photoUrl(id, type = "place") {
  if (type === "animals") return ANIMAL_PHOTOS[id] || ANIMAL_PHOTOS.saiga;
  if (type === "plants") return PLANT_PHOTOS[id] || null;
  return PLACE_PHOTOS[id] || PLACE_PHOTOS.burabay;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  const src = photoUrl(id, type);
  if (!src) return <div className={`photo-unavailable ${className}`} role="img" aria-label={alt} />;
  return <img src={src} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
