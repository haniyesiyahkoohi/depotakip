import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lookupByBarcode } from "../api";
import "./BarcodeLookupModal.css";

export default function BarcodeLookupModal({ onClose }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Modal açılır açılmaz kutuya odaklan; barkod okuyucular gerçek klavye gibi
  // davranır, o yüzden kullanıcı/okuyucu direkt yazmaya başlayabilsin.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setSearching(true);
    setError(null);
    try {
      const product = await lookupByBarcode(trimmed);
      navigate(`/urun/${product.id}`);
      onClose();
    } catch {
      setError(`"${trimmed}" koduna sahip ürün bulunamadı.`);
      setCode("");
      inputRef.current?.focus();
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="barcode-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="barcode-modal__title">📷 Barkod ile Ara</h2>
        <p className="barcode-modal__hint">
          Barkod okuyucuyla ürün etiketini okut, ya da stok kodunu (SKU) elle yazıp Enter'a bas.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="barcode-modal__input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Stok kodu (SKU)..."
            autoComplete="off"
          />
          {error && <p className="barcode-modal__error">{error}</p>}
          <div className="barcode-modal__actions">
            <button type="button" className="barcode-modal__btn barcode-modal__btn--ghost" onClick={onClose}>
              Kapat
            </button>
            <button type="submit" className="barcode-modal__btn barcode-modal__btn--primary" disabled={searching}>
              {searching ? "Aranıyor..." : "Ara"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
