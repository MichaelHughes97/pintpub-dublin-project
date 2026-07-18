import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PubDetails from "./pages/PubDetails";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pubs/:id" element={<PubDetails />} />

        {/* Registration page */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;