const Region = () => {
  return (
    <select
      className="post-create-region-select"
      value={region}
      onChange={(e) => setRegion(e.target.value)}
    >
      <option value="">지역을 선택해주세요.</option>
      <option value="서울">서울</option>
      <option value="부산">부산</option>
      <option value="제주">제주</option>
      <option value="경기">경기</option>
      <option value="경남">경남</option>
      <option value="경북">경북</option>
      <option value="전남">전남</option>
      <option value="전북">전북</option>
      <option value="충남">충남</option>
      <option value="충북">충북</option>
    </select>
  );
};

export default Region;
