import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Unsubscribe } from "firebase/auth"; //이벤트 리스너 해제 함수의 타입
import FollowUser from "./follow-user";
import { auth, db } from "../../firebase";

//인터페이스를 사용하여 트윗 데이터의 구조를 타입스크립트로 정의
export interface User {
  userId: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: column;
  overflow-y: scroll;
  width: 100%;
  margin-top: 10px;
`;

const UserContainer = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const FollowUserWrapper = styled.div`
  flex: 10; // SubmitBtn과 FollowUser 차지하는 너비 설정
`;

const SubmitBtn = styled.button`
  flex: 0.8;
  height: 100%;
  background-color: rgba(78, 78, 78, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 10px 10px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  //사용자가 버튼에 커서를 올리거나, 클릭했을 때 투명도 변경
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

export default function FollowerUserList({
  targetUserId,
  setFollowerCount,
}: {
  targetUserId: string;
  setFollowerCount: (count: (prev: number) => number) => void;
}) {
  const [Users, setUsers] = useState<User[]>([]); //팔로우 하는 유저들의 아이디를 담을 배열(기본 값은 빈 배열)
  const currentUser = auth.currentUser;

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null; //타입은 Unsubscribe나 null(처음에는 null)

    //Firestore에서 팔로잉하는 유저 데이터를 비동기적으로 가져오는 fetchFollowers 함수 정의
    const fetchFollowers = async () => {
      //query 함수를 사용하여 "tweets" 컬렉션에서 문서들을 createdAt 필드 기준으로 내림차순으로 정렬된 쿼리를 생성
      const tweetsQuery = query(
        collection(db, `users/${targetUserId}/followers`), // followers 서브컬렉션을 타겟으로 함
        orderBy("createdAt", "asc"),
        limit(25) //처음 25개만 불러오도록 pagination설정
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
    fetchFollowers();
  }, [targetUserId]);

  // 사용자를 팔로워 목록에서 삭제하는 함수
  const handleUnfollow = async ({ userId }: { userId: string }) => {
    // 확인 대화 상자 표시
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return;
    }

    // 타겟 유저의 팔로잉 목록에 내 정보 삭제
    try {
      // 상대의 팔로잉 목록에서 내 정보 삭제하기 위한 문서 경로 생성
      const followingPath = `users/${userId}/followings/${targetUserId}`;
      const followingDocRef = doc(db, followingPath);
      const followingDoc = await getDoc(followingDocRef);

      if (followingDoc.exists()) {
        // '내 정보'가 팔로잉 목록에 존재하면 삭제
        await deleteDoc(followingDocRef);
        console.log("상대의 팔로잉 목록에서, 내가 정상적으로 삭제되었습니다.");
      }
    } catch (error) {
      console.error("상대의 팔로잉 목록에서, 나 삭제 중 오류 발생:", error);
    }

    // 내 팔로워 리스트에서 삭제
    try {
      const followerPath = `users/${targetUserId}/followers/${userId}`;
      const followerDocRef = doc(db, followerPath);
      const followerDoc = await getDoc(followerDocRef); // 타겟 유저가 팔로잉 목록에 있는지 확인

      //내 프로필을 내가 보고 있을 때,
      if (targetUserId == currentUser?.uid && followerDoc.exists()) {
        await deleteDoc(followerDocRef);
        console.log("팔로워 목록에서 삭제되었습니다.");
        // 상태 업데이트
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.userId !== userId)
        );
        setFollowerCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("팔로워 삭제 중 오류 발생:", error);
    }
    return;
  };

  return (
    <Wrapper>
      {Users.map(
        (user) =>
          currentUser && (
            <UserContainer key={user.userId}>
              <FollowUserWrapper>
                <FollowUser key={user.userId} {...user} />
              </FollowUserWrapper>
              {targetUserId === currentUser?.uid && (
                <SubmitBtn
                  onClick={() => handleUnfollow({ userId: user.userId })}
                >
                  delete
                </SubmitBtn>
              )}
            </UserContainer>
          ) //React가 목록의 각 요소를 유일하게 식별할 수 있도록 key={user.id}
        //{...tweet}으로 트윗 객체의 모든 속성을 Tweet 컴포넌트에 prop으로 전달
      )}
    </Wrapper>
  );
}
