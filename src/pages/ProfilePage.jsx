import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import { FaHeart, FaBookmark, FaArrowLeft } from "react-icons/fa";
import baseApi from "../api/baseApi";

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 사용자 정보 및 게시글 로드
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 현재 로그인한 사용자 정보 로드
        const currentUserResponse = await baseApi.get("/user/me");
        let currentUserData = null;
        if (currentUserResponse.data?.success) {
          currentUserData = currentUserResponse.data.data;
        } else if (currentUserResponse.data?.data) {
          currentUserData = currentUserResponse.data.data;
        } else if (currentUserResponse.data?.nickname) {
          currentUserData = currentUserResponse.data;
        }
        setCurrentUser(currentUserData);

        // 프로필 사용자 정보 로드 (수정된 엔드포인트)
        const userResponse = await baseApi.get(`/user/${userId}/profile`);
        let userData = null;
        if (userResponse.data?.success) {
          userData = userResponse.data.data;
        } else if (userResponse.data?.data) {
          userData = userResponse.data.data;
        } else if (userResponse.data?.nickname) {
          userData = userResponse.data;
        }

        if (userData) {
          // 팔로워/팔로잉 숫자 정보 로드 (수정된 엔드포인트)
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

          // 현재 사용자가 이 프로필을 팔로우하고 있는지 확인 (수정된 엔드포인트)
          if (currentUserData) {
            try {
              const followingResponse = await baseApi.get(
                `/user/${currentUserData.id}/following`
              );
              const followingList =
                followingResponse.data?.data || followingResponse.data || [];
              const isFollowingUser = followingList.some(
                (followUser) => followUser.id === parseInt(userId)
              );
              setIsFollowing(isFollowingUser);
            } catch (e) {
              console.error("팔로잉 상태 확인 실패:", e);
            }
          }
        } else {
          console.error("사용자 데이터를 찾을 수 없습니다:", userResponse.data);
          setError("사용자를 찾을 수 없습니다.");
        }

        // 사용자 게시글 로드 (수정된 엔드포인트)
        const userPosts = await baseApi.get(`/user/${userId}/articles`);
        const normalizedPosts =
          (Array.isArray(userPosts.data?.data?.content) &&
            userPosts.data.data.content) ||
          (Array.isArray(userPosts.data?.content) && userPosts.data.content) ||
          (Array.isArray(userPosts.data) && userPosts.data) ||
          [];
        setPosts(normalizedPosts);
      } catch (e) {
        console.error("사용자 정보 로드 실패:", e);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  // 팔로워/팔로잉 데이터 로드 (API 명세서에 맞게 수정)
  const loadFollowData = async (type) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      console.log(`Loading ${type} for user ${user.id}`); // 디버깅용

      // API 명세서에 따른 올바른 엔드포인트 사용
      const endpoint =
        type === "followers"
          ? `/user/${user.id}/followers` // 팔로워 목록
          : `/user/${user.id}/following`; // 팔로잉 목록

      const response = await baseApi.get(endpoint);
      console.log(`${type} response:`, response.data); // 디버깅용

      if (type === "followers") {
        // 다양한 응답 구조 처리
        let followersData = [];
        if (Array.isArray(response.data)) {
          followersData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          followersData = response.data.data;
        } else if (Array.isArray(response.data?.content)) {
          followersData = response.data.content;
        } else if (
          response.data?.followers &&
          Array.isArray(response.data.followers)
        ) {
          followersData = response.data.followers;
        } else {
          console.warn("Followers data is not an array:", response.data);
          followersData = [];
        }
        console.log("Processed followers data:", followersData); // 디버깅용
        setFollowers(followersData);
      } else {
        // 팔로잉 데이터도 동일하게 처리
        let followingData = [];
        if (Array.isArray(response.data)) {
          followingData = response.data;
        } else if (Array.isArray(response.data?.data)) {
          followingData = response.data.data;
        } else if (Array.isArray(response.data?.content)) {
          followingData = response.data.content;
        } else if (
          response.data?.following &&
          Array.isArray(response.data.following)
        ) {
          followingData = response.data.following;
        } else {
          console.warn("Following data is not an array:", response.data);
          followingData = [];
        }
        console.log("Processed following data:", followingData); // 디버깅용
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

  // 팔로우 정보 새로고침 (수정된 엔드포인트)
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

  // 메인 팔로우/언팔로우 처리 (수정된 엔드포인트)
  const handleMainFollow = async () => {
    if (!user?.id) return;
    try {
      const response = await baseApi.post(`/user/${user.id}/follow`);
      if (response.data?.success) {
        setIsFollowing(!isFollowing);
        await refreshFollowInfo();
      }
    } catch (e) {
      console.error("팔로우/언팔로우 실패:", e);
      setError("팔로우 처리 중 오류가 발생했습니다.");
    }
  };

  // 모달 내 팔로우/언팔로우 처리 (수정된 엔드포인트)
  const handleFollow = async (targetUserId) => {
    try {
      const isCurrentlyFollowing = followingUsers.has(targetUserId);
      const response = await baseApi.post(`/user/${targetUserId}/follow`);

      if (response.data?.success) {
        setFollowingUsers((prev) => {
          const s = new Set(prev);
          isCurrentlyFollowing ? s.delete(targetUserId) : s.add(targetUserId);
          return s;
        });

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

  const handleBack = () => {
    navigate(-1);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // 자신의 프로필인지 확인
  const isOwnProfile = currentUser?.id === parseInt(userId);

  return (
    <div className="profile-page">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="profile-loading">
          <div>로딩 중...</div>
        </div>
      )}

      {/* 헤더 */}
      <div className="profile-header-nav">
        <button className="profile-back-btn" onClick={handleBack}>
          <FaArrowLeft />
        </button>
        <h1 className="profile-header-title">{user?.nickname || "프로필"}</h1>
      </div>

      {/* 프로필 정보 */}
      <section className="profile-header">
        <img
          className="profile-avatar-lg"
          src={
            user?.profileImageUrl ||
            "https://www.studiopeople.kr/common/img/default_profile.png"
          }
          alt="프로필"
        />
        <h1 className="profile-name">{user?.nickname}</h1>

        {/* 팔로우 버튼 (자신의 프로필이 아닌 경우에만) */}
        {!isOwnProfile && (
          <button
            className={`profile-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={handleMainFollow}
          >
            {isFollowing ? "팔로잉" : "팔로우"}
          </button>
        )}

        <div className="profile-stats">
          <div className="profile-stat" onClick={() => openModal("followers")}>
            <div className="profile-stat-value">
              팔로워 {user?.followerCount?.toLocaleString?.() ?? "0"}
            </div>
          </div>
          <div className="profile-stat" onClick={() => openModal("following")}>
            <div className="profile-stat-value">
              팔로잉 {user?.followingCount?.toLocaleString?.() ?? "0"}
            </div>
          </div>
        </div>
      </section>

      {/* 섹션 헤더 */}
      <div className="profile-section-header">
        <h2 className="profile-section-title">게시글</h2>
      </div>

      {/* 게시글 리스트 */}
      <div className="profile-posts">
        {posts.length === 0 ? (
          <div className="profile-no-posts">게시글이 없습니다.</div>
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
                className="profile-card"
                onClick={() => handlePostClick(post.id)}
              >
                {/* 이미지 섹션 */}
                <div className="profile-card-images">
                  <img
                    src={post.places?.[0]?.photoUrl}
                    alt={`${post.title} 이미지 1`}
                    className="profile-card-image"
                  />
                  <img
                    src={post.places?.[1]?.photoUrl}
                    alt={`${post.title} 이미지 2`}
                    className="profile-card-image"
                  />
                </div>

                {/* 내용 섹션 */}
                <div className="profile-card-content">
                  <div className="profile-card-header">
                    <img
                      src={
                        post?.author?.profileImage ||
                        user?.profileImageUrl ||
                        "https://www.studiopeople.kr/common/img/default_profile.png"
                      }
                      alt={post?.author?.nickname || "작성자"}
                      className="profile-card-avatar"
                    />
                    <div className="profile-card-info">
                      <div className="profile-meta">
                        {post?.author?.nickname || user?.nickname}
                        {dateStr && ` • ${dateStr}`}
                      </div>
                      <h3 className="profile-title">{post.title}</h3>

                      <div className="profile-tags">
                        {Array.isArray(post?.tags) &&
                          post.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="profile-tag">
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

                      <div className="profile-actions">
                        <div className="profile-pill">
                          <FaBookmark className="profile-icon" />
                          <span>
                            {post?.scrapCount >= 1000
                              ? `${(post.scrapCount / 1000).toFixed(1)}K`
                              : post?.scrapCount ?? 0}
                          </span>
                        </div>
                        <div className="profile-pill">
                          <FaHeart className="profile-icon" />
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

      {/* 팔로워/팔로잉 모달 */}
      {showModal && (
        <div className="profile-modal-overlay" onClick={closeModal}>
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-modal-header">
              <h3>{modalType === "followers" ? "팔로워" : "팔로잉"}</h3>
              <button className="profile-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="profile-modal-body">
              {error ? (
                <div className="profile-modal-error">{error}</div>
              ) : loading ? (
                <div className="profile-modal-loading">로딩 중...</div>
              ) : (modalType === "followers" ? followers : following).length ===
                0 ? (
                <div className="profile-modal-empty">
                  {modalType === "followers"
                    ? "팔로워가 없습니다."
                    : "팔로잉이 없습니다."}
                </div>
              ) : (
                (modalType === "followers" ? followers : following).map(
                  (person) => (
                    <div key={person.id} className="profile-user-item">
                      <img
                        src={
                          person.profileImageUrl ||
                          "https://www.studiopeople.kr/common/img/default_profile.png"
                        }
                        alt={person.nickname || person.name}
                        className="profile-user-avatar"
                        onClick={() => navigate(`/profile/${person.id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="profile-user-info">
                        <span
                          className="profile-user-name"
                          onClick={() => navigate(`/profile/${person.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {person.nickname || person.name}
                        </span>
                      </div>
                      {person.id !== currentUser?.id && (
                        <button
                          className={`profile-follow-btn ${
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
      {error && <div className="profile-error">{error}</div>}
    </div>
  );
}
