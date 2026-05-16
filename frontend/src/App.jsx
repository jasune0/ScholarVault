import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { SavedProvider } from "./context/SavedContext";
import Navbar from './components/Navbar'
import PaperDeatil from "./pages/PaperDetailPage";
import Saved from "./pages/SavedPage";
import About from "./pages/AboutPage";
import Help from "./pages/HelpPage";

export default function App() {
  return (
    <SavedProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/paper/*" element={<PaperDeatil />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/help" element={<Help />} />
        </Routes>
      </BrowserRouter>
    </SavedProvider>
  );
}
