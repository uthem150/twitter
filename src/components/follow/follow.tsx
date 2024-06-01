import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import styled from "styled-components";
import FollowingUserList from "./following-user-list";
import FollowerUserList from "./follower-user-list";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 7px 10px; //좌우 7, 상하10
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  gap: 10px;
`;

interface StatsContainerProps {
  $isActive: boolean;
}

const StatsContainer = styled.div<StatsContainerProps>`
  font-size: 15px;
  align-items: center;
  /* background-color: rgba(255, 255, 255, 0.1); // 배경색 추가 */
  border-radius: 8px;
  padding: 10px;
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }
  cursor: pointer;
  background-color: ${({ $isActive }) =>
    $isActive ? "rgba(255, 255, 255, 0.1)" : "transparent"};
  border: 2px solid
    ${({ $isActive }) =>
      $isActive ? "rgba(255, 255, 255, 0.1)" : "transparent"};
`;

const LikeButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 25px;
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }
`;

interface FollowProps {
  targetUserId?: string; //string 또는 undefined 속성
}

export default function Follow({ targetUserId }: FollowProps) {
  const [isFollowed, setIsFollowed] = useState(false); // 팔로잉 상태를 관리 (예를 들어, 팔로잉이 되어있는지 여부 표시)
  const [followerCount, setFollowerCount] = useState(0); // 팔로워 수를 위한 상태
  const [followingCount, setFollowingCount] = useState(0); // 팔로워 수를 위한 상태
  const [showFollowerList, setShowFollowerList] = useState(false); // 팔로워 목록 표시 여부
  const [showFollowingList, setShowFollowingList] = useState(false); // 팔로잉 목록 표시 여부

  useEffect(() => {
    // targetUserId가 변경될 때마다 두 state를 false로 설정
    setShowFollowerList(false);
    setShowFollowingList(false);
  }, [targetUserId]);

  const currentUser = auth.currentUser;

  // 팔로우 버튼이 클릭되었을 때 실행될 함수
  const onClick = async () => {
    // 자기 자신을 팔로우하지 못하도록 함
    if (currentUser?.uid === targetUserId) {
      console.log("You cannot follow yourself.");
      return;
    }

    // 타겟 유저의 팔로워 목록에 내 정보 추가/삭제
    try {
      // '팔로워'를 추가하기 위한 문서 경로 생성 (/users/{targetUserId}/followers/{CurrentUserId})
      const followerPath = `users/${targetUserId}/followers/${currentUser?.uid}`;
      const followDocRef = doc(db, followerPath);
      const followDoc = await getDoc(followDocRef); // 내 아이디로 된 'follow' 문서가 이미 존재하는지 확인

      if (followDoc.exists()) {
        // '내 정보'가 팔로워 목록에 존재하면 삭제
        await deleteDoc(followDocRef);
        console.log("following has been canceled - target");
        setIsFollowed(false); // 상태를 업데이트하여 UI에 반영
        setFollowerCount((prev) => prev - 1); // 팔로워 수 감소
        return;
      } else {
        // '팔로우' 문서 생성 - 팔로우 한 사람의 정보 추가
        await setDoc(followDocRef, {
          userId: currentUser?.uid,
          createdAt: Date.now(),
        });
        setIsFollowed(true); // 상태를 업데이트하여 UI에 반영
        setFollowerCount((prev) => prev + 1); // 팔로워 수 증가
        console.log("follow added successfully.");
      }
    } catch (error) {
      console.error("Error adding/removing follow: ", error);
    }

    // 내 팔로잉 목록에 타겟 유저 정보 추가/삭제
    try {
      // '팔로잉 할 유저'를 추가하기 위한 문서 경로 생성 (/users/{targetUserId}/followings/{CurrentUserId})
      const followingPath = `users/${currentUser?.uid}/followings/${targetUserId}`;
      const followingDocRef = doc(db, followingPath);
      const followDoc = await getDoc(followingDocRef); // 타겟 유저가 이미 팔로잉 목록에 있는지 확인

      if (followDoc.exists()) {
        // '타겟 유저'가 팔로잉 목록에 존재하면 삭제
        await deleteDoc(followingDocRef);
        console.log("following has been canceled - my");
        return;
      } else {
        // '팔로잉' 문서 생성 - 팔로잉 할 사람의 정보 추가
        await setDoc(followingDocRef, {
          userId: targetUserId,
          createdAt: Date.now(),
        });
        console.log("follow added successfully.");
      }
    } catch (error) {
      console.error("Error adding/removing follow: ", error);
    }
  };

  const toggleFollowerList = () => {
    setShowFollowerList((prev) => !prev); // 현재 상태를 반전
    if (showFollowingList) setShowFollowingList(false); // 만약 다른 리스트가 보이고 있다면, 그 리스트를 숨김
  };

  const toggleFollowingList = () => {
    setShowFollowingList((prev) => !prev); // 현재 상태를 반전
    if (showFollowerList) setShowFollowerList(false); // 만약 다른 리스트가 보이고 있다면, 그 리스트를 숨김
  };

  // 컴포넌트가 마운트될 때, 팔로우 상태를 확인
  useEffect(() => {
    const checkIfFollowed = async () => {
      const followerPath = `users/${targetUserId}/followers/${currentUser?.uid}`;
      const followDocRef = doc(db, followerPath);
      const followDoc = await getDoc(followDocRef);
      setIsFollowed(followDoc.exists());
    };

    // 팔로워 수를 가져오는 함수
    const fetchFollowerCount = async () => {
      if (!targetUserId) return;
      const followersCollectionRef = collection(
        db,
        `users/${targetUserId}/followers`
      );
      const followersQuery = query(followersCollectionRef);
      const querySnapshot = await getDocs(followersQuery);
      setFollowerCount(querySnapshot.docs.length); // 팔로워 수 설정
    };

    // 팔로잉 수를 가져오는 함수
    const fetchFollowingCount = async () => {
      if (!currentUser) return;
      const followingsCollectionRef = collection(
        db,
        `users/${targetUserId}/followings`
      );
      const followingsQuery = query(followingsCollectionRef);
      const querySnapshot = await getDocs(followingsQuery);
      setFollowingCount(querySnapshot.docs.length); // 팔로잉 수 설정
    };

    checkIfFollowed();
    fetchFollowerCount();
    fetchFollowingCount();
  }, [targetUserId, currentUser]);

  return (
    <>
      <Wrapper>
        {currentUser?.uid !== targetUserId ? (
          <LikeButton onClick={onClick}>
            <svg
              data-slot="icon"
              fill={isFollowed ? "white" : "none"} // isFollowed에 따라 fill 속성 변경
              strokeWidth="1.5"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
              ></path>
            </svg>
          </LikeButton>
        ) : null}
        <StatsContainer
          onClick={toggleFollowerList}
          $isActive={showFollowerList}
        >{`follower ${followerCount}`}</StatsContainer>
        <StatsContainer
          onClick={toggleFollowingList}
          $isActive={showFollowingList}
        >{`following ${followingCount}`}</StatsContainer>
      </Wrapper>

      {/* 팔로워/팔로잉 리스트 */}
      {showFollowerList && targetUserId && (
        <FollowerUserList targetUserId={targetUserId} />
      )}
      {showFollowingList && targetUserId && (
        <FollowingUserList targetUserId={targetUserId} />
      )}
    </>
  );
}
