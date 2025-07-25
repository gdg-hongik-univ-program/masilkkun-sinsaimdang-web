import React, { useState } from "react";

const tabs = ["전체", "여행지", "모임", "카페"];

const CategoryTabs = () => {
  const [active, setActive] = useState("전체");

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={tab === active ? "active" : ""}
          onClick={() => setActive(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
