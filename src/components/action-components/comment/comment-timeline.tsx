import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Unsubscribe } from "firebase/auth"; //이벤트 리스너 해제 함수의 타입
import { auth, db } from "../../../firebase";
import Comment from "./comment";

//인터페이스를 사용하여 트윗 데이터의 구조를 타입스크립트로 정의
export interface IComment {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
  onDelete?: () => Promise<void>; // onDelete을 선택적 속성으로 변경
}

const Wrapper = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: column;
  overflow-y: scroll;
  width: 100%;
  margin-top: 10px;
`;

interface CmtTimelineProps {
  tweetId: string;
  cmtClicked: boolean;
  handleSubstractCmt: (status: boolean) => void;
}

export default function CmtTimeline({
  tweetId,
  cmtClicked,
  handleSubstractCmt,
}: CmtTimelineProps) {
  const [Cmts, setCmt] = useState<IComment[]>([]); //댓글 데이터를 저장할 상태 tweets 정의(트윗 배열이고, 기본 값은 빈 배열)
  const user = auth.currentUser;
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null; //타입은 Unsubscribe나 null(처음에는 null)

    //Firestore에서 트윗 데이터를 비동기적으로 가져오는 fetchTweets 함수 정의
    const fetchTweets = async () => {
      //query 함수를 사용하여 "tweets" 컬렉션에서 문서들을 createdAt 필드 기준으로 내림차순으로 정렬된 쿼리를 생성
      const tweetsQuery = query(
        collection(db, `tweets/${tweetId}/comments`), // comments 서브컬렉션을 타겟으로 함
        orderBy("createdAt", "asc"),
        limit(25) //처음 25개만 불러오도록 pagination설정
      );

      //지정된 쿼리(tweetsQuery)에 해당하는 데이터가 변경될 때마다 자동으로 호출
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
        //쿼리 결과로 반환된 문서들(docs)을 순회하면서, 각 문서(doc)로부터 필요한 데이터를 추출하고 새로운 형태로 변환
        const comments = snapshot.docs.map((doc) => {
          const { createdAt, userId, content } = doc.data();
          return {
            createdAt,
            userId,
            content,
            id: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음 - 게시글의 id
          };
        });
        setCmt(comments); //setCmt을 통해 추출한 댓글들을 상태에 저장(상태 업데이트)
        return () => {
          //클린업 함수 : 컴포넌트가 언마운트될 때 호출되며, 실시간 리스너를 해제(unsubscribe)하는 역할
          unsubscribe && unsubscribe(); //Unsubscribe가 null이 아니면, unsubscribe 함수를 부름
        };
      });
    };
    //의존성 배열로 빈 배열([])을 전달(빈 배열은 useEffect 내부의 부수 효과가 오직 한 번만 실행되어야 함을 의미)
    fetchTweets();
  }, [tweetId, cmtClicked]);

  const onDelete = async (commentId: string, commentUserId: string) => {
    const ok = confirm("Are you sure you want to delete this comment?");
    if (!user || isLoading || !ok || user?.uid !== commentUserId) return; //userId 일치하지 않으면 종료
    try {
      setLoading(true);

      const commentDocRef = doc(db, `tweets/${tweetId}/comments/${commentId}`);
      await deleteDoc(commentDocRef);
      // deleteDoc의 매개변수는 삭제할 문서에 대한 참조. doc함수를 사용하여 해당 참조 불러옴
      //firebase 인스턴스 db넘겨주고, 문서가 저장된 경로 제공(tweets 컬렉션에 저장되어 있음), 해당 문서는 id를 가짐
      handleSubstractCmt(true);
    } catch (e) {
      console.error("Error removing comment: ", e);
    } finally {
      console.log("Comment removed successfully.");
      setLoading(false);
      handleSubstractCmt(false);
    }
  };

  return (
    <Wrapper>
      {Cmts.map((comment) => (
        <Comment
          key={comment.id}
          {...comment}
          onDelete={() => onDelete(comment.id, comment.userId)}
        /> //React가 목록의 각 요소를 유일하게 식별할 수 있도록 key={comment.id}
        //{...tweet}으로 트윗 객체의 모든 속성을 Tweet 컴포넌트에 prop으로 전달
      ))}
    </Wrapper>
  );
}
