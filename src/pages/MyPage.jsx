import { useEffect, useState } from "react";
import "./MyPage.css";
import { FaHeart, FaBookmark } from "react-icons/fa";
import PostCard from "../components/post/PostCard"; // PostCard 컴포넌트 import 추가
// API 연결할 때만 필요
// import baseApi from "../api/baseApi";

const USE_MOCK = true;

const mockUser = {
  name: "이혁",
  profileImage:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face",
  followerCount: 1000,
  followingCount: 1000,
};

const mockFollowers = [
  {
    id: 1,
    name: "김민수",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    isFollowing: true,
  },
  {
    id: 2,
    name: "박지영",
    profileImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=80&h=80&fit=crop&crop=face",
    isFollowing: false,
  },
  {
    id: 3,
    name: "이준호",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    isFollowing: true,
  },
  {
    id: 4,
    name: "최서연",
    profileImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    isFollowing: false,
  },
];

const mockFollowing = [
  {
    id: 5,
    name: "정우진",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    isFollowing: true,
  },
  {
    id: 6,
    name: "한소희",
    profileImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    isFollowing: true,
  },
  {
    id: 7,
    name: "강동원",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
    isFollowing: true,
  },
];

// PostCard에 맞는 데이터 구조로 수정
const mockPosts = [
  {
    id: 1,
    title: "장소이름 대충 수원화성",
    author: {
      nickname: "이혁",
      profileImage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
    },
    createdAt: "2000-01-01T00:00:00.000Z",
    tags: ["TRAVEL", "RESTAURANT", "CAFE"],
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=240&h=180&fit=crop",
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=240&h=180&fit=crop",
    ],
    scrapCount: 1000,
    likeCount: 1000,
  },
  {
    id: 2,
    title: "장소이름 대충 수원화성",
    author: {
      nickname: "이혁",
      profileImage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
    },
    createdAt: "2000-01-01T00:00:00.000Z",
    tags: ["TRAVEL", "RESTAURANT", "CAFE"],
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=240&h=180&fit=crop",
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=240&h=180&fit=crop",
    ],
    scrapCount: 1000,
    likeCount: 1000,
  },
  {
    id: 3,
    title: "장소이름 대충 수원화성",
    author: {
      nickname: "이혁",
      profileImage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
    },
    createdAt: "2000-01-01T00:00:00.000Z",
    tags: ["TRAVEL", "RESTAURANT", "CAFE"],
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=240&h=180&fit=crop",
      "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=240&h=180&fit=crop",
    ],
    scrapCount: 1000,
    likeCount: 1000,
  },
];

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
  const [editForm, setEditForm] = useState({ name: "", profileImage: "" });

  useEffect(() => {
    if (USE_MOCK) {
      setUser(mockUser);
      setPosts(mockPosts);
      setFollowers(mockFollowers);
      setFollowing(mockFollowing);
      setFollowingUsers(new Set(mockFollowing.map((user) => user.id)));
      setEditForm({ name: mockUser.name, profileImage: mockUser.profileImage });
      return;
    }

    // 🔻 API 버전으로 전환 시 주석 해제
    // (async () => {
    //   try {
    //     const me = await baseApi.get("/user/me");
    //     setUser(me.data);
    //     const myPosts = await baseApi.get("/articles/me");
    //     setPosts(myPosts.data?.content ?? myPosts.data ?? []);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // })();
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const handleFollow = (userId) => {
    setFollowingUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedPosts(new Set());
  };

  const togglePostSelection = (postId) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const deletePosts = () => {
    setPosts((prev) => prev.filter((post) => !selectedPosts.has(post.id)));
    setSelectedPosts(new Set());
    setIsDeleteMode(false);
  };

  const openProfileEdit = () => {
    setIsEditingProfile(true);
    setEditForm({
      name: user?.name || "",
      profileImage: user?.profileImage || "",
    });
  };

  const closeProfileEdit = () => {
    setIsEditingProfile(false);
  };

  const saveProfile = () => {
    setUser((prev) => ({
      ...prev,
      name: editForm.name,
      profileImage: editForm.profileImage,
    }));
    setIsEditingProfile(false);
  };

  const handleInputChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm((prev) => ({ ...prev, profileImage: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="myp">
      {/* 헤더 */}
      <section className="myp-header">
        <img
          className="myp-avatar-lg"
          src={
            user?.profileImage ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face"
          }
          alt="프로필"
        />
        <h1 className="myp-name">{user?.name ?? "이혁"}</h1>
        <button className="myp-edit-btn" onClick={openProfileEdit}>
          수정
        </button>

        <div className="myp-stats">
          <div className="myp-stat" onClick={() => openModal("followers")}>
            <div className="myp-stat-value">
              팔로워 {user?.followerCount?.toLocaleString() ?? "1,000"}
            </div>
          </div>
          <div className="myp-stat" onClick={() => openModal("following")}>
            <div className="myp-stat-value">
              팔로잉 {user?.followingCount?.toLocaleString() ?? "1,000"}
            </div>
          </div>
        </div>
      </section>

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
              disabled={selectedPosts.size === 0}
            >
              삭제 ({selectedPosts.size})
            </button>
          </div>
        )}
      </div>

      {/* PostCard를 사용한 게시글 리스트 */}
      <div className="myp-posts">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`myp-post-wrapper ${isDeleteMode ? "delete-mode" : ""} ${
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
            <PostCard post={post} />
          </div>
        ))}
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
                        editForm.profileImage ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face"
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
                      value={editForm.profileImage}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          profileImage: e.target.value,
                        }))
                      }
                      className="myp-url-input"
                    />
                  </div>
                </div>
              </div>

              <div className="myp-form-group">
                <label htmlFor="name">이름</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="myp-form-input"
                />
              </div>
              <div className="myp-form-actions">
                <button className="myp-cancel-btn" onClick={closeProfileEdit}>
                  취소
                </button>
                <button className="myp-save-btn" onClick={saveProfile}>
                  저장
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
              {(modalType === "followers" ? followers : following).map(
                (person) => (
                  <div key={person.id} className="myp-user-item">
                    <img
                      src={person.profileImage}
                      alt={person.name}
                      className="myp-user-avatar"
                    />
                    <div className="myp-user-info">
                      <span className="myp-user-name">{person.name}</span>
                    </div>
                    <button
                      className={`myp-follow-btn ${
                        followingUsers.has(person.id) ? "following" : ""
                      }`}
                      onClick={() => handleFollow(person.id)}
                    >
                      {followingUsers.has(person.id) ? "팔로잉" : "팔로우"}
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
