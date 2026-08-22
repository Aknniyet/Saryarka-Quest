const PLACE_PHOTOS = {
  bayanaul: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
  korgalzhyn: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  karkaraly: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85",
  ulytau: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
  burabay: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1400&q=85",
};

const ANIMAL_PHOTOS = {
  saiga: "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=900&q=85",
  argali: "https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=900&q=85",
  roe: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85",
  eagle: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=85",
};

export function photoUrl(id, type = "place") {
  return (type === "animals" ? ANIMAL_PHOTOS[id] : PLACE_PHOTOS[id]) || PLACE_PHOTOS.bayanaul;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  return <img src={photoUrl(id, type)} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
