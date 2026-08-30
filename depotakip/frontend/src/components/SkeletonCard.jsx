import "./SkeletonCard.css";

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__image" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--sku" />
        <div className="skeleton-card__line skeleton-card__line--title" />
        <div className="skeleton-card__line skeleton-card__line--cat" />
      </div>
    </div>
  );
}
