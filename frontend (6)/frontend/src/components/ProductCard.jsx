import { Link } from "react-router-dom";
import "./ProductCard.css";

function stockStatus(product) {
  if (product.quantity === 0) return { label: "Stokta Yok", tone: "danger" };
  if (product.is_below_critical) return { label: "Kritik Stok", tone: "warning" };
  return { label: "Stokta Var", tone: "success" };
}

export default function ProductCard({ product }) {
  const status = stockStatus(product);

  return (
    <Link to={`/urun/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        {status.tone !== "success" && (
          <span className={`product-card__badge product-card__badge--${status.tone}`}>{status.label}</span>
        )}
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <rect x="3" y="7" width="18" height="10" rx="1.5" />
              <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
              <path d="M7 12h10" />
            </svg>
          </div>
        )}
      </div>

      <div className="product-card__body">
        <span className="product-card__sku">{product.sku}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__category">{product.category_name || "Kategorisiz"}</p>

        <div className="product-card__footer">
          {product.unit_price ? (
            <span className="product-card__price">{Number(product.unit_price).toFixed(2)} ₺</span>
          ) : (
            <span className="product-card__price product-card__price--muted">Fiyat girilmemiş</span>
          )}
          <span className="product-card__qty">{product.quantity} {product.unit}</span>
        </div>

        <span className="product-card__cta">Detayları Gör →</span>
      </div>
    </Link>
  );
}
