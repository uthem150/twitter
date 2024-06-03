import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import FollowUser from "../components/follow/follow-user";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";

//인터페이스를 사용하여 사용자 데이터의 구조를 정의
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

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: rgba(0, 0, 0, 0.5); //투명도 50%
  width: 100%;
  resize: none; //textarea 크기 조정기능 제거
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    //placeholder의 폰트 크기 설정
    font-size: 16px;
  }
  &:focus {
    // textarea 클릭하면, 테두리 색상 변경
    outline: none;
    border-color: #1d9bf0;
  }
  margin-bottom: 10px;
`;

export default function Search() {
  const [users, setUsers] = useState<User[]>([]); // 일치하는 사용자 객체 목록 저장할 변수
  const [searchTerm, setSearchTerm] = useState(""); // 검색창에 입력한 내용 저장할 변수
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!searchTerm.trim()) return; // 검색어가 비어있으면 검색하지 않음

    // 검색어로 시작하는 문자열의 범위를 만들기 위해 마지막 문자를 찾고, 그 다음 문자를 계산.
    const endChar = searchTerm.charAt(searchTerm.length - 1); //마지막 문자를 찾음
    const nextChar = String.fromCharCode(endChar.charCodeAt(0) + 1); // 마지막 문자의 다음 문자를 계산 (유니코드 값을 다시 문자로 변환)
    const endSearchTerm = searchTerm.slice(0, -1) + nextChar; //문자열의 첫 번째 문자부터 마지막 문자 바로 앞까지의 부분 문자열을 반환

    const usersQuery = query(
      collection(db, "users"),
      where("name", ">=", searchTerm), // "name" 필드가 사용자 입력으로 시작하는 문서 검색 - a로 시작하는 모든 문자열
      where("name", "<", endSearchTerm), // 그리고 그 다음 문자로 시작하지 않는 문서 검색 - a로 시작하면, b로 시작하는건 검색x
      orderBy("name"), // 이름으로 정렬
      limit(10) // 최대 결과 수 제한
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        createdAt: doc.data().createdAt,
        userId: doc.id,
      }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [searchTerm]); // searchTerm이 변경될 때마다 useEffect 실행

  return (
    <>
      <BackgroundAnimation />

      <Wrapper>
        <TextArea
          rows={1}
          maxLength={20}
          onChange={onChange}
          value={searchTerm}
          placeholder="Search"
        />
        {users.map((user) => (
          <FollowUser key={user.userId} {...user} />
        ))}
      </Wrapper>
    </>
  );
}
