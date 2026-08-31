const PLACE_PHOTOS = {
  bayanaul: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Bayanaul_National_Reserve_Park_Grove.jpg/1280px-Bayanaul_National_Reserve_Park_Grove.jpg",
  korgalzhyn: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Sunset_in_Korgalzhyn_Nature_Reserve.jpg/1280px-Sunset_in_Korgalzhyn_Nature_Reserve.jpg",
  karkaraly: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Karkaraly_National_Park_6.jpg/1280px-Karkaraly_National_Park_6.jpg",
  ulytau: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Alasha-Khan_Mausoleum-1.jpg/1280px-Alasha-Khan_Mausoleum-1.jpg",
  burabay: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Zhumbaktas_rock.jpg/1280px-Zhumbaktas_rock.jpg",
  zhasybay: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Lake_Jasybay_Sentinel-2_L1C.jpg",
  shaitankol: "https://upload.wikimedia.org/wikipedia/commons/1/11/%D0%9E%D0%B7%D0%B5%D1%80%D0%BE_%D0%A8%D0%B0%D0%B9%D1%82%D0%B0%D0%BD%D0%BA%D0%BE%D0%BB%D1%8C.jpg",
  begazy: "https://upload.wikimedia.org/wikipedia/commons/3/30/Begazy-Dandybai_Complex.png",
  kokshetau: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/%D0%98%D0%BC%D0%B0%D0%BD%D0%B1%D1%83%D1%80%D0%BB%D1%8B%D0%BA.jpg/1280px-%D0%98%D0%BC%D0%B0%D0%BD%D0%B1%D1%83%D1%80%D0%BB%D1%8B%D0%BA.jpg",
  shalkar: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Kauylzhyr-Shalkar_2018-05-02-23_59_Sentinel-2_L2A_True_color.jpg",
  zerendi: "https://tengrinews.kz/userdata/images/u337/resized/ac666fde8d21f84f40640f4bbbb91221.jpg",
  kobeituz: "https://www.gokazakhstan.net/media/posts/post_42/img02.jpg",
  alzhir: "https://weproject.media/upload/iblock/4f0/4f02f72e88e847049cc53b598bb789db.jpg",
  "mashhur-jusup": "https://oq.gov.kz/storage/abai/topics/gallery/rgKmpNwU44zL4UL6cloZqdcjjfD4ZHnlVgXVn5tp.jpeg",
  astana: "https://english.news.cn/asiapacific/20240630/1c2f84a7f20e4f97a5794666f8116d52/202406301c2f84a7f20e4f97a5794666f8116d52_202406307d30de204eb446519404c86662c76aa4.jpg",
  karlag: "https://static.esosedi.org/fiber/191652/fit/900x600/muzey_karlaga.png",
  shunak: "https://aif-s3.aif.ru/images/022/470/4c106f0b44677eba021b6119add36b22.jpg",
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

const PLANT_PHOTOS = {
  "feather-grass": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Stipa_capillata_-_Berlin_Botanical_Garden_-_IMG_8582.JPG/1280px-Stipa_capillata_-_Berlin_Botanical_Garden_-_IMG_8582.JPG",
  "schrenk-tulip": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/%D0%91%D0%B0%D0%BB%D0%BA%D0%B0_%D0%91%D0%B5%D1%80%D0%B5%D0%B7%D0%BE%D0%B2%D0%B0_Tulipa_gesneriana_%28T._shrenkii%2C_T.suaveolens%29_%D1%87%D0%B5%D1%80%D0%B2%D0%BE%D0%BD%D0%B8%D0%B9.jpg/1280px-%D0%91%D0%B0%D0%BB%D0%BA%D0%B0_%D0%91%D0%B5%D1%80%D0%B5%D0%B7%D0%BE%D0%B2%D0%B0_Tulipa_gesneriana_%28T._shrenkii%2C_T.suaveolens%29_%D1%87%D0%B5%D1%80%D0%B2%D0%BE%D0%BD%D0%B8%D0%B9.jpg",
  wormwood: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Artemisia_absinthium_P1210748.jpg/1280px-Artemisia_absinthium_P1210748.jpg",
  "dwarf-iris": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Iris_pumila_sl28.jpg/1280px-Iris_pumila_sl28.jpg",
  fritillaria: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Fritillaria_meleagris_MichaD.jpg/1280px-Fritillaria_meleagris_MichaD.jpg",
  astragalus: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Astragalus_alpinus_LC0319.jpg/1280px-Astragalus_alpinus_LC0319.jpg",
  fescue: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Festuca_valesiaca1.JPG/1280px-Festuca_valesiaca1.JPG",
  statice: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Limonium_perezii_3.jpg/1280px-Limonium_perezii_3.jpg",
};

export function photoUrl(id, type = "place") {
  if (type === "animals") return ANIMAL_PHOTOS[id] || ANIMAL_PHOTOS.saiga;
  if (type === "plants") return PLANT_PHOTOS[id] || PLANT_PHOTOS["feather-grass"];
  return PLACE_PHOTOS[id] || PLACE_PHOTOS.bayanaul;
}

export default function Photo({ id, type, alt = "", className = "" }) {
  return <img src={photoUrl(id, type)} alt={alt} className={`block object-cover ${className}`} loading="lazy" />;
}
