import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
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

  // 받아온 name, email, password를 state에 저장
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // React에서 입력 요소(input element)의 변경 이벤트를 처리하는 함수 (onChange라는 상수에 함수를 할당)
  // e는 변경 이벤트 객체이며, React.ChangeEvent<HTMLInputElement> 타입
  // (TypeScript 타입 어노테이션. e가 React의 입력 변경 이벤트 객체임을 명시, 이벤트가 HTML의 <input> 요소와 관련 있음을 나타냄)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 이벤트 객체 e에서 target 객체를 구조 분해 할당하여 name과 value 속성을 추출 (target은 이벤트가 발생한 DOM 요소, 즉 입력 요소)
    const {
      target: { name, value },
    } = e;
    if (name === "name") {
      setName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  // 폼 제출 이벤트가 발생할 때 호출
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //이벤트의 기본 동작을 방지하는 메서드. 폼 제출 시 기본적으로 페이지가 새로고침되거나 서버로 데이터가 전송되는 것을 방지
    setError(""); //error message초기화

    if (isLoading || name === "" || email === "" || password === "") return; //loading중이거나, name or email or password 비어있으면, 함수 종료
    try {
      setLoading(true);
      // create an account
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      ); //인증객체, email, pw필요
      console.log(credentials.user);
      //계정을 만든 뒤에, 사용자 이름 설정
      await updateProfile(credentials.user, { displayName: name });

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
      <Title>Join 𝕏</Title>
      <Form onSubmit={onSubmit}>
        <Input
          onChange={onChange}
          name="name"
          value={name}
          placeholder="Name"
          type="name"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={email}
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={password}
          placeholder="Password"
          type="password"
          required
        />
        <Input
          type="submit"
          value={isLoading ? "Loading..." : "Create Accout"}
          disabled={isLoading} // isLoading이 true일 때 버튼을 비활성화
        />
      </Form>
      {error !== "" ? <Error>{error}</Error> : null}
      <Switcher>
        Already have an account? <Link to="/login">log in &rarr;</Link>{" "}
        {/*&rarr는 right arrow*/}
      </Switcher>
      <GithubButton />
    </Wrapper>
  );
}
