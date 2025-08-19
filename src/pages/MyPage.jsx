import { useEffect, useState } from "react";
import "./MyPage.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import baseApi from "../api/baseApi";

export default function MyPage() {
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
        const userResponse = await baseApi.get("/api/user/me");
        if (userResponse.data?.success) {
          const userData = userResponse.data.data;

          // 팔로워/팔로잉 숫자 정보 로드
          const followInfoResponse = await baseApi.get(
            `/api/users/${userData.id}/follow-info`
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
          setEditForm({
            nickname: userData.nickname || "",
            profileImageUrl: userData.profileImageUrl || "",
          });
        }

        // 사용자 게시글 로드 (응답 형태 정규화)
        const myPosts = await baseApi.get("/articles/me");
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
  const loadFollowData = async (type) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      const response = await baseApi.get(`/api/users/${user.id}/${type}`);

      if (type === "followers") {
        setFollowers(response.data?.data || response.data || []);
      } else {
        const followingData = response.data?.data || response.data || [];
        setFollowing(followingData);
        setFollowingUsers(new Set(followingData.map((u) => u.id)));
      }
    } catch (e) {
      console.error(`${type} 데이터 로드 실패:`, e);
      setError(
        `${
          type === "followers" ? "팔로워" : "팔로잉"
        } 목록을 불러오는데 실패했습니다.`
      );
    } finally {
      setLoading(false);
    }
  };

  // 팔로우 정보 새로고침
  const refreshFollowInfo = async () => {
    if (!user?.id) return;
    try {
      const followInfoResponse = await baseApi.get(
        `/api/users/${user.id}/follow-info`
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
      const response = await baseApi.post(`/api/users/${userId}/follow`);

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
  };

  const closeProfileEdit = () => {
    setIsEditingProfile(false);
    setError(null);
    setLoading(false);
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const response = await baseApi.put("/api/user/me", {
        nickname: editForm.nickname,
        profileImageUrl: editForm.profileImageUrl,
      });

      if (response.data?.success) {
        const userResponse = await baseApi.get("/api/user/me");
        if (userResponse.data?.success) {
          const userData = userResponse.data.data;

          const followInfoResponse = await baseApi.get(
            `/api/users/${userData.id}/follow-info`
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
        }
        setIsEditingProfile(false);
      }
    } catch (e) {
      console.error("프로필 업데이트 실패:", e);
      setError("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm((prev) => ({
        ...prev,
        profileImageUrl: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="myp">
      {loading && <div className="myp-loading">로딩 중...</div>}

      {/* 헤더 */}
      <section className="myp-header">
        <img
          className="myp-avatar-lg"
          src={
            user?.profileImageUrl ||
            "https://www.studiopeople.kr/common/img/default_profile.png"
          }
          alt="프로필"
        />
        <h1 className="myp-name">{user?.nickname ?? "여행가 마실쿤"}</h1>
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
        {posts.map((post) => {
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
        })}
      </div>

      {/* 프로필 수정 모달 */}
      {isEditingProfile && (
        <div className="myp-modal-overlay" onClick={closeProfileEdit}>
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
                      />
                      <div className="myp-user-info">
                        <span className="myp-user-name">
                          {person.nickname || person.name}
                        </span>
                      </div>
                      <button
                        className={`myp-follow-btn ${
                          followingUsers.has(person.id) ? "following" : ""
                        }`}
                        onClick={() => handleFollow(person.id)}
                        disabled={loading}
                      >
                        {followingUsers.has(person.id) ? "팔로잉" : "팔로우"}
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
