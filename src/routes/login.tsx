import { useState } from "react";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Form,
  Error,
  Input,
  Switcher,
  Title,
  Wrapper,
} from "../components/auth-components";
import GithubButton from "../components/github-btn";

export default function CreateAccount() {
  const [isLoading, setLoading] = useState(false);

  // email과 password를 포함하는 userInfo 객체로 상태 관리
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // React에서 입력 요소(input element)의 변경 이벤트를 처리하는 함수 (onChange라는 상수에 함수를 할당)
  // 변경 이벤트를 처리하는 함수
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; //e.target.name과 e.target.value를 통해 입력 필드의 이름과 현재 값을 추출
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 폼 제출 이벤트가 발생할 때 호출
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //이벤트의 기본 동작을 방지하는 메서드. 폼 제출 시 기본적으로 페이지가 새로고침되거나 서버로 데이터가 전송되는 것을 방지
    setError(""); //error message초기화

    const { email, password } = userInfo;
    if (isLoading || email === "" || password === "") return; //loading중이거나, name or email or password 비어있으면, 함수 종료
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // redirect to the homepage
      navigate("/");
    } catch (e) {
      //setError
      if (e instanceof FirebaseError) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Title>Log into 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="email"
          value={userInfo.email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={userInfo.password}
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Log in"}
          disabled={isLoading} // isLoading이 true일 때 버튼을 비활성화
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Did you forget the password?{" "}
        <Link to="/reset-password">Reset Password &rarr;</Link>{" "}
        {/*&rarr는 right arrow*/}
      </Switcher>
      <Switcher>
        Don't have an account?{" "}
        <Link to="/create-account">Create one &rarr;</Link>{" "}
        {/*&rarr는 right arrow*/}
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
