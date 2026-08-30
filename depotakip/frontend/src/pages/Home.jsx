import { useEffect, useState } from "react";
import { fetchProducts, fetchCategories } from "../api";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import "./Home.css";

const SORT_OPTIONS = [
  { value: "name", label: "İsim (A-Z)" },
  { value: "-name", label: "İsim (Z-A)" },
  { value: "-quantity", label: "Stok (Çoktan Aza)" },
  { value: "quantity", label: "Stok (Azdan Çoka)" },
  { value: "-created_at", label: "En Yeni" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(data.results ?? data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sort]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = { ordering: sort, page };
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;

    const timeoutId = setTimeout(() => {
      fetchProducts(params)
        .then((data) => {
          setProducts(data.results ?? data);
          setCount(data.count ?? (data.results ?? data).length);
          setHasNext(Boolean(data.next));
          setHasPrev(Boolean(data.previous));
        })
        .catch(() => setError("Ürünler yüklenemedi. Backend sunucusunun çalıştığından emin ol."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, sort, page]);

  return (
    <div className="app">
      <Header search={search} onSearchChange={setSearch} productCount={count} />

      <div className="home">
        <Sidebar categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

        <main className="home__main">
          <div className="home__toolbar">
            <h2 className="home__heading">
              {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "Tüm Ürünler"}
            </h2>
            <select className="home__sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <p className="app__error">{error}</p>}

          {!error && loading && (
            <div className="home__grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!error && !loading && products.length === 0 && (
            <p className="app__hint">Kriterlere uyan ürün bulunamadı.</p>
          )}

          {!error && !loading && products.length > 0 && (
            <>
              <div className="home__grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {(hasNext || hasPrev) && (
                <div className="home__pagination">
                  <button disabled={!hasPrev} onClick={() => setPage((p) => p - 1)}>← Önceki</button>
                  <span>Sayfa {page}</span>
                  <button disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>Sonraki →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
