const PLACE_PHOTOS = {
  bayanaul: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
  korgalzhyn: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  karkaraly: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85",
  ulytau: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
  burabay: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1400&q=85",
};

const ANIMAL_PHOTOS = {
  saiga: "/animals/saiga.png",
  argali: "/animals/argali.png",
  "roe-deer": "/animals/roe-deer.png",
  "steppe-eagle": "/animals/steppe-eagle.png",
  flamingo: "/animals/flamingo.png",
  marmot: "/animals/marmot.png",
  corsac: "/animals/corsac.png",
  bustard: "/animals/bustard.png",
};

export function photoUrl(id, type = "place") {
  return (type === "animals" ? ANIMAL_PHOTOS[id] : PLACE_PHOTOS[id]) || PLACE_PHOTOS.bayanaul;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  return <img src={photoUrl(id, type)} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
