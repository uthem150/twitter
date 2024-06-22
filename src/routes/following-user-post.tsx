import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets-components/tweets";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";
import { Unsubscribe } from "firebase/auth";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
  overflow-y: scroll; //양식은 고정된 상태에서 내용을 스크롤
  height: 100vh;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

const UserIcon = styled.div`
  margin-top: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  margin-bottom: 5px;
`;

const Text = styled.span`
  color: white;
  font-size: 14px;
  margin-bottom: 15px;
`;

export interface User {
  userId: string;
  createdAt: number;
}

export default function FollowingUserPost() {
  //유저 이미지를 state로 만듦
  const [tweets, setTweets] = useState<ITweet[]>([]); //사용자의 트윗 목록을 저장 - ITweet[] 타입의 초기 상태를, 빈 배열로 설정 (ITweet는 트윗 객체를 나타내는 타입(인터페이스))
  const userId = auth.currentUser?.uid;

  const [Users, setUsers] = useState<User[]>([]); //팔로우 하는 유저들의 아이디를 담을 배열(기본 값은 빈 배열)
  const currentUser = auth.currentUser;

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null; //타입은 Unsubscribe나 null(처음에는 null)

    //Firestore에서 팔로잉하는 유저 데이터를 비동기적으로 가져오는 fetchFollowings 함수 정의
    const fetchFollowings = async () => {
      //query 함수를 사용하여 "tweets" 컬렉션에서 문서들을 createdAt 필드 기준으로 내림차순으로 정렬된 쿼리를 생성
      const tweetsQuery = query(
        collection(db, `users/${userId}/followings`) // followings 서브컬렉션을 타겟으로 함
      );

      //지정된 쿼리(tweetsQuery)에 해당하는 데이터가 변경될 때마다 자동으로 호출
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        //쿼리 결과로 반환된 문서들(docs)을 순회하면서, 각 문서(doc)로부터 필요한 데이터를 추출하고 새로운 형태로 변환
        const userList = snapshot.docs.map((doc) => {
          const { createdAt } = doc.data();
          return {
            createdAt,
            userId: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음 - 게시글의 id
          };
        });
        setUsers(userList); //setUsers을 통해 추출한 유저들을 상태에 저장(상태 업데이트)
        return () => {
          //클린업 함수 : 컴포넌트가 언마운트될 때 호출되며, 실시간 리스너를 해제(unsubscribe)하는 역할
          unsubscribe && unsubscribe(); //Unsubscribe가 null이 아니면, unsubscribe 함수를 부름
        };
      });
    };
    //의존성 배열로 빈 배열([])을 전달(빈 배열은 useEffect 내부의 부수 효과가 오직 한 번만 실행되어야 함을 의미)
    fetchFollowings();
  }, [currentUser?.uid, userId]);

  useEffect(() => {
    //트윗을 가져옴
    const fetchTweets = async () => {
      if (Users.length === 0) return;

      //각 사용자에 대해, 해당 사용자의 트윗을 데이터베이스에서 가져옴
      const tweetsPromises = Users.map(async (user) => {
        //query 함수를 사용하여, userId 필드가 사용자의 userId와 일치하는 트윗들을 검색
        const userTweetsQuery = query(
          collection(db, "tweets"),
          where("userId", "==", user.userId)
        );
        //getDocs 함수로 검색 결과(트윗)를 가져옴
        const querySnapshot = await getDocs(userTweetsQuery);
        //가져온 문서들(snapshot.docs)에서 필요한 데이터를 추출하여, 각 트윗의 정보를 배열로 변환
        return querySnapshot.docs.map((doc) => {
          const {
            tweet,
            createdAt,
            updatedAt,
            userId,
            photo,
            like,
            comment,
            bookmark,
          } = doc.data();
          return {
            tweet,
            createdAt,
            updatedAt,
            userId,
            photo,
            like,
            comment,
            bookmark,
            id: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음
          };
        });
      });

      //Promise.all을 사용하여 모든 비동기 작업(트윗 가져오기)이 완료될 때까지 기다림
      const tweetsArrays = await Promise.all(tweetsPromises);
      const allTweets = tweetsArrays.flat(); //flat 메소드로 중첩 배열을 평탄화

      // createdAt을 기준으로 정렬
      allTweets.sort((a, b) => {
        if (a.createdAt < b.createdAt) return 1;
        if (a.createdAt > b.createdAt) return -1;
        return 0;
      });

      setTweets(allTweets);
    };

    fetchTweets();
  }, [Users]);

  return (
    <>
      <BackgroundAnimation />
      <Wrapper>
        <UserIcon>
          <svg
            data-slot="icon"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
            ></path>
            <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"></path>
          </svg>
        </UserIcon>
        <Text>팔로잉 유저 게시글</Text>

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
