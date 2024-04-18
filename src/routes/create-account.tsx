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

  // error 상태를 별도로 관리
  const [error, setError] = useState("");

  const [userInfo, setUserInfo] = useState({
    //useState를 사용하여 name, email, password를 키로 하는 객체 하나로 상태를 관리
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // e는 변경 이벤트 객체이며, React.ChangeEvent<HTMLInputElement> 타입
  // (TypeScript 타입 어노테이션. e가 React의 입력 변경 이벤트 객체임을 명시, 이벤트가 HTML의 <input> 요소와 관련 있음을 나타냄)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; //e.target.name과 e.target.value를 통해 입력 필드의 이름과 현재 값을 추출
    setUserInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  // 폼 제출 이벤트가 발생할 때 호출
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //이벤트의 기본 동작을 방지하는 메서드. 폼 제출 시 기본적으로 페이지가 새로고침되거나 서버로 데이터가 전송되는 것을 방지
    const { name, email, password } = userInfo; // userInfo에서 값을 추출

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
          value={userInfo.name} // userInfo 객체에서 값을 참조
          placeholder="Name"
          type="name"
          required
        />
        <Input
          onChange={onChange}
          name="email"
          value={userInfo.email} // userInfo 객체에서 값을 참조
          placeholder="Email"
          type="email"
          required
        />
        <Input
          onChange={onChange}
          name="password"
          value={userInfo.password} // userInfo 객체에서 값을 참조
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
