import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import "./theme.css";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/urun/:id" element={<ProductDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
