import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import styled from "styled-components";
import Tweet from "./tweets";
import { Unsubscribe } from "firebase/auth"; //이벤트 리스너 해제 함수의 타입

//인터페이스를 사용하여 트윗 데이터의 구조를 타입스크립트로 정의
export interface ITweet {
  id: string;
  photo?: string; //사진은 필수가 아니므로 없을 수도 있음(선택적 속성)
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  overflow-y: scroll;
`;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]); //트윗 데이터를 저장할 상태 tweets 정의(트윗 배열이고, 기본 값은 빈 배열)

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null; //타입은 Unsubscribe나 null(처음에는 null)

    //Firestore에서 트윗 데이터를 비동기적으로 가져오는 fetchTweets 함수 정의
    const fetchTweets = async () => {
      //query 함수를 사용하여 "tweets" 컬렉션에서 문서들을 createdAt 필드 기준으로 내림차순으로 정렬된 쿼리를 생성
      const tweetsQuery = query(
        collection(db, "tweets"), //어떤 컬렉션을 쿼리하고 싶은지 정의. (firestore 인스턴스를 매개변수로 넘겨야 함. 타겟은 tweets컬렉션)
        orderBy("createdAt", "desc"),
        limit(25) //처음 25개만 불러오도록 pagination설정
      );
      // const snapshot = await getDocs(tweetsQuery); //getDocs 함수로 쿼리를 실행하여 문서들의 스냅샷을 가져옴
      // const tweets = snapshot.docs.map((doc) => {
      //   const { tweet, createdAt, userId, username, photo } = doc.data();
      //   return {
      //     tweet,
      //     createdAt,
      //     userId,
      //     username,
      //     photo,
      //     id: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음
      //   };
      // });

      //지정된 쿼리(tweetsQuery)에 해당하는 데이터가 변경될 때마다 자동으로 호출
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        //쿼리 결과로 반환된 문서들(docs)을 순회하면서, 각 문서(doc)로부터 필요한 데이터를 추출하고 새로운 형태로 변환
        const tweets = snapshot.docs.map((doc) => {
          const { tweet, createdAt, userId, username, photo } = doc.data();
          return {
            tweet,
            createdAt,
            userId,
            username,
            photo,
            id: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음 - 게시글의 id
          };
        });
        setTweet(tweets); //setTweet을 통해 추출한 트윗들을 상태에 저장(상태 업데이트)
        return () => {
          //useEffect는 유저가 화면을 보지 않을 때, 값을 반환하면서 클린업 함수 실행 (컴포넌트 안볼 때)
          //클린업 함수 : 컴포넌트가 언마운트될 때 호출되며, 실시간 리스너를 해제(unsubscribe)하는 역할
          unsubscribe && unsubscribe(); //Unsubscribe가 null이 아니면, unsubscribe 함수를 부름
        };
      });
    };
    //의존성 배열로 빈 배열([])을 전달(빈 배열은 useEffect 내부의 부수 효과가 오직 한 번만 실행되어야 함을 의미)
    fetchTweets();
  }, []);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} /> //React가 목록의 각 요소를 유일하게 식별할 수 있도록 key={tweet.id}
        //{...tweet}으로 트윗 객체의 모든 속성을 Tweet 컴포넌트에 prop으로 전달
      ))}
    </Wrapper>
  );
}
