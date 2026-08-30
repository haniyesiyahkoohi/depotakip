from django.utils import timezone

DEFAULT_LEAD_TIME_DAYS = 14
MIN_MOVEMENTS_FOR_FORECAST = 2


def estimate_forecast(product):
    """Bir ürünün geçmiş stok çıkışlarına bakarak basit bir tüketim tahmini üretir."""
    movements = list(
        product.movements.filter(movement_type="cikis").order_by("created_at")
    )

    if len(movements) < MIN_MOVEMENTS_FOR_FORECAST:
        return {
            "available": False,
            "message": (
                "Tahmin için yeterli hareket geçmişi yok. "
                "Bu üründe en az birkaç çıkış hareketi birikince tahmin yapılabilir."
            ),
            "movements_used": len(movements),
        }

    first_date = movements[0].created_at
    last_date = movements[-1].created_at
    span_days = max((last_date - first_date).days, 1)
    total_used = sum(m.quantity for m in movements)
    avg_daily_usage = total_used / span_days

    if avg_daily_usage <= 0:
        return {
            "available": False,
            "message": "Hesaplanan günlük tüketim sıfır, tahmin üretilemiyor.",
            "movements_used": len(movements),
        }

    days_until_stockout = round(product.quantity / avg_daily_usage)
    suggested_reorder_quantity = max(
        round(avg_daily_usage * DEFAULT_LEAD_TIME_DAYS) - product.quantity + product.critical_level,
        0,
    )
    estimated_stockout_date = timezone.now().date() + timezone.timedelta(days=days_until_stockout)

    return {
        "available": True,
        "avg_daily_usage": round(avg_daily_usage, 2),
        "days_until_stockout": days_until_stockout,
        "estimated_stockout_date": estimated_stockout_date.isoformat(),
        "suggested_reorder_quantity": suggested_reorder_quantity,
        "lead_time_days_assumption": DEFAULT_LEAD_TIME_DAYS,
        "movements_used": len(movements),
    }