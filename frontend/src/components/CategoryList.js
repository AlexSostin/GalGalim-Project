import React, { useEffect, useState } from 'react';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/bikes/api/categories/') // Убедитесь, что этот URL соответствует вашему API
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Ошибка при загрузке данных:', error));
    }, []);

    return (
        <div>
            <h2>Категории Велосипедов</h2>
            <ul>
                {categories.map(category => (
                    <li key={category.id}>
                        <h3>{category.name}</h3>
                        {category.image && <img src={category.image} alt={category.name} style={{ width: '100px' }} />}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryList;