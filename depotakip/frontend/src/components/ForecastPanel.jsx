import { useEffect, useState } from "react";
import { fetchForecast } from "../api";
import "./ForecastPanel.css";

export default function ForecastPanel({ productId }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchForecast(productId)
      .then((data) => {
        if (!cancelled) setForecast(data);
      })
      .catch(() => {
        if (!cancelled) setForecast({ available: false, message: "Tahmin yüklenemedi." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return <div className="forecast-panel forecast-panel--loading">Tahmin hesaplanıyor...</div>;
  }

  if (!forecast?.available) {
    return (
      <div className="forecast-panel forecast-panel--empty">
        <span className="forecast-panel__icon">📊</span>
        <span>{forecast?.message || "Tahmin için yeterli veri yok."}</span>
      </div>
    );
  }

  const urgent = forecast.days_until_stockout <= 14;

  return (
    <div className={`forecast-panel ${urgent ? "forecast-panel--urgent" : ""}`}>
      <div className="forecast-panel__row">
        <span className="forecast-panel__label">Tahmini Tükenme</span>
        <span className="forecast-panel__value">
          {forecast.days_until_stockout} gün sonra ({forecast.estimated_stockout_date})
        </span>
      </div>
      <div className="forecast-panel__row">
        <span className="forecast-panel__label">Günlük Ort. Tüketim</span>
        <span className="forecast-panel__value">{forecast.avg_daily_usage}</span>
      </div>
      <div className="forecast-panel__row">
        <span className="forecast-panel__label">Önerilen Sipariş Miktarı</span>
        <span className="forecast-panel__value">{forecast.suggested_reorder_quantity}</span>
      </div>
      <p className="forecast-panel__note">
        Bu tahmin, son {forecast.movements_used} çıkış hareketine dayanır; {forecast.lead_time_days_assumption} günlük
        tedarik süresi varsayımıyla hesaplanmıştır.
      </p>
    </div>
  );
}
