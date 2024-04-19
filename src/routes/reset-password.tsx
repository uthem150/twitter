import { sendPasswordResetEmail } from "firebase/auth";
import {
  Error,
  Input,
  Title,
  Wrapper,
  Form,
} from "../components/auth-components";
import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

export default function ResetPassword() {
  const [userInfo, setUserInfo] = useState({
    email: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email } = userInfo; //구조 분해 할당으로, userInfo 객체에서 email 프로퍼티를 추출하여 email이라는 새로운 변수 생성

  //입력필드가 변경될 때마다 호출되어, 사용자가 입력하는 이메일 값을 userInfo 상태에 저장
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  //폼 제출 시 호출
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "") return;
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email); //사용자가 입력한 이메일 주소로 비밀번호 재설정 이메일을 보냄
      navigate("/login");
    } catch (e) {
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Reset Your Password</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Enter Your Email"
          type="email"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Send Reset Email"}
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
    </Wrapper>
  );
}
