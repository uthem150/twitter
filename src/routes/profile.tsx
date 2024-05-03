import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets";
import EditNameForm from "../components/edit-name-form";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  //유저 이미지가 없을 때는 background처럼 보이도록
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;

const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;

const EditButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 25px;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // 이름과 편집 버튼 사이의 간격 조정
`;

export default function Profile() {
  const user = auth.currentUser;
  //유저 이미지를 state로 만듦
  const [avatar, setAvatar] = useState(user?.photoURL); //사용자의 프로필 이미지 URL을 저장
  const [tweets, setTweets] = useState<ITweet[]>([]); //사용자의 트윗 목록을 저장 - ITweet[] 타입의 초기 상태를, 빈 배열로 설정 (ITweet는 트윗 객체를 나타내는 타입(인터페이스))
  const [isEditing, setIsEditing] = useState(false); //수정중인지 상태

  //프로필 이미지를 변경할 때 호출되는 이벤트 핸들러
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return; //유저가 존재하지 않으면 return
    if (files && files.length === 1) {
      //파일 첨부는 1개만 가능
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`); //ref 함수를 사용하여 Firebase Storage 내에 저장될 파일의 위치 지정[firebase storage 인스턴스, avatars라는 폴더 안에 이미지 저장(파일명은 유저id) -> 새 이미지 업로드하면 덮어쓰기됨]
      const result = await uploadBytes(locationRef, file); //선택된 파일(file)을 Firebase Storage에 업로드
      const avatarUrl = await getDownloadURL(result.ref); //업로드된 파일에 접근할 수 있는 URL을 얻음
      setAvatar(avatarUrl); //첨부한 이미지로 바꿈

      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"), //어떤 컬렉션을 쿼리하고 싶은지 정의. (firestore 인스턴스를 매개변수로 넘겨야 함. 타겟은 tweets컬렉션)

      //조건에 맞는 tweets만 가져오도록 필터링 (유저 ID가 현재 로그인된 유저 아이디와 같다면)
      where("userId", "==", user?.uid), //트윗의 userId와 현재 유저의 id가 같은 트윗들
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery); //document를 가져옴

    //가져온 문서들(snapshot.docs)에서 필요한 데이터를 추출하여, 각 트윗의 정보를 배열로 변환
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id, //id는 문서에 다른 필드처럼 저장되어 있지 않고, doc에 있음
      };
    });
    setTweets(tweets); // 배열을 setTweets 함수를 통해 상태로 저장
  };

  //컴포넌트가 마운트될 때(처음 렌더링될 때) fetchTweets 함수를 호출하여 트윗들을 가져옴
  useEffect(() => {
    fetchTweets();
  }, []); //[]는 의존성 배열 - 배열이 비어 있기 때문에, useEffect 내부의 코드는 컴포넌트가 처음 렌더링될 때한 번만 실행

  const onEdit = () => {
    setIsEditing(true); // 편집 모드 활성화
  };

  return (
    <Wrapper>
      {/* 아이콘을 누르면 변경할 수 있도록, 숨겨져 있는 AvatarInput과 id로 연결시켜줌 */}
      <AvatarUpload htmlFor="avatar">
        {/* 유저이미지 url을 가지고 있는지 확인하고, 있으면 넣고 없으면 svg */}
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        )}
      </AvatarUpload>
      {/* AvatarInput: 숨겨져 있는 태그 */}
      <AvatarInput
        onChange={onAvatarChange}
        id="avatar"
        type="file"
        accept="img/*"
      />
      <NameContainer>
        <Name>{user?.displayName ?? "Anonymous"}</Name>
        {isEditing ? null : (
          <EditButton onClick={onEdit}>
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              ></path>
            </svg>
          </EditButton>
        )}
      </NameContainer>
      {isEditing ? (
        <EditNameForm setIsEditing={setIsEditing}></EditNameForm>
      ) : null}
      <Tweets>
        {/* tweets 배열을 .map() 함수로 순회하며, 각 tweet 객체를 <Tweet /> 컴포넌트로 변환 */}
        {tweets.map((tweet) => (
          // 각 tweet 객체의 모든 키-값 쌍이 <Tweet /> 컴포넌트의 props로 전달
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
