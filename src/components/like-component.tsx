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
import { db } from "../firebase";
import styled from "styled-components";

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

const StatsContainer = styled.div`
  font-size: 13px;
  margin-right: 10px;
`;

interface LikeClickProps {
  userId: string;
  tweetId: string;
}

export default function LikeClick({ userId, tweetId }: LikeClickProps) {
  // 좋아요 상태를 관리 (예를 들어, 좋아요가 되어있는지 여부 표시)
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); // 좋아요 개수를 위한 상태

  // 좋아요 버튼이 클릭되었을 때 실행될 함수
  const onClick = async () => {
    try {
      // 'like'를 추가하기 위한 문서 경로 생성 (/tweets/{tweetId}/likes/{userId})
      const likePath = `tweets/${tweetId}/likes/${userId}`;
      const likeDocRef = doc(db, likePath);

      // 'like' 문서가 이미 존재하는지 확인
      const likeDoc = await getDoc(likeDocRef);
      if (likeDoc.exists()) {
        // 'like' 문서가 존재하면 삭제
        await deleteDoc(likeDocRef);
        console.log("Like removed successfully.");
        setIsLiked(false); // 상태를 업데이트하여 UI에 반영
        setLikeCount((prev) => prev - 1); // 좋아요 개수 감소
        return;
      }
      // 'like' 문서 생성
      await setDoc(likeDocRef, {
        userId: userId,
        createdAt: Date.now(),
      });

      setIsLiked(true); // 상태를 업데이트하여 UI에 반영
      setLikeCount((prev) => prev + 1); // 좋아요 개수 증가
      console.log("Like added successfully.");
    } catch (error) {
      console.error("Error adding/removing like: ", error);
    }
  };

  // 컴포넌트가 마운트될 때, 좋아요 상태를 확인
  useEffect(() => {
    const checkIfLiked = async () => {
      const likePath = `tweets/${tweetId}/likes/${userId}`;
      const likeDocRef = doc(db, likePath);
      const likeDoc = await getDoc(likeDocRef);
      setIsLiked(likeDoc.exists());
    };

    const fetchLikeCount = async () => {
      const likesCollectionRef = collection(db, `tweets/${tweetId}/likes`);
      const likesQuery = query(likesCollectionRef);
      const querySnapshot = await getDocs(likesQuery);
      setLikeCount(querySnapshot.docs.length); // 좋아요 개수 설정
    };

    checkIfLiked();
    fetchLikeCount();
  }, [userId, tweetId]);

  return (
    <>
      <LikeButton onClick={onClick}>
        <svg
          data-slot="icon"
          fill={isLiked ? "white" : "none"} // isLiked에 따라 fill 속성 변경
          strokeWidth="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
          ></path>
        </svg>
      </LikeButton>
      <StatsContainer>
        {likeCount > 0 ? `좋아요 ${likeCount}개` : null}
      </StatsContainer>
    </>
  );
}
