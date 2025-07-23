// src/components/post/SortSelector.jsx

import React from "react";

const SortSelector = () => {
  return (
    <select className="text-sm border border-gray-300 rounded px-2 py-1">
      <option value="latest">최신순</option>
      <option value="popular">인기순</option>
    </select>
  );
};

export default SortSelector;
