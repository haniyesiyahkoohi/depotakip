import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct, fetchMovements } from "../api";
import { useAuth } from "../AuthContext";
import Header from "../components/Header";
import StockMovementModal from "../components/StockMovementModal";
import ForecastPanel from "../components/ForecastPanel";
import ProductBarcode from "../components/ProductBarcode";
import LotList from "../components/LotList";
import "./ProductDetail.css";

function stockStatus(product) {
  if (!product) return { label: "", color: "" };
  if (product.quantity === 0) return { label: "Tükendi", color: "var(--danger)" };
  if (product.is_below_critical) return { label: "Kritik Seviye", color: "var(--warning)" };
  return { label: "Yeterli", color: "var(--success)" };
}

const MOVEMENT_LABEL = { giris: "Giriş", cikis: "Çıkış" };

export default function ProductDetail() {
  const { id } = useParams();
  const { canManageStock } = useAuth();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovementModal, setShowMovementModal] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchProduct(id), fetchMovements(id)])
      .then(([productData, movementData]) => {
        setProduct(productData);
        setMovements(movementData.results ?? movementData);
        setError(null);
      })
      .catch(() => setError("Ürün bulunamadı ya da yüklenemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const status = stockStatus(product);
  const specs = product?.specs && typeof product.specs === "object" ? product.specs : {};
  const hasSpecs = Object.keys(specs).length > 0;

  return (
    <div className="app">
      <Header />

      <main className="detail">
        <Link to="/" className="detail__back">← Ürün listesine dön</Link>

        {loading && <p className="app__hint">Yükleniyor...</p>}
        {error && <p className="app__error">{error}</p>}

        {!loading && !error && product && (
          <>
            <div className="detail__header">
              <div className="detail__image-wrap">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="detail__image" />
                ) : (
                  <div className="detail__placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3" y="7" width="18" height="10" rx="1.5" />
                      <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                      <path d="M7 12h10" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="detail__info">
                <span className="detail__sku">{product.sku}</span>
                <h1 className="detail__name">{product.name}</h1>
                <p className="detail__category">{product.category_name || "Kategorisiz"}</p>
                <span className="detail__status" style={{ color: status.color }}>
                  ● {status.label}
                </span>
                {product.unit_price && (
                  <p className="detail__price">{Number(product.unit_price).toFixed(2)} ₺</p>
                )}

                {canManageStock && (
                  <button className="detail__add-btn" onClick={() => setShowMovementModal(true)}>
                    + Stok Hareketi Ekle
                  </button>
                )}
              </div>
            </div>

            <div className="detail__stats">
              <div className="detail__stat">
                <span className="detail__stat-label">Mevcut Miktar</span>
                <span className="detail__stat-value">{product.quantity} {product.unit}</span>
              </div>
              <div className="detail__stat">
                <span className="detail__stat-label">Kritik Seviye</span>
                <span className="detail__stat-value">{product.critical_level} {product.unit}</span>
              </div>
              {product.location_name && (
                <div className="detail__stat">
                  <span className="detail__stat-label">Konum</span>
                  <span className="detail__stat-value">{product.location_name}</span>
                </div>
              )}
              {product.supplier_name && (
                <div className="detail__stat">
                  <span className="detail__stat-label">Tedarikçi</span>
                  <span className="detail__stat-value">{product.supplier_name}</span>
                </div>
              )}
            </div>

            <section className="detail__section">
              <h2 className="detail__section-title">Barkod</h2>
              <ProductBarcode productId={product.id} productName={product.name} />
            </section>

            <section className="detail__section">
              <h2 className="detail__section-title">Lotlar / Seriler</h2>
              <LotList productId={product.id} />
            </section>

            {hasSpecs && (
              <section className="detail__section">
                <h2 className="detail__section-title">Teknik Özellikler</h2>
                <table className="detail__specs">
                  <tbody>
                    {Object.entries(specs).map(([key, value]) => (
                      <tr key={key}>
                        <td className="detail__specs-key">{key}</td>
                        <td className="detail__specs-value">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {product.datasheet_url && (
              <section className="detail__section">
                <a href={product.datasheet_url} target="_blank" rel="noreferrer" className="detail__datasheet">
                  📄 Datasheet'i Görüntüle
                </a>
              </section>
            )}

            <section className="detail__section">
              <h2 className="detail__section-title">Talep Tahmini</h2>
              <ForecastPanel productId={product.id} />
            </section>

            <section className="detail__section">
              <h2 className="detail__section-title">Stok Hareketleri</h2>
              {movements.length === 0 ? (
                <p className="app__hint" style={{ padding: "24px 0" }}>Henüz hareket kaydı yok.</p>
              ) : (
                <div className="detail__movements">
                  {movements.map((m) => (
                    <div key={m.id} className="detail__movement">
                      <span
                        className="detail__movement-type"
                        style={{ color: m.movement_type === "giris" ? "var(--success)" : "var(--danger)" }}
                      >
                        {m.movement_type === "giris" ? "↓" : "↑"} {MOVEMENT_LABEL[m.movement_type]}
                      </span>
                      <span className="detail__movement-qty">{m.quantity} {product.unit}</span>
                      <span className="detail__movement-note">{m.note}</span>
                      <span className="detail__movement-date">
                        {new Date(m.created_at).toLocaleString("tr-TR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {showMovementModal && product && (
        <StockMovementModal
          product={product}
          onClose={() => setShowMovementModal(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}