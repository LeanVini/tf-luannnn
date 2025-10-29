// Re-export para a versão correta em resources/js/React/Pages/Products
export { default } from "./resources/js/React/Pages/Products/Products";

// resources/js/React/Pages/Products/Products.tsx
import React, { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface ApiResponse {
  items: Product[];
  totalPages: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // useRef compatível com browser: número (ID retornado por setTimeout)
  const debounceRef = useRef<number | null>(null);

  // Função que faz a requisição à API
  const fetchProducts = async (query = "", pageNumber = 1) => {
    try {
      setLoading(true);
      const q = encodeURIComponent(query);
      const res = await fetch(`/api/products?query=${q}&page=${pageNumber}`);
      const data: ApiResponse = await res.json();
      setProducts(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce da busca — dispara fetch quando usuário para de digitar
  useEffect(() => {
    // Cancela o timer anterior se existir
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    // Cria um novo timer
    debounceRef.current = window.setTimeout(() => {
      fetchProducts(search, page);
    }, 500); // 500ms de atraso

    // Limpa o timeout ao desmontar o componente
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, page]); // dispara sempre que o termo de busca ou página mudar

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Listagem de Produtos</h2>

      {/* Campo de busca */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar produtos..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // reseta para página 1 sempre que buscar
        }}
      />

      {/* Indicador de carregamento */}
      {loading && <p>Carregando produtos...</p>}

      {/* Lista de produtos */}
      {!loading && (
        <ul className="list-group mb-3">
          {products.length > 0 ? (
            products.map((p) => (
              <li key={p.id} className="list-group-item d-flex justify-content-between">
                <span>{p.name}</span>
                <strong>R$ {p.price.toFixed(2)}</strong>
              </li>
            ))
          ) : (
            <li className="list-group-item text-center text-muted">Nenhum produto encontrado.</li>
          )}
        </ul>
      )}

      {/* Componente de paginação */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />
    </div>
  );
};

export default Products;
