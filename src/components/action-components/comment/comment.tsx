import styled from "styled-components";
import { auth, db, storage } from "../../../firebase.ts";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IComment } from "./comment-timeline.tsx";
import PostTime from "../../tweets-components/post-time-components.tsx";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 7px 10px; //좌우 7, 상하10
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  list-style: none; // li 요소 스타일 제거
  background-color: rgba(0, 0, 0, 0.5); //투명도 50%
`;

const Column = styled.div`
  display: flex;
  flex-direction: row; /* 가로 방향으로 아이템 나열 */
  align-items: center; /* 세로축 중앙 정렬 */
  justify-content: space-between; /* 시작점과 끝점 사이에 요소들 배치 */
  width: 100%;
`;

const Payload = styled.p`
  margin: 7px 0px;
  font-size: 15px;
  word-break: break-all; // 모든 문자에서 줄바꿈 허용
  line-height: 1.5; // 줄간격
`;

// const DeleteButton = styled.div`
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 25px;
//   width: 25px;
//   transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
//   &:hover {
//     transform: scale(1.05); // 호버 시 버튼을 5% 확대
//   }
// `;

const UserInfoContainer = styled.div`
  display: flex;
  gap: 5px; // 버튼 사이 간격
  align-items: center;
`;

const Username = styled(Link)`
  // Username 컴포넌트를 styled(Link)로 변경
  color: inherit; // Link의 기본 색상을 상속받도록 설정
  text-decoration: none; // 밑줄 제거
  font-size: 13px;
`;

const AvatarNonUpload = styled(Link)`
  width: 25px;
  overflow: hidden;
  height: 25px;
  border-radius: 50%;
  background-color: #1d9bf0;
  margin-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  svg {
    width: 27px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;

export default function Comment({ createdAt, userId, content }: IComment) {
  //   const user = auth.currentUser;
  const [avatar, setAvatar] = useState(""); //프로필 이미지
  const [targetUser, setTargetUser] = useState(""); //트윗의 작성자 이름

  //   const onDelete = async () => {
  //     const ok = confirm("Are you sure you want to delete this tweet?");
  //     if (!ok || user?.uid !== userId) return; //userId가 일치하지 않으면 종료
  //     try {
  //       await deleteDoc(doc(db, "tweets", id)); //deleteDoc함수를 사용하여 문서 삭제
  //     } catch (e) {
  //       console.log(e);
  //     } finally {
  //       //
  //     }
  //   };

  useEffect(() => {
    // 사용자의 트윗을 가져오는 로직과 별개로 사용자의 프로필 정보를 가져오는 로직을 추가
    const fetchUserProfile = async () => {
      if (!userId) {
        setAvatar(""); // userId가 없으면 avatar 상태 초기화
        return;
      } // userId가 없다면 실행하지 않음
      try {
        const userRef = doc(db, "users", userId); //firestore database에 저장된 user항목에서 userId에 해당하는 값 찾음
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setTargetUser(docSnap.data().name);
        } else {
          // 문서가 없는 경우
          console.log("해당 문서가 존재하지 않습니다");
          setTargetUser("");
        }

        const AvatarRef = ref(storage, `avatars/${userId}`);
        const AvatarUrl = await getDownloadURL(AvatarRef); // 업로드된 파일에 접근할 수 있는 URL을 얻음
        setAvatar(AvatarUrl); // 첨부한 이미지로 바꿈
      } catch (error) {
        // console.log(error);
        // console.log("아바타 이미지가 존재하지 않습니다");
        setAvatar(""); // 오류 발생 시 avatar 상태 초기화
        return; // 파일이 없거나 다른 오류가 발생했을 때 함수를 종료
      }
    };

    fetchUserProfile();
  }, [userId]); // userId가 변경될 때마다 useEffect 내부의 로직을 다시 실행

  return (
    <Wrapper>
      <Column>
        <UserInfoContainer>
          <AvatarNonUpload to={`/profile/${userId}`}>
            {/* 유저이미지 url을 가지고 있는지 확인하고, 있으면 넣고 없으면 svg */}
            {avatar ? (
              <AvatarImg src={avatar} />
            ) : (
              <svg
                fill="white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            )}
          </AvatarNonUpload>
          {/* <Username>{username}</Username> */}
          <Username to={`/profile/${userId}`}>
            {targetUser ? targetUser : "Anonymous"}
          </Username>
          <PostTime createdAt={createdAt}></PostTime>
        </UserInfoContainer>
      </Column>

      <Payload>{content}</Payload>
    </Wrapper>
  );
}
