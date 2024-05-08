import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { styled } from "styled-components";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

const Button = styled.span`
  margin-top: 30px;
  background-color: white;
  font-weight: 500;
  width: 100%;
  color: black;
  padding: 10px 20px;
  border-radius: 50px;
  border: 0;
  //  border: 1px solid #ebebeb;
  font-size: 12px;
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 25px;
  padding-right: 5px;
`;

interface GithubButtonProps {
  onError: (errorMessage: string) => void; // 'onError'의 타입을 명시적으로 선언
}

export default function GithubButton({ onError }: GithubButtonProps) {
  const navigate = useNavigate();

  const onClick = async () => {
    //onClick함수 정의
    try {
      const provider = new GithubAuthProvider(); //codrdova가 아닌, auth에서 가져와야 함.
      await signInWithPopup(auth, provider);
      navigate("/"); // 로그인이 잘 되었다면, home으로
    } catch (error) {
      if (error instanceof FirebaseError) {
        // onError 콜백 함수를 사용하여 에러 메시지를 상위 컴포넌트로 전달
        onError(error.code);
        console.error(error);
      }
    }
  };
  return (
    <Button onClick={onClick}>
      <Logo src="/github-logo.svg" />
      Continue with Github
    </Button>
  );
}
