import { useState } from "react";
import "./Region.css";

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

const Region = ({ region, setRegion }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="region-wrapper">
      <div className="region-selected" onClick={() => setOpen(!open)}>
        {region || "지역"}
      </div>
      {open && (
        <ul className="region-dropdown">
          <li
            onClick={() => {
              setRegion("");
              setOpen(false);
            }}
          >
            지역
          </li>
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
