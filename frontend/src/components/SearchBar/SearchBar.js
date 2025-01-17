import React, { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Используем useEffect для обработки поискового запроса
  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim()) {
        try {
          const response = await fetch(`/api/products/search/?search=${searchTerm}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    };

    // Добавляем задержку перед отправкой запроса (debounce)
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    // Очищаем таймер при каждом новом вводе
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {searchTerm && (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(product => (
              <div key={product.id} className="search-result-item">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.price} ₪</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;