import { useState } from "react";
import styled from "styled-components";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

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

const CancelBtn = styled.input`
  background-color: #ff6347; /* 취소 버튼은 빨간색 계열로 설정 */
  color: white;
  border: none;
  padding: 10px 0px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  &:hover,
  &:active {
    opacity: 0.8; /* 투명도를 조금 더 높여서 눌림 효과를 줌 */
  }
`;

//props의 타입 명시
interface EditNameFormProps {
  setIsEditing: (isEditing: boolean) => void;
}

//props를 통해 초기값, 트윗 ID, 편집 성공 시 실행될 콜백 함수, 사진 URL을 받음
export default function EditNameForm({ setIsEditing }: EditNameFormProps) {
  const user = auth.currentUser;

  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState(user?.displayName || "");

  //텍스트 영역의 내용이 변경될 때 실행될 이벤트 핸들러 함수
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setName(e.target.value);
  };

  //폼 제출 시 실행될 이벤트 핸들러 함수
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //폼 제출 시 브라우저가 페이지 새로고침하는 기본 동작 방지
    const user = auth.currentUser; //현재 로그인한 사용자의 정보를 가져옴. 만약 user가 null이라면, 로그인하지 않은 상태

    if (!user || isLoading) return; //login되어있지 않거나, 로딩중이면, 데이터를 추가하지 않음

    // 이름이 기존에 설정된 이름과 동일한 경우, updateProfile을 실행하지 않고 바로 종료
    if (name === user.displayName) {
      setIsEditing(false); // 바로 편집 모드를 종료
      return; // 함수 종료
    }

    // 이름의 길이가 20자를 초과하는 경우도 데이터를 추가하지 않음
    if (name == "" || name.length > 20) {
      alert("이름은 공백이거나, 20자를 초과할 수 없습니다");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(user, {
        displayName: name,
      });

      setIsEditing(false); // 편집 성공 후 콜백 호출
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  //취소가 실행될 이벤트 핸들러 함수
  const onCancel = async (e: React.FormEvent<HTMLInputElement>) => {
    //form element가 아닌 input element
    e.preventDefault(); // 폼 제출 이벤트 방지
    setIsEditing(false); // 편집 성공 후 콜백 호출
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextArea defaultValue={user?.displayName ?? ""} onChange={onChange} />
      <SubmitBtn
        type="submit"
        value={isLoading ? "Loading..." : "Change"}
        disabled={isLoading} // 로딩 중에는 버튼을 비활성화
      />
      <CancelBtn
        type="button" // 취소 버튼이므로 type을 "button"으로 설정
        value="Cancel"
        onClick={onCancel} // onClick 이벤트에 onCancel 함수 연결
        disabled={isLoading} // 로딩 중에는 버튼을 비활성화
      />
    </Form>
  );
}
