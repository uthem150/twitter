import { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../../../firebase";
import { addDoc, collection } from "firebase/firestore";
import CmtTimeline from "./comment-timeline";

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
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
interface CmtBoxFormProps {
  tweetId: string; // tweetId의 타입을 명시적으로 `string`으로 선언\
  userId: string;
  handleCmtSubmitted: (status: boolean) => void;
  cmtClicked: boolean;
}

//props를 통해 초기값, 트윗 ID, 편집 성공 시 실행될 콜백 함수, 사진 URL을 받음
export default function CmtBoxForm({
  tweetId,
  userId,
  handleCmtSubmitted,
  cmtClicked,
}: CmtBoxFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [cmt, setCmt] = useState(""); //작성한 댓글 내용

  //텍스트 영역의 내용이 변경될 때 실행될 이벤트 핸들러 함수
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCmt(e.target.value);
  };

  //폼 제출 시 실행될 이벤트 핸들러 함수
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //폼 제출 시 브라우저가 페이지 새로고침하는 기본 동작 방지
    const user = auth.currentUser; //현재 로그인한 사용자의 정보를 가져옴. 만약 user가 null이라면, 로그인하지 않은 상태

    if (!user || isLoading || cmt === "" || cmt.length > 200) return; //login되어있지 않거나, 로딩중이나, 내용이 비어있거나, 200자가 넘어가면, 데이터를 추가하지 않음

    try {
      setLoading(true);

      // collection 함수를 사용하여 comments 컬렉션에 대한 참조 생성
      const commentsCollectionRef = collection(
        db,
        `tweets/${tweetId}/comments`
      );
      await addDoc(commentsCollectionRef, {
        userId: userId,
        createdAt: Date.now(),
        content: cmt,
      });

      // const cmtDoc = await getDoc(cmtDocRef);
      // 'cmt' 문서가 이미 존재하는지 확인
      // if (cmtDoc.exists()) {
      //   // 'comment' 문서가 존재하면 삭제
      //   await deleteDoc(cmtDocRef);
      //   console.log("Comment removed successfully.");
      //   setIsCmtd(false); // 상태를 업데이트하여 UI에 반영
      //   setCmtCount((prev) => prev - 1); // 댓글 개수 감소
      //   return;
      // }

      handleCmtSubmitted(true);
      console.log("Comment added successfully.");
      setCmt(""); // 댓글 작성 후 입력 필드 비우기
    } catch (error) {
      console.error("Error adding/removing cmt: ", error);
    } finally {
      setLoading(false);
      handleCmtSubmitted(false);
    }
  };

  return (
    <>
      <CmtTimeline tweetId={tweetId} cmtClicked={cmtClicked} />
      <Form onSubmit={onSubmit}>
        <TextArea
          required //필수로 내용은 있어야 submit가능
          rows={2}
          maxLength={200}
          onChange={onChange}
          value={cmt}
          placeholder="댓글을 남기세요"
        />
        <SubmitBtn
          type="submit"
          value={isLoading ? "Loading..." : "댓글 작성"}
        />
      </Form>
    </>
  );
}
