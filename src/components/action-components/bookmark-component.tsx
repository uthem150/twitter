import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  // 북마크 상태를 관리합니다. (예를 들어, 북마크가 되어있는지 여부를 표시)
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 북마크 버튼이 클릭되었을 때 실행될 함수입니다.
  const onClick = async () => {
    try {
      // Firestore에서 현재 사용자의 데이터를 찾습니다.
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        // 사용자의 데이터에서 bookmark항목을 가져옵니다.
        let bookmarks = docSnap.data().bookmark || [];
        // 현재 트윗의 id가 이미 bookmarks에 있는지 확인합니다.
        if (bookmarks.includes(tweetId)) {
          // 이미 북마크가 되어있으면 제거합니다.
          //bookmarks 배열의 각 요소(즉, 각 id)를 tweetId와 비교하여, tweetId와 같지 않은 모든 id들만을 새 배열로 모음
          bookmarks = bookmarks.filter((id: string) => id !== tweetId);
          setIsBookmarked(false);
        } else {
          // 북마크에 추가합니다.
          bookmarks.push(tweetId); // 북마크 배열에 트윗 ID를 추가합니다.
          setIsBookmarked(true);
        }
        // 데이터베이스에 변경사항을 업데이트합니다.

        await updateDoc(userRef, {
          bookmark: bookmarks,
        });
      }
    } catch (error) {
      console.error("Error updating bookmarks: ", error);
    }
  };

  // 컴포넌트가 마운트될 때, 북마크 상태를 확인
  useEffect(() => {
    const checkBookmark = async () => {
      // Firestore에서 현재 사용자의 데이터를 찾습니다.
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const bookmark = docSnap.data().bookmark || [];
        setIsBookmarked(bookmark.includes(tweetId));
      }
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
