import { useState } from "react";
import { useAuth } from "../AuthContext";
import "./LoginModal.css";

export default function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(user, password);
      onClose();
    } catch {
      setError("Kullanıcı adı veya şifre hatalı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Giriş Yap</h2>
        <p className="modal__hint">Stok hareketi ekleyebilmek için depo hesabınla giriş yap.</p>

        <form onSubmit={handleSubmit}>
          <label className="modal__label">Kullanıcı Adı</label>
          <input
            className="modal__input"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoFocus
          />

          <label className="modal__label">Şifre</label>
          <input
            className="modal__input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
