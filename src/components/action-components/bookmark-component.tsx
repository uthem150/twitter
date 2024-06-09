import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import styled from "styled-components";

const BookmarkButton = styled.div`
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
  margin-left: auto; // 왼쪽 여백을 자동으로 설정하여 오른쪽 끝에 버튼을 배치
`;

interface BookmarkClickProps {
  userId: string;
  tweetId: string;
}

export default function BookmarkClick({ userId, tweetId }: BookmarkClickProps) {
  // 북마크 상태를 관리 (예를 들어, 북마크가 되어있는지 여부를 표시)
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 북마크 버튼이 클릭되었을 때 실행될 함수
  const onClick = async () => {
    try {
      // Firestore에서 현재 사용자의 데이터를 찾음
      // '북마크'를 추가하기 위한 문서 경로 생성
      const bookmarkPath = `users/${userId}/bookmarks/${tweetId}`;
      const bookmarkDocRef = doc(db, bookmarkPath);
      const bookmarkDoc = await getDoc(bookmarkDocRef); // 내 해당 트윗 문서가 이미 존재하는지 확인

      if (bookmarkDoc.exists()) {
        // 북마크 목록에 존재하면 삭제
        await deleteDoc(bookmarkDocRef);
        console.log("북마크 목록에서 삭제되었습니다");
        setIsBookmarked(false);
      } else {
        // '북마크' 문서 생성 - 정보 추가
        await setDoc(bookmarkDocRef, {
          userId: userId,
          createdAt: Date.now(),
        });
        console.log("북마크 목록에 추가되었습니다.");
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error adding/removing bookmark: ", error);
    }
  };

  // 컴포넌트가 마운트될 때, 북마크 상태를 확인
  useEffect(() => {
    const checkBookmark = async () => {
      const bookmarkPath = `users/${userId}/bookmarks/${tweetId}`;
      const bookmarkDocRef = doc(db, bookmarkPath);
      const bookmarkDoc = await getDoc(bookmarkDocRef); // 내 해당 트윗 문서가 이미 존재하는지 확인

      setIsBookmarked(bookmarkDoc.exists());
    };
    checkBookmark();
  }, [userId, tweetId]);

  return (
    <BookmarkButton onClick={onClick}>
      <svg
        data-slot="icon"
        fill={isBookmarked ? "white" : "none"} // isBookmarked에 따라 fill 속성 변경
        strokeWidth="1.5"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
        ></path>
      </svg>
    </BookmarkButton>
  );
}
