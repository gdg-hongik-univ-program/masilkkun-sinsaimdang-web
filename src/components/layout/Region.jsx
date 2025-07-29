import { useState } from "react";
import "./Region.css"; // CSS 따로 작성

const options = [
  "서울",
  "부산",
  "제주",
  "경기",
  "경남",
  "경북",
  "전남",
  "전북",
  "충남",
  "충북",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
];

const Region = () => {
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState("");

  return (
    <div className="region-wrapper">
      <div className="region-selected" onClick={() => setOpen(!open)}>
        {region || "지역을 선택해주세요."}
      </div>
      {open && (
        <ul className="region-dropdown">
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                setRegion(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Region;
