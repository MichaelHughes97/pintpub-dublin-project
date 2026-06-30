import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PubDetails from "./pages/PubDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pubs/:id" element={<PubDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;