// src/components/common/CategoryFilter.jsx
import React from "react";

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = ["여행지", "맛집", "카페"];

  return (
    <div className="category-btns">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
          onClick={() => onCategoryChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
