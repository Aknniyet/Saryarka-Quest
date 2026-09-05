const ANIMAL_PHOTOS = {
  saiga: "/animals/saiga.png", argali: "/animals/argali.png",
  "roe-deer": "/animals/roe-deer.png", "steppe-eagle": "/animals/steppe-eagle.png",
  flamingo: "/animals/flamingo.png", marmot: "/animals/marmot.png",
  corsac: "/animals/corsac.png", bustard: "/animals/bustard.png",
};

const PLANT_PHOTOS = {
  "feather-grass": "/images/fescue.png", "schrenk-tulip": "/images/fritillaria.png",
  wormwood: "/images/fescue.png", "dwarf-iris": "/images/dwarf-iris.png",
  fritillaria: "/images/fritillaria.png", astragalus: "/images/astragalus.png",
  fescue: "/images/fescue.png", statice: "/images/statice.png",
};

// Все пути локальные: сайт не загружает фотографии с внешних сайтов.
const PLACE_PHOTOS = {
  bayanaul: "/images/bayanaul.png", korgalzhyn: "/images/korgalzhyn.png",
  karkaraly: "/images/karkaraly.png", ulytau: "/images/ulytau.png",
  burabay: "/images/burabay.png", zhasybay: "/images/zhasybay.png",
  shaitankol: "/images/shaitankol.png", begazy: "/images/begazy.png",
  kokshetau: "/images/kokshetau.png", shalkar: "/images/shalkar.png",
  zerendi: "/images/zerendi.png", kobeituz: "/images/kobeituz.png",
  alzhir: "/images/alzhir.png", "mashhur-jusup": "/images/mashhur-jusup.png",
  astana: "/images/astana.png", karlag: "/images/karlag.png", shunak: "/images/shunak.png",
};

export function photoUrl(id, type = "place") {
  if (type === "animals") return ANIMAL_PHOTOS[id] || ANIMAL_PHOTOS.saiga;
  if (type === "plants") return PLANT_PHOTOS[id] || PLANT_PHOTOS["feather-grass"];
  return PLACE_PHOTOS[id] || PLACE_PHOTOS.burabay;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  return <img src={photoUrl(id, type)} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
