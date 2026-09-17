const ANIMAL_PHOTOS = {
  saiga: "/animals/saiga.webp", argali: "/animals/argali.webp",
  "roe-deer": "/animals/roe-deer.webp", "steppe-eagle": "/animals/steppe-eagle.webp",
  flamingo: "/animals/flamingo.webp", marmot: "/animals/marmot.webp",
  corsac: "/animals/corsac.webp", bustard: "/animals/bustard.webp",
};

const PLANT_PHOTOS = {
  "feather-grass": "/images/fescue.webp", "schrenk-tulip": "/images/fritillaria.webp",
  wormwood: "/images/fescue.webp", "dwarf-iris": "/images/dwarf-iris.webp",
  fritillaria: "/images/fritillaria.webp", astragalus: "/images/astragalus.webp",
  fescue: "/images/fescue.webp", statice: "/images/statice.webp",
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
  if (type === "plants") return PLANT_PHOTOS[id] || PLANT_PHOTOS["feather-grass"];
  return PLACE_PHOTOS[id] || PLACE_PHOTOS.burabay;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  return <img src={photoUrl(id, type)} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
