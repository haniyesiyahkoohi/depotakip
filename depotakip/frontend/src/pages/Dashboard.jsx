import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../api";
import Header from "../components/Header";
import "./Dashboard.css";

const MOVEMENT_LABEL = { giris: "Giriş", cikis: "Çıkış" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => {
        const msg = err.response?.status === 403
          ? "Bu sayfayı görmek için giriş yapmalısın."
          : "Dashboard yüklenemedi.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxProductCount = data?.category_breakdown?.length
    ? Math.max(...data.category_breakdown.map((c) => c.product_count))
    : 1;

  return (
    <div className="app">
      <Header />
      <main className="dashboard">
        <Link to="/" className="dashboard__back">← Ürün listesine dön</Link>
        <h1 className="dashboard__title">Dashboard</h1>

        {loading && <p className="app__hint">Yükleniyor...</p>}
        {error && <p className="app__error">{error}</p>}

        {!loading && !error && data && (
          <>
            <div className="dashboard__summary">
              <div className="summary-card">
                <span className="summary-card__label">Toplam Ürün</span>
                <span className="summary-card__value">{data.summary.total_products}</span>
              </div>
              <div className="summary-card">
                <span className="summary-card__label">Toplam Kategori</span>
                <span className="summary-card__value">{data.summary.total_categories}</span>
              </div>
              <div className="summary-card">
                <span className="summary-card__label">Toplam Stok (adet)</span>
                <span className="summary-card__value">{data.summary.total_stock_units}</span>
              </div>
              <div className="summary-card">
                <span className="summary-card__label">Toplam Stok Değeri</span>
                <span className="summary-card__value">
                  {data.summary.total_stock_value.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺
                </span>
              </div>
              <div className="summary-card summary-card--warning">
                <span className="summary-card__label">Kritik Seviyede</span>
                <span className="summary-card__value">{data.summary.critical_count}</span>
              </div>
              <div className="summary-card summary-card--danger">
                <span className="summary-card__label">Tükenen</span>
                <span className="summary-card__value">{data.summary.out_of_stock_count}</span>
              </div>
            </div>

            <div className="dashboard__grid">
              <section className="dashboard__panel">
                <h2 className="dashboard__panel-title">Kategori Başına Ürün Sayısı</h2>
                <div className="bar-chart">
                  {data.category_breakdown.slice(0, 12).map((c) => (
                    <div key={c.id} className="bar-chart__row">
                      <span className="bar-chart__label">{c.icon} {c.name}</span>
                      <div className="bar-chart__track">
                        <div
                          className="bar-chart__fill"
                          style={{ width: `${(c.product_count / maxProductCount) * 100}%` }}
                        />
                      </div>
                      <span className="bar-chart__count">{c.product_count}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="dashboard__panel">
                <h2 className="dashboard__panel-title">Kritik Seviyedeki Ürünler</h2>
                {data.critical_products.length === 0 ? (
                  <p className="app__hint" style={{ padding: "20px 0" }}>Kritik seviyede ürün yok. 🎉</p>
                ) : (
                  <div className="critical-list">
                    {data.critical_products.map((p) => (
                      <Link key={p.id} to={`/urun/${p.id}`} className="critical-list__item">
                        <span className="critical-list__name">{p.name}</span>
                        <span className="critical-list__cat">{p.category_name}</span>
                        <span className="critical-list__qty">{p.quantity}/{p.critical_level}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard__panel dashboard__panel--full">
                <h2 className="dashboard__panel-title">Son Stok Hareketleri</h2>
                {data.recent_movements.length === 0 ? (
                  <p className="app__hint" style={{ padding: "20px 0" }}>Henüz hareket kaydı yok.</p>
                ) : (
                  <div className="movement-list">
                    {data.recent_movements.map((m, i) => (
                      <div key={i} className="movement-list__item">
                        <span
                          className="movement-list__type"
                          style={{ color: m.movement_type === "giris" ? "var(--success)" : "var(--danger)" }}
                        >
                          {m.movement_type === "giris" ? "↓" : "↑"} {MOVEMENT_LABEL[m.movement_type]}
                        </span>
                        <span className="movement-list__product">{m.product_name}</span>
                        <span className="movement-list__qty">{m.quantity}</span>
                        <span className="movement-list__date">
                          {new Date(m.created_at).toLocaleString("tr-TR")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
