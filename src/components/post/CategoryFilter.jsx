import React from "react";
import "./CategoryFilter.css";

const CategoryFilter = ({ selectedCategories = [], onCategoryChange }) => {
  const tagOptions = [
    { label: "여행지", value: "TRAVEL_SPOT" },
    { label: "맛집", value: "RESTAURANT" },
    { label: "카페", value: "CAFE" },
  ];

  const toggleTag = (tag) => {
    if (selectedCategories.some((t) => t.value === tag.value)) {
      onCategoryChange(selectedCategories.filter((t) => t.value !== tag.value));
    } else {
      onCategoryChange([...selectedCategories, tag]);
    }
  };

  return (
    <div className="category-select-container">
      {tagOptions.map((tag) => (
        <button
          key={tag.value}
          className={`category-select-chip ${
            selectedCategories.some((t) => t.value === tag.value)
              ? "selected"
              : ""
          }`}
          onClick={() => toggleTag(tag)}
          type="button"
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
