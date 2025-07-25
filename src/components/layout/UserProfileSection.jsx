import React from "react";

const UserProfileSection = () => {
  return (
    <div className="flex flex-col items-center gap-1">
      <img src="/profile.png" alt="유저" className="w-10 h-10 rounded-full" />
      <span className="text-xs"> 님</span>
    </div>
  );
};

export default UserProfileSection;
