import styled from "styled-components";
import { auth, storage } from "../firebase";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";

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

export default function Profile() {
  const user = auth.currentUser;
  //유저 이미지를 state로 만듦
  const [avatar, setAvatar] = useState(user?.photoURL);
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
      <Name>
        {user?.displayName ?? "Anonymous"}
        {/* {user?.displayName ? user.displayName : "Anonymous"} */}
      </Name>
    </Wrapper>
  );
}
