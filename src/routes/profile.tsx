import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweets-components/tweets";
import EditNameForm from "../components/edit-name-form";
import { useParams } from "react-router-dom";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";
import Follow from "../components/follow/follow";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;

const TweetWrapper = styled.div`
  display: flex;
  gap: 5px;
  flex-direction: column;
  overflow-y: scroll;
  width: 100%;
  /* height: 80%; */
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

const AvatarNonUpload = styled(AvatarUpload)``; //AvatarUpload 스타일 그대로 적용

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
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
  const currentUser = auth.currentUser;
  const [targetUser, setTargetUser] = useState("");

  //유저 이미지를 state로 만듦
  const [avatar, setAvatar] = useState("");
  const [tweets, setTweets] = useState<ITweet[]>([]); //사용자의 트윗 목록을 저장 - ITweet[] 타입의 초기 상태를, 빈 배열로 설정 (ITweet는 트윗 객체를 나타내는 타입(인터페이스))
  const [isEditing, setIsEditing] = useState(false); //수정중인지 상태

  const { userId } = useParams(); //현재 URL의 파라미터를 가져올 때 사용하는 훅 (useParams를 사용하여 userId 파라미터 값 추출)

  //프로필 이미지를 변경할 때 호출되는 이벤트 핸들러
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!currentUser || currentUser.uid !== userId) return; //현재 로그인한 사용자가 아니거나, URL 파라미터로 받은 userId와 일치하지 않으면 return
    if (files && files.length === 1) {
      //파일 첨부는 1개만 가능
      const file = files[0];
      const locationRef = ref(storage, `avatars/${currentUser?.uid}`); //ref 함수를 사용하여 Firebase Storage 내에 저장될 파일의 위치 지정[firebase storage 인스턴스, avatars라는 폴더 안에 이미지 저장(파일명은 유저id) -> 새 이미지 업로드하면 덮어쓰기됨]
      const result = await uploadBytes(locationRef, file); //선택된 파일(file)을 Firebase Storage에 업로드
      const avatarUrl = await getDownloadURL(result.ref); //업로드된 파일에 접근할 수 있는 URL을 얻음
      setAvatar(avatarUrl); //첨부한 이미지로 바꿈

      await updateProfile(currentUser, {
        photoURL: avatarUrl,
      });
    }
  };

  //컴포넌트가 마운트될 때(처음 렌더링될 때) fetchTweets 함수를 호출하여 트윗들을 가져옴
  useEffect(() => {
    const fetchTweets = async () => {
      const tweetQuery = query(
        collection(db, "tweets"), //어떤 컬렉션을 쿼리하고 싶은지 정의. (firestore 인스턴스를 매개변수로 넘겨야 함. 타겟은 tweets컬렉션)

        //조건에 맞는 tweets만 가져오도록 필터링 (유저 ID가 현재 로그인된 유저 아이디와 같다면)
        where("userId", "==", userId), //트윗의 userId와 id가 같은 트윗들
        orderBy("createdAt", "desc"),
        limit(25)
      );
      const snapshot = await getDocs(tweetQuery); //document를 가져옴

      //가져온 문서들(snapshot.docs)에서 필요한 데이터를 추출하여, 각 트윗의 정보를 배열로 변환
      const tweets = snapshot.docs.map((doc) => {
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
      setTweets(tweets); // 배열을 setTweets 함수를 통해 상태로 저장
    };

    if (currentUser?.uid) {
      // currentUser.uid가 존재할 때만 fetchTweets를 호출
      fetchTweets();
    }
  }, [currentUser?.uid, userId]); // useEffect 내부에서 사용되는 모든 외부 변수 및 props는 의존성 배열에 포함되어야, 해당 변수들의 값이 변경될 때마다 useEffect가 다시 실행될 수 있음

  const onEdit = () => {
    setIsEditing(true); // 편집 모드 활성화
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
  }, [userId, isEditing]); // userId, isEditing가 변경될 때마다 useEffect 내부의 로직을 다시 실행

  return (
    <>
      <BackgroundAnimation />
      <Wrapper>
        {currentUser && currentUser.uid === userId ? (
          <>
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
          </>
        ) : (
          <AvatarNonUpload>
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
          </AvatarNonUpload>
        )}

        {/* AvatarInput: 숨겨져 있는 태그 */}
        <AvatarInput
          onChange={onAvatarChange}
          id="avatar"
          type="file"
          accept="img/*"
        />
        <NameContainer>
          <Name>{targetUser ? targetUser : "Anonymous"}</Name>
          {/* 현재 로그인한 사용자가 있고 & 현재 로그인한 사용자의 uid가 URL 파라미터로 받은 userId와 일치하고 & 이름을 편집중이 아닐때 수정버튼 나타남*/}
          {currentUser && currentUser.uid === userId && !isEditing && (
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
        {/* 팔로잉 및 팔로워 정보 */}
        <Follow targetUserId={userId} />
        <TweetWrapper>
          {/* tweets 배열을 .map() 함수로 순회하며, 각 tweet 객체를 <Tweet /> 컴포넌트로 변환 */}
          {tweets.map((tweet) => (
            // 각 tweet 객체의 모든 키-값 쌍이 <Tweet /> 컴포넌트의 props로 전달
            <Tweet key={tweet.id} {...tweet} />
          ))}
        </TweetWrapper>
      </Wrapper>
    </>
  );
}
