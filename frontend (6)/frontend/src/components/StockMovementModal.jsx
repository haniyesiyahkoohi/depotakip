import { useState } from "react";
import { createMovement } from "../api";
import "./LoginModal.css";

export default function StockMovementModal({ product, onClose, onSuccess }) {
  const [type, setType] = useState("giris");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      setError("Geçerli bir miktar gir.");
      return;
    }
    if (type === "cikis" && qty > product.quantity) {
      setError(`Depoda sadece ${product.quantity} ${product.unit} var, bu kadar çıkış yapılamaz.`);
      return;
    }

    setSubmitting(true);
    try {
      await createMovement({ product: product.id, movement_type: type, quantity: qty, note });
      onSuccess();
      onClose();
    } catch {
      setError("Hareket kaydedilemedi, tekrar dene.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Stok Hareketi Ekle</h2>
        <p className="modal__hint">{product.name} — mevcut: {product.quantity} {product.unit}</p>

        <form onSubmit={handleSubmit}>
          <div className="modal__radio-group">
            <label className={`modal__radio modal__radio--giris ${type === "giris" ? "modal__radio--active" : ""}`}>
              <input type="radio" checked={type === "giris"} onChange={() => setType("giris")} />
              ↓ Giriş
            </label>
            <label className={`modal__radio modal__radio--cikis ${type === "cikis" ? "modal__radio--active" : ""}`}>
              <input type="radio" checked={type === "cikis"} onChange={() => setType("cikis")} />
              ↑ Çıkış
            </label>
          </div>

          <label className="modal__label">Miktar</label>
          <input
            className="modal__input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus
          />

          <label className="modal__label">Not (opsiyonel)</label>
          <input
            className="modal__input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="örn. Yeni sipariş, arıza değişimi..."
          />

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__actions">
            <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              {submitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
