import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../AuthContext";
import LoginModal from "./LoginModal";
import "./Header.css";

export default function Header({ search, onSearchChange, productCount }) {
  const { isLoggedIn, username, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        <div className="header__mark">⏚</div>
        <div>
          <h1 className="header__title">Depo Takip</h1>
          <p className="header__subtitle">Elektronik Sarf Malzeme Envanteri</p>
        </div>
      </Link>

      <div className="header__search-wrap">
        {onSearchChange && (
          <input
            className="header__search"
            type="text"
            placeholder="Ürün adı veya stok kodu ara..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        {productCount !== undefined && <span className="header__count">{productCount} ürün</span>}

        {isLoggedIn ? (
          <div className="header__user">
            <span className="header__username">{username}</span>
            <button className="header__logout" onClick={logout}>Çıkış</button>
          </div>
        ) : (
          <button className="header__login-btn" onClick={() => setShowLogin(true)}>
            Giriş Yap
          </button>
        )}
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </header>
  );
}
