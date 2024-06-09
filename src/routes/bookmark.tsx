import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets-components/tweets";
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

  useEffect(() => {
    const fetchTweets = async () => {
      if (!currentUser?.uid) return;

      //Firestore에서 북마크 컬렉션을 참조
      try {
        const bookmarksRef = collection(
          db,
          "users",
          currentUser?.uid,
          "bookmarks"
        );

        const q = query(bookmarksRef, orderBy("createdAt", "asc")); //북마크 컬렉션 createdAt 필드로 내림차순 정렬하는 쿼리
        const querySnapshot = await getDocs(q); //쿼리 결과를 가져옴

        // 각 북마크 문서에 대해 트윗 데이터 가져옴
        // 쿼리에 의해 반환된 문서들 집합 (querySnapshot.docs : 각 문서의 스냅샷을 배열로 포함)
        const tweetsPromises = querySnapshot.docs.map(async (docSnap) => {
          // doc() 함수를 사용하여 "tweets" 컬렉션의 각 문서에 대한 참조 생성
          // getDoc() 함수에 이 참조 전달하여, 문서 데이터를 비동기적으로 조회 (await 키워드: getDoc() 함수 처리 완료될 때까지 기다림)
          const tweetDoc = await getDoc(doc(db, "tweets", docSnap.id));

          // 각 문서의 데이터(tweetDoc.data()), 문서 ID(tweetDoc.id)를 포함하는 객체 생성하여 반환
          // 객체 ITweet 타입으로 캐스팅
          return { ...tweetDoc.data(), id: tweetDoc.id } as ITweet;
        });

        const tweetsArray = await Promise.all(tweetsPromises); //모든 프로미스가 완료된 후 트윗 데이터 배열로 저장
        setTweets(tweetsArray);
      } catch (error) {
        console.error("북마크를 가져오는 중 오류가 발생했습니다.", error);
      }
    };

    if (currentUser?.uid) {
      fetchTweets();
    }
  }, [currentUser?.uid]);

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
