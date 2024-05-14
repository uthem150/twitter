import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import EditTweetForm from "./edit-tweet-form";
import { Link } from "react-router-dom";

const Wrapper = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
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

const ImageContainer = styled.div`
  display: flex;
  justify-content: center; /* 가로축 중앙 정렬 */
  width: 100%;
`;

const Photo = styled.img`
  width: auto; // 원본 이미지 비율 유지
  max-width: 100%; // 컨테이너 너비를 초과하지 않도록
  max-height: 400px; //최대 높이 설정
  border-radius: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
  word-break: break-all; // 모든 문자에서 줄바꿈 허용
  line-height: 1.5; // 줄간격
`;

const DeleteButton = styled.div`
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
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px; // 버튼 사이 간격
`;

const ActionContainer = styled.div`
  display: flex;
  width: 100%; //컨테이너의 너비를 100%로 설정하여 최대한 확장
  margin-top: 10px;
  gap: 5px; // 버튼 사이 간격
  justify-content: flex-start; //시작점 기준으로 요소들을 정렬
  align-items: center;
`;

const LikeButton = styled(DeleteButton)``;
const CommentButton = styled(DeleteButton)``;
const BookmarkButton = styled(DeleteButton)`
  margin-left: auto; // 왼쪽 여백을 자동으로 설정하여 오른쪽 끝에 버튼을 배치
`;

const EditButton = styled(DeleteButton)``; // 스타일은 삭제 버튼과 동일

const UserInfoContainer = styled.div`
  display: flex;
  gap: 5px; // 버튼 사이 간격
  align-items: center;
`;

const Username = styled(Link)`
  // Username 컴포넌트를 styled(Link)로 변경합니다.
  color: inherit; // Link의 기본 색상을 상속받도록 설정합니다.
  text-decoration: none; // 밑줄 제거
`;

const AvatarNonUpload = styled(Link)`
  width: 33px;
  overflow: hidden;
  height: 33px;
  border-radius: 50%;
  background-color: #1d9bf0;
  margin-right: 10px;
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

const StatsContainer = styled.div`
  font-size: 13px;
  margin-right: 10px;
`;

export default function Tweet({
  photo,
  tweet,
  userId,
  id,
  like = [], // like가 undefined일 경우 빈 배열로 초기화
  comment = [],
  bookmark = [],
}: ITweet) {
  const user = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false); //수정중인지 상태
  const [editedTweet, setEditedTweet] = useState(tweet); //수정 후 텍스트
  const [avatar, setAvatar] = useState(""); //프로필 이미지
  const [targetUser, setTargetUser] = useState(""); //트윗의 작성자 이름
  const [isBookmarked, setIsBookmarked] = useState(false);

  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return; //userId가 일치하지 않으면 종료
    try {
      await deleteDoc(doc(db, "tweets", id)); //deleteDoc함수를 사용하여 문서 삭제
      // deleteDoc의 매개변수는 삭제할 문서에 대한 참조. doc함수를 사용하여 해당 참조 불러옴
      //firebase 인스턴스 db넘겨주고, 문서가 저장된 경로 제공(tweets 컬렉션에 저장되어 있음), 해당 문서는 id를 가짐
      if (photo) {
        //트윗에 사진이 첨부되어 있는지 확인 (사진이 있다면, 사진에 대한 참조를 받아야 함)
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`); //스토리지 인스턴스, 경로
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };

  const onEdit = () => {
    setIsEditing(!isEditing); // 현재 상태의 반대로 설정
  };

  const onEditSuccess = (newTweet: string) => {
    setEditedTweet(newTweet); // 새로운 트윗 내용으로 상태 업데이트
    setIsEditing(false); // 편집 모드 종료
  };

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

  // 컴포넌트가 마운트될 때, 북마크 상태를 확인
  useEffect(() => {
    const checkBookmark = async () => {
      // Firestore에서 현재 사용자의 데이터를 찾습니다.
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const bookmark = docSnap.data().bookmark || [];
        setIsBookmarked(bookmark.includes(id));
      }
    };
    checkBookmark();
  }, [userId, id]);

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
        </UserInfoContainer>
        {/* user?.uid는 JavaScript의 Optional Chaining (?.) 연산자 -  user 객체가 null이거나 undefined가 아닐 경우에만 uid 속성에 접근(타입에러 방지) */}
        {user?.uid === userId ? (
          <ButtonContainer>
            <EditButton onClick={onEdit}>
              {isEditing ? (
                // 취소 아이콘 SVG 코드
                <svg
                  data-slot="icon"
                  fill="none"
                  stroke-width="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  ></path>
                </svg>
              ) : (
                // 수정(펜) 아이콘 SVG 코드
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  ></path>
                </svg>
              )}
            </EditButton>
            <DeleteButton onClick={onDelete}>
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.5"
                stroke="tomato"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                ></path>
              </svg>
            </DeleteButton>
          </ButtonContainer>
        ) : null}
      </Column>
      {isEditing ? (
        <EditTweetForm
          value={editedTweet}
          tweetId={id}
          onEditSuccess={onEditSuccess}
          photo={photo}
        ></EditTweetForm>
      ) : (
        <Payload>{tweet}</Payload>
      )}
      {/* 사진이 있으면, 보여주고 아니면 null */}
      {photo ? (
        <ImageContainer>
          <Photo src={photo} />
        </ImageContainer>
      ) : null}
      <ActionContainer>
        <LikeButton>
          <svg
            data-slot="icon"
            fill="none"
            stroke-width="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            ></path>
          </svg>
        </LikeButton>
        <StatsContainer>
          {like.length > 0 ? `좋아요 ${like.length}개` : null}
        </StatsContainer>
        <CommentButton>
          <svg
            data-slot="icon"
            fill="none"
            stroke-width="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            ></path>
          </svg>
        </CommentButton>
        <StatsContainer>
          {comment.length ? `댓글 ${comment.length}개` : null}
        </StatsContainer>
        <BookmarkButton>
          <svg
            data-slot="icon"
            fill={isBookmarked ? "white" : "none"} // isBookmarked에 따라 fill 속성 변경
            stroke-width="1.5"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            ></path>
          </svg>
        </BookmarkButton>
      </ActionContainer>
    </Wrapper>
  );
}
