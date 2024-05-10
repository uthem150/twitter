import { useState } from "react";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none; //textarea 크기 조정기능 제거
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &:focus {
    // textarea 클릭하면, 테두리 색상 변경
    outline: none;
    border-color: #1d9bf0;
  }
`;

const AttatchFileButton = styled.label`
  //label을 input버튼과 연결한 뒤, 버튼처럼 꾸며줌
  padding: 10px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 20px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer; //마우스 올리면 pointer로 변경
`;

const AttatchFileInput = styled.input`
  display: none;
`;

const SubmitBtn = styled.input`
  background-color: #1d9bf0;
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  //사용자가 버튼에 커서를 올리거나, 클릭했을 때 투명도 변경
  &:hover,
  &:active {
    opacity: 0.9;
  }
`;

//컴포넌트에 전달되는 props의 타입 정의
interface EditTweetFormProps {
  value: string;
  tweetId: string; // tweetId의 타입을 명시적으로 `string`으로 선언
  onEditSuccess: (newTweet: string) => void;
  photo?: string; // 이전에 업로드된 사진의 URL (없을 수도 있음)
}

//props를 통해 초기값, 트윗 ID, 편집 성공 시 실행될 콜백 함수, 사진 URL을 받음
export default function EditTweetForm({
  value,
  tweetId,
  onEditSuccess,
  photo,
}: EditTweetFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState(value); //초기값 파라미터로부터 받음
  const [file, setFile] = useState<File | null>(null); //첨부 파일의 내용 저장 (파일의 값은 file이거나 null)

  //텍스트 영역의 내용이 변경될 때 실행될 이벤트 핸들러 함수
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };

  // 업로드 이미지 최대 용량 지정 - 2MB
  const maxSize = 2 * 1024 * 1024;

  //파일 입력 필드의 값이 변경될 때 실행될 이벤트 핸들러 함수
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //파일의 크기를 검사하고 조건에 맞는 파일만 상태에 저장
    const { files } = e.target;
    // 파일 업로드 용량제한 설정
    if (files && files[0].size > maxSize) {
      alert("업로드 이미지 최대 크기는 2MB입니다");
      return;
    }
    //유저가 1개의 파일만 업로드 가능하도록 설정 (e.target에 file이 존재하고, 그 배열 길이가 1이면 배열의 첫번째 파일을 file state에 저장)
    if (files && files.length === 1) {
      setFile(files[0]);
    }
  };

  //폼 제출 시 실행될 이벤트 핸들러 함수
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //폼 제출 시 브라우저가 페이지 새로고침하는 기본 동작 방지
    const user = auth.currentUser; //현재 로그인한 사용자의 정보를 가져옴. 만약 user가 null이라면, 로그인하지 않은 상태

    if (!user || isLoading || tweet === "" || tweet.length > 180) return; //login되어있지 않거나, 로딩중이나, 내용이 비어있거나, 180자가 넘어가면, 데이터를 추가하지 않음
    //tweet이 있다면
    try {
      setLoading(true);
      const tweetRef = doc(db, "tweets", tweetId); // 수정할 트윗의 문서 참조 생성

      await updateDoc(tweetRef, {
        tweet,
        updatedAt: Date.now(), // 수정된 시간 추가
      });

      if (file) {
        if (photo) {
          //이전에 첨부된 사진이 있을 경우 삭제
          const originRef = ref(storage, `tweets/${user.uid}/${tweetId}`); //Firebase Storage 인스턴스, 저장 경로
          await deleteObject(originRef); //생성한 참조를 바탕으로, 해당 사진을 Firebase Storage에서 삭제
        }

        //업로드될 파일의 위치에 대한 참조를 생성 (tweets/(유저id-유저이름)/(문서id))
        const locationRef = ref(
          storage, //firebase storage 인스턴스
          `tweets/${user.uid}/${tweetId}` // 파일이 어디에 저장될 지 url(유저가 올리는 모든 파일은 해당 유저의 파일에 저장) - 유저 이름을 폴더 명에 추가, 이미지 이름은 업로드된 트윗의 id로
        );
        const result = await uploadBytes(locationRef, file); //파일을 실제로 Storage에 업로드 (업로드할 위치, 첨부파일 객체)
        const url = await getDownloadURL(result.ref); //업로드 완료 후, 해당 파일에 접근할 수 있는 URL을 얻고 사용자가 이미지를 볼 수 있게 트윗 문서에 저장 [result의 public url을 반환하는 함수(string을 반환하는 promise)]

        //  업로드된 이미지의 URL을 현재 편집 중인 트윗 문서에 photo 필드로 추가 [updateDoc(document 참조, 업데이트 할 데이터)]
        await updateDoc(tweetRef, {
          photo: url,
        }); //tweet document에 이미지 url을 추가함
      }
      onEditSuccess(tweet); // 편집 성공 후 콜백 호출
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        required //필수로 내용은 있어야 submit가능
        rows={5}
        maxLength={180}
        onChange={onChange}
        value={tweet}
        placeholder="What is happening?"
      />
      <AttatchFileButton htmlFor={`file${tweetId}`}>
        {file ? "Photo added ✅" : photo ? "Change photo" : "Add photo"}
      </AttatchFileButton>
      <AttatchFileInput
        onChange={onFileChange}
        type="file"
        id={`file${tweetId}`}
        accept="image/*"
      />
      {/*file이라는 id를 갖고, 이미지 파일만 받는데, 확장자는 상관x*/}
      <SubmitBtn
        type="submit"
        value={isLoading ? "Loading..." : "Edit Tweet"}
      />
    </Form>
  );
}
