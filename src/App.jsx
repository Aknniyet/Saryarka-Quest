import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "./context/LangContext";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import Places from "./pages/Places";
import PlaceDetail from "./pages/PlaceDetail";
import Nature from "./pages/Nature";
import NatureDetail from "./pages/NatureDetail";
import Quest from "./pages/Quest";
import About from "./pages/About";

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Nav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/places" element={<Places />} />
              <Route path="/places/:id" element={<PlaceDetail />} />
              <Route path="/nature" element={<Nature />} />
              <Route path="/nature/:type/:id" element={<NatureDetail />} />
              <Route path="/quest" element={<Quest />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </LangProvider>
  );
}
