import "./Sidebar.css";

export default function Sidebar({ categories, selected, onSelect }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Kategoriler</h2>
      <nav className="sidebar__list">
        <button
          className={`sidebar__item ${selected === null ? "sidebar__item--active" : ""}`}
          onClick={() => onSelect(null)}
        >
          <span className="sidebar__icon">🗂️</span> Tüm Ürünler
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`sidebar__item ${selected === cat.id ? "sidebar__item--active" : ""}`}
            onClick={() => onSelect(cat.id)}
          >
            <span className="sidebar__icon">{cat.icon || "🔧"}</span> {cat.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
