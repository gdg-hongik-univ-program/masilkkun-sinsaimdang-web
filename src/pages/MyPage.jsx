import { useEffect, useState } from "react";
import "./MyPage.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import baseApi from "../api/baseApi";

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: "",
    profileImageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 정보 및 게시글 로드
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 사용자 기본 정보 로드
        const userResponse = await baseApi.get("/user/me");
        console.log("마이페이지 사용자 정보:", userResponse.data);

        // API 응답 구조에 따른 유연한 처리
        let userData = null;
        if (userResponse.data?.success) {
          userData = userResponse.data.data;
        } else if (userResponse.data?.data) {
          userData = userResponse.data.data;
        } else if (userResponse.data?.nickname) {
          userData = userResponse.data;
        }

        console.log("사용자 데이터:", userData);

        if (userData) {
          // 팔로워/팔로잉 숫자 정보 로드
          const followInfoResponse = await baseApi.get(
            `/user/${userData.id}/follow-info`
          );
          const followInfo =
            followInfoResponse.data?.data || followInfoResponse.data || {};

          const completeUserData = {
            ...userData,
            followerCount:
              followInfo.followerCount ?? userData.followerCount ?? 0,
            followingCount:
              followInfo.followingCount ?? userData.followingCount ?? 0,
          };

          console.log("완성된 사용자 데이터:", completeUserData);
          setUser(completeUserData);
          setEditForm({
            nickname: userData.nickname || userData.name || "",
            profileImageUrl: userData.profileImageUrl || "",
          });
        } else {
          console.error("사용자 데이터를 찾을 수 없습니다:", userResponse.data);
        }

        // 사용자 게시글 로드 (응답 형태 정규화)
        const myPosts = await baseApi.get("/user/scraps");
        const normalizedPosts =
          (Array.isArray(myPosts.data?.data?.content) &&
            myPosts.data.data.content) ||
          (Array.isArray(myPosts.data?.content) && myPosts.data.content) ||
          (Array.isArray(myPosts.data) && myPosts.data) ||
          [];
        setPosts(normalizedPosts);
      } catch (e) {
        console.error("사용자 정보 로드 실패:", e);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 팔로워/팔로잉 데이터 로드
  const loadFollowDataAlternative = async (type) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      // 백엔드 API 명세에 따라 엔드포인트 조정
      let endpoint;
      if (type === "followers") {
        // 가능한 팔로워 API 엔드포인트들
        endpoint = `/user/${user.id}/followers`; // 또는
        // endpoint = `/users/${user.id}/followers`; // 또는
        // endpoint = `/follow/${user.id}/followers`; // 또는
        // endpoint = `/api/users/${user.id}/followers`;
      } else {
        endpoint = `/user/${user.id}/following`;
      }

      console.log(`API 호출: ${endpoint}`);
      const response = await baseApi.get(endpoint);

      // 응답 데이터 구조 확인
      console.log(`${type} 응답:`, response.data);

      if (type === "followers") {
        // 다양한 응답 구조에 대응
        const followersData =
          response.data?.data?.content || // 페이징된 응답
          response.data?.data || // 일반적인 응답
          response.data?.followers || // 특정 필드명
          response.data || // 직접 배열
          [];

        setFollowers(Array.isArray(followersData) ? followersData : []);
      } else {
        const followingData =
          response.data?.data?.content ||
          response.data?.data ||
          response.data?.following ||
          response.data ||
          [];

        const followingArray = Array.isArray(followingData)
          ? followingData
          : [];
        setFollowing(followingArray);
        setFollowingUsers(new Set(followingArray.map((u) => u.id)));
      }
    } catch (e) {
      console.error(`${type} 데이터 로드 실패:`, e);

      // 상세한 에러 정보 로깅
      if (e.response) {
        console.error("HTTP 상태:", e.response.status);
        console.error("에러 데이터:", e.response.data);
        console.error("에러 헤더:", e.response.headers);
      }

      setError(
        `${
          type === "followers" ? "팔로워" : "팔로잉"
        } 목록을 불러오는데 실패했습니다. (${
          e.response?.status || "Network Error"
        })`
      );
    } finally {
      setLoading(false);
    }
  };

  // loadFollowData 함수 추가 (기존 코드에서 사용됨)
  const loadFollowData = loadFollowDataAlternative;

  // 팔로우 정보 새로고침
  const refreshFollowInfo = async () => {
    if (!user?.id) return;
    try {
      const followInfoResponse = await baseApi.get(
        `/user/${user.id}/follow-info`
      );
      const followInfo =
        followInfoResponse.data?.data || followInfoResponse.data || {};
      setUser((prev) => ({
        ...prev,
        followerCount: followInfo.followerCount ?? prev.followerCount ?? 0,
        followingCount: followInfo.followingCount ?? prev.followingCount ?? 0,
      }));
    } catch (e) {
      console.error("팔로우 정보 새로고침 실패:", e);
    }
  };

  // 팔로우/언팔로우 처리
  const handleFollow = async (userId) => {
    try {
      const isCurrentlyFollowing = followingUsers.has(userId);
      const response = await baseApi.post(`/user/${userId}/follow`);

      if (response.data?.success) {
        setFollowingUsers((prev) => {
          const s = new Set(prev);
          isCurrentlyFollowing ? s.delete(userId) : s.add(userId);
          return s;
        });

        await refreshFollowInfo();

        if (showModal) {
          await loadFollowData(modalType);
        }
      }
    } catch (e) {
      console.error("팔로우/언팔로우 실패:", e);
      setError("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  const openModal = async (type) => {
    setModalType(type);
    setShowModal(true);
    await loadFollowData(type);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setError(null);
    setLoading(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode((v) => !v);
    setSelectedPosts(new Set());
  };

  const togglePostSelection = (postId) => {
    setSelectedPosts((prev) => {
      const s = new Set(prev);
      s.has(postId) ? s.delete(postId) : s.add(postId);
      return s;
    });
  };

  const deletePosts = async () => {
    try {
      setLoading(true);
      const ids = Array.from(selectedPosts);
      await Promise.all(ids.map((id) => baseApi.delete(`/articles/${id}`)));
      setPosts((prev) => prev.filter((p) => !selectedPosts.has(p.id)));
      setSelectedPosts(new Set());
      setIsDeleteMode(false);
    } catch (e) {
      console.error("게시글 삭제 실패:", e);
      setError("게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const openProfileEdit = () => {
    setIsEditingProfile(true);
    setEditForm({
      nickname: user?.nickname || "",
      profileImageUrl: user?.profileImageUrl || "",
    });
    setError(null);
  };

  const closeProfileEdit = () => {
    // editForm을 원래 사용자 정보로 복원
    setEditForm({
      nickname: user?.nickname || "",
      profileImageUrl: user?.profileImageUrl || "",
    });
    setIsEditingProfile(false);
    setError(null);
    setLoading(false);
  };

  // 🔧 수정된 saveProfile 함수 (괄호 문제 해결)
  const saveProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let finalProfileImageUrl = editForm.profileImageUrl;

      // base64 데이터인 경우 (새로 업로드된 이미지)
      if (
        editForm.profileImageUrl &&
        editForm.profileImageUrl.startsWith("data:image/")
      ) {
        try {
          const formData = new FormData();
          const response = await fetch(editForm.profileImageUrl);
          const blob = await response.blob();
          formData.append("profileImage", blob, "profile.jpg");

          const uploadResponse = await baseApi.post(
            "/user/profile-image",
            formData
          );

          console.log("이미지 업로드 응답:", uploadResponse.data);
          console.log(
            "추출할 URL:",
            uploadResponse.data?.data?.profileImageUrl
          );

          finalProfileImageUrl =
            uploadResponse.data?.data?.profileImageUrl ||
            uploadResponse.data?.profileImageUrl ||
            uploadResponse.data?.data?.url ||
            uploadResponse.data?.url ||
            uploadResponse.data?.imageUrl;

          console.log("최종 이미지 URL:", finalProfileImageUrl);

          if (!finalProfileImageUrl) {
            throw new Error("이미지 업로드 응답에서 URL을 찾을 수 없습니다.");
          }
        } catch (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          setError(`이미지 업로드에 실패했습니다: ${uploadError.message}`);
          return;
        }
      }

      // 즉시 로컬 상태 업데이트
      const updatedUser = {
        ...user,
        nickname: editForm.nickname,
        profileImageUrl: finalProfileImageUrl,
      };
      setUser(updatedUser);

      // 프로필 정보 업데이트
      const updateData = {
        nickname: editForm.nickname,
        profileImageUrl: finalProfileImageUrl,
      };

      const response = await baseApi.put("/user/me", updateData);

      if (response.data?.success || response.status === 200) {
        setEditForm({
          nickname: editForm.nickname,
          profileImageUrl: finalProfileImageUrl,
        });

        setIsEditingProfile(false);

        // 🎯 사이드바 업데이트를 위한 이벤트 발생
        window.dispatchEvent(
          new CustomEvent("userProfileUpdated", {
            detail: {
              nickname: editForm.nickname,
              profileImageUrl: finalProfileImageUrl,
              user: updatedUser,
            },
          })
        );

        // 백그라운드 동기화
        try {
          const userResponse = await baseApi.get("/user/me");
          const userData = userResponse.data?.success
            ? userResponse.data.data
            : userResponse.data?.data
            ? userResponse.data.data
            : userResponse.data?.nickname
            ? userResponse.data
            : null;

          if (userData) {
            const followInfoResponse = await baseApi.get(
              `/user/${userData.id}/follow-info`
            );
            const followInfo =
              followInfoResponse.data?.data || followInfoResponse.data || {};

            const completeUserData = {
              ...userData,
              followerCount:
                followInfo.followerCount ?? userData.followerCount ?? 0,
              followingCount:
                followInfo.followingCount ?? userData.followingCount ?? 0,
            };

            setUser(completeUserData);

            // 최종 동기화 이벤트 발생
            window.dispatchEvent(
              new CustomEvent("userProfileUpdated", {
                detail: {
                  nickname: completeUserData.nickname,
                  profileImageUrl: completeUserData.profileImageUrl,
                  user: completeUserData,
                },
              })
            );
          }
        } catch (syncError) {
          console.warn("백그라운드 동기화 실패:", syncError);
        }
      } else {
        setUser(user);
        setError("프로필 업데이트에 실패했습니다.");
      }
    } catch (e) {
      console.error("프로필 업데이트 실패:", e);
      setUser(user);
      setError(
        `프로필 업데이트 중 오류가 발생했습니다: ${
          e.response?.data?.message || e.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 수정된 handleImageUpload 함수
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (예: 5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 파일은 5MB 이하여야 합니다.");
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      setEditForm((prev) => ({
        ...prev,
        profileImageUrl: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleUserProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="myp-page">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="myp-loading-overlay">
          <div>로딩 중...</div>
        </div>
      )}

      {/* 헤더 네비게이션 */}
      <div className="myp-header-nav">
        <h1 className="myp-header-title">마이페이지</h1>
      </div>

      {/* 헤더 */}
      <section className="myp-header">
        <img
          className="myp-avatar-lg"
          src={
            user?.profileImageUrl ||
            "https://www.studiopeople.kr/common/img/default_profile.png"
          }
          alt="프로필"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <h1 className="myp-name">{user?.nickname}</h1>
        <button className="myp-edit-btn" onClick={openProfileEdit}>
          수정
        </button>

        <div className="myp-stats">
          <div className="myp-stat" onClick={() => openModal("followers")}>
            <div className="myp-stat-value">
              팔로워 {user?.followerCount?.toLocaleString?.() ?? "0"}
            </div>
          </div>
          <div className="myp-stat" onClick={() => openModal("following")}>
            <div className="myp-stat-value">
              팔로잉 {user?.followingCount?.toLocaleString?.() ?? "0"}
            </div>
          </div>
        </div>
      </section>

      {/* 섹션 헤더 */}
      <div className="myp-section-header">
        <h2 className="myp-section-title">내 게시글</h2>
        {!isDeleteMode ? (
          <button className="myp-edit-posts-btn" onClick={toggleDeleteMode}>
            삭제
          </button>
        ) : (
          <div className="myp-delete-actions">
            <button className="myp-cancel-btn" onClick={toggleDeleteMode}>
              취소
            </button>
            <button
              className="myp-delete-btn"
              onClick={deletePosts}
              disabled={selectedPosts.size === 0 || loading}
            >
              삭제 ({selectedPosts.size})
            </button>
          </div>
        )}
      </div>

      {/* 게시글 리스트 */}
      <div className="myp-posts">
        {posts.length === 0 ? (
          <div className="myp-no-posts">게시글이 없습니다.</div>
        ) : (
          posts.map((post) => {
            const img1 =
              post?.photos?.[0] || post?.image1 || "/default-image.png";
            const img2 =
              post?.photos?.[1] ||
              post?.image2 ||
              post?.photos?.[0] ||
              "/default-image.png";
            const dateStr = post?.createdAt
              ? new Date(post.createdAt).toString() !== "Invalid Date"
                ? new Date(post.createdAt).toLocaleDateString("ko-KR")
                : ""
              : "";

            return (
              <div
                key={post.id}
                className={`myp-card ${isDeleteMode ? "delete-mode" : ""} ${
                  selectedPosts.has(post.id) ? "selected" : ""
                }`}
                onClick={
                  !isDeleteMode ? () => handlePostClick(post.id) : undefined
                }
              >
                {isDeleteMode && (
                  <div className="myp-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedPosts.has(post.id)}
                      onChange={() => togglePostSelection(post.id)}
                      className="myp-checkbox"
                    />
                  </div>
                )}

                {/* 이미지 섹션 */}
                <div className="myp-card-images">
                  <img
                    src={img1}
                    alt={`${post.title} 이미지 1`}
                    className="myp-card-image"
                  />
                  <img
                    src={img2}
                    alt={`${post.title} 이미지 2`}
                    className="myp-card-image"
                  />
                </div>

                {/* 내용 섹션 */}
                <div className="myp-card-content">
                  <div className="myp-card-header">
                    <img
                      src={
                        post?.author?.profileImage ||
                        user?.profileImageUrl ||
                        "https://www.studiopeople.kr/common/img/default_profile.png"
                      }
                      alt={post?.author?.nickname || "작성자"}
                      className="myp-card-avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                    <div className="myp-card-info">
                      <div className="myp-meta">
                        {post?.author?.nickname || user?.nickname}
                        {dateStr && ` • ${dateStr}`}
                      </div>
                      <h3 className="myp-title">{post.title}</h3>

                      <div className="myp-tags">
                        {Array.isArray(post?.tags) &&
                          post.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="myp-tag">
                              #
                              {tag === "TRAVEL"
                                ? "여행지"
                                : tag === "RESTAURANT"
                                ? "맛집"
                                : tag === "CAFE"
                                ? "카페"
                                : tag}
                            </span>
                          ))}
                      </div>

                      <div className="myp-actions">
                        <div className="myp-pill">
                          <FaBookmark className="myp-icon" />
                          <span>
                            {post?.scrapCount >= 1000
                              ? `${(post.scrapCount / 1000).toFixed(1)}K`
                              : post?.scrapCount ?? 0}
                          </span>
                        </div>
                        <div className="myp-pill">
                          <FaHeart className="myp-icon" />
                          <span>
                            {post?.likeCount >= 1000
                              ? `${(post.likeCount / 1000).toFixed(1)}K`
                              : post?.likeCount ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 프로필 수정 모달 */}
      {isEditingProfile && (
        <div
          className="myp-modal-overlay myp-profile-edit-modal"
          onClick={closeProfileEdit}
        >
          <div
            className="myp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="myp-modal-header">
              <h3>프로필 수정</h3>
              <button className="myp-modal-close" onClick={closeProfileEdit}>
                ×
              </button>
            </div>
            <div className="myp-modal-body">
              <div className="myp-form-group">
                <label>프로필 이미지</label>
                <div className="myp-image-upload-section">
                  <div className="myp-current-image">
                    <img
                      src={
                        editForm.profileImageUrl ||
                        "https://www.studiopeople.kr/common/img/default_profile.png"
                      }
                      alt="프로필 미리보기"
                      className="myp-preview-image"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                    />
                  </div>
                  <div className="myp-upload-buttons">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="myp-file-input"
                    />
                    <label htmlFor="imageUpload" className="myp-upload-btn">
                      이미지 선택
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          profileImageUrl:
                            "https://www.studiopeople.kr/common/img/default_profile.png",
                        }))
                      }
                      className="myp-default-btn"
                    >
                      기본 이미지
                    </button>
                    <input
                      type="url"
                      placeholder="또는 이미지 URL 입력"
                      value={editForm.profileImageUrl}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          profileImageUrl: e.target.value,
                        }))
                      }
                      className="myp-url-input"
                    />
                  </div>
                </div>
              </div>

              <div className="myp-form-group">
                <label htmlFor="nickname">닉네임</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={editForm.nickname}
                  onChange={handleInputChange}
                  className="myp-form-input"
                />
              </div>

              <div className="myp-form-actions">
                <button className="myp-cancel-btn" onClick={closeProfileEdit}>
                  취소
                </button>
                <button
                  className="myp-save-btn"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 팔로워/팔로잉 모달 */}
      {showModal && (
        <div className="myp-modal-overlay" onClick={closeModal}>
          <div
            className="myp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="myp-modal-header">
              <h3>{modalType === "followers" ? "팔로워" : "팔로잉"}</h3>
              <button className="myp-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="myp-modal-body">
              {loading ? (
                <div className="myp-modal-loading">로딩 중...</div>
              ) : (
                (modalType === "followers" ? followers : following).map(
                  (person) => (
                    <div key={person.id} className="myp-user-item">
                      <img
                        src={
                          person.profileImageUrl ||
                          "https://www.studiopeople.kr/common/img/default_profile.png"
                        }
                        alt={person.nickname || person.name}
                        className="myp-user-avatar"
                        onClick={() => handleUserProfileClick(person.id)}
                        style={{
                          cursor: "pointer",
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                      />
                      <div className="myp-user-info">
                        <span
                          className="myp-user-name"
                          onClick={() => handleUserProfileClick(person.id)}
                          style={{ cursor: "pointer" }}
                        >
                          {person.nickname || person.name}
                        </span>
                      </div>
                      {person.id !== user?.id && (
                        <button
                          className={`myp-follow-btn ${
                            followingUsers.has(person.id) ? "following" : ""
                          }`}
                          onClick={() => handleFollow(person.id)}
                          disabled={loading}
                        >
                          {followingUsers.has(person.id) ? "팔로잉" : "팔로우"}
                        </button>
                      )}
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <div className="myp-error">{error}</div>}
    </div>
  );
}
