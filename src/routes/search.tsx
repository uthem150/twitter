import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import FollowUser from "../components/follow/follow-user";

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
`;

export default function Search() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!searchTerm.trim()) return; // 검색어가 비어있으면 검색하지 않음

    const usersQuery = query(
      collection(db, "users"),
      where("name", "==", searchTerm) // "name" 필드가 사용자 입력과 일치하는 문서 검색
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
  );
}
