import { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

export default function PostTweetForm() {
  const [isLoading, setLoading] = useState(false);
  const [tweet, setTweet] = useState(""); //트윗의 내용 저장
  const [file, setFile] = useState<File | null>(null); //첨부 파일의 내용 저장 (파일의 값은 file이거나 null)
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(e.target.value);
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //타입이 file인 input이 변경될 때 마다, 파일이 배열을 받게 됨 (어떤 input은 복수의 파일을 업로드하게 하기 때문)
    const { files } = e.target;
    if (files && files.length === 1) {
      //유저가 1개의 파일만 업로드 가능하도록 설정 (e.target에 file이 존재하고, 그 배열 길이가 1이면 배열의 첫번째 파일을 file state에 저장)
      setFile(files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //폼 제출 시 브라우저가 페이지 새로고침하는 기본 동작 방지
    const user = auth.currentUser; //현재 로그인한 사용자의 정보를 가져옴. 만약 user가 null이라면, 로그인하지 않은 상태

    if (!user || isLoading || tweet === "" || tweet.length > 180) return; //login되어있지 않거나, 로딩중이나, 내용이 비어있거나, 180자가 넘어가면, 데이터를 추가하지 않음
    //tweet이 있다면
    try {
      setLoading(true);
      //firebase의 addDoc함수로 tweets 컬렉션 db에 새 문서를 추가 (firebase instance, 저장할 collection 장소의 이름)
      await addDoc(collection(db, "tweets"), {
        tweet, //내용
        createdAt: Date.now(), //트윗이 생성된 시간을 밀리세컨드 단위로 기록
        username: user.displayName || "Anonymous", //이름 존재하지 않으면 Anonymous표시
        userId: user.uid, //나중에 삭제할 수 있도록, 트윗을 생성한 사용자 ID저장
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onSubmit={onSubmit}>
      <TextArea
        rows={5}
        maxLength={180}
        onChange={onChange}
        value={tweet}
        placeholder="What is happening?"
      />
      <AttatchFileButton htmlFor="file">
        {file ? "Photo added ✅" : "Add photo"}
      </AttatchFileButton>
      <AttatchFileInput
        onChange={onFileChange}
        type="file"
        id="file"
        accept="image/*"
      />
      {/*file이라는 id를 갖고, 이미지 파일만 받는데, 확장자는 상관x*/}
      <SubmitBtn
        type="submit"
        value={isLoading ? "Posting..." : "Post tweet"}
      />
    </Form>
  );
}
