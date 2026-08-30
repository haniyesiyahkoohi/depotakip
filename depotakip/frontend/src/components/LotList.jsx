import { useEffect, useState } from "react";
import { fetchLots } from "../api";
import "./LotList.css";

export default function LotList({ productId }) {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchLots(productId)
      .then((data) => {
        if (!cancelled) setLots(data.results ?? data);
      })
      .catch(() => {
        if (!cancelled) setError("Lot bilgileri yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [productId]);

  if (loading) return <p className="app__hint" style={{ padding: "16px 0" }}>Yükleniyor...</p>;
  if (error) return <p className="app__error" style={{ padding: "16px 0" }}>{error}</p>;

  if (lots.length === 0) {
    return (
      <p className="app__hint" style={{ padding: "16px 0" }}>
        Bu ürün için henüz lot/parti kaydı girilmemiş. Admin panelden eklenebilir.
      </p>
    );
  }

  return (
    <div className="lot-list">
      {lots.map((lot) => (
        <div key={lot.id} className={`lot-list__item ${lot.is_expired ? "lot-list__item--expired" : ""}`}>
          <div className="lot-list__main">
            <span className="lot-list__number">{lot.lot_number}</span>
            <span className="lot-list__qty">{lot.quantity} adet</span>
          </div>
          <div className="lot-list__meta">
            <span>Geliş: {lot.received_date}</span>
            {lot.expiry_date && (
              <span className={lot.is_expired ? "lot-list__expired-tag" : ""}>
                SKT: {lot.expiry_date} {lot.is_expired && "(Süresi geçmiş)"}
              </span>
            )}
            {lot.supplier_name && <span>Tedarikçi: {lot.supplier_name}</span>}
          </div>
          {lot.note && <p className="lot-list__note">{lot.note}</p>}
        </div>
      ))}
    </div>
  );
}
