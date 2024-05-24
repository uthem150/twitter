import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets-components/tweets";
import { useParams } from "react-router-dom";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

const BookmarkIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  margin-bottom: 30px;
`;

export default function Bookmark() {
  const currentUser = auth.currentUser;

  //유저 이미지를 state로 만듦
  const [tweets, setTweets] = useState<ITweet[]>([]); //사용자의 트윗 목록을 저장 - ITweet[] 타입의 초기 상태를, 빈 배열로 설정 (ITweet는 트윗 객체를 나타내는 타입(인터페이스))
  const { userId } = useParams(); //현재 URL의 파라미터를 가져올 때 사용하는 훅 (useParams를 사용하여 userId 파라미터 값 추출)

  useEffect(() => {
    const fetchTweets = async () => {
      if (!userId) return;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const bookmarkedTweetsIds = userSnap.data().bookmark; // 현재 사용자의 북마크 배열 가져옴

        const tweetsPromises = bookmarkedTweetsIds.map(
          (tweetId: string) => getDoc(doc(db, "tweets", tweetId)) // 각 북마크된 게시글 ID에 대해 문서 가져옴
        );

        // 모든 프로미스가 해결될 때까지 기다림
        const tweetsDocs = await Promise.all(tweetsPromises);

        const tweetsArray = tweetsDocs // 데이터베이스에서 가져온 문서 스냅샷의 배열
          .filter((docSnap) => docSnap.exists()) // 존재하는 문서만 필터링
          .map((docSnap) => ({
            //필터링된 문서 스냅샷들을 순회하면서, 각 문서의 데이터(docSnap.data())를 가져와서 새로운 객체로 만듦
            ...docSnap.data(),
            id: docSnap.id,
          }));

        // tweets 배열을 역순으로 정렬하여 상태에 설정
        setTweets([...tweetsArray].reverse());
      } else {
        console.log("사용자 데이터를 찾을 수 없습니다.");
      }
    };

    if (currentUser?.uid) {
      fetchTweets();
    }
  }, [currentUser?.uid, userId]);

  return (
    <>
      <BackgroundAnimation />
      <Wrapper>
        <BookmarkIcon>
          <svg
            data-slot="icon"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            ></path>
          </svg>
        </BookmarkIcon>

        <Tweets>
          {/* tweets 배열을 .map() 함수로 순회하며, 각 tweet 객체를 <Tweet /> 컴포넌트로 변환 */}
          {tweets.map((tweet) => (
            // 각 tweet 객체의 모든 키-값 쌍이 <Tweet /> 컴포넌트의 props로 전달
            <Tweet key={tweet.id} {...tweet} />
          ))}
        </Tweets>
      </Wrapper>
    </>
  );
}
