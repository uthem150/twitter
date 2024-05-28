import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { styled } from "styled-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";

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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에서 사용자 문서 참조
      const userRef = doc(db, "users", user.uid);

      // 사용자 문서 가져옴
      const docSnap = await getDoc(userRef);

      // 사용자가 Firestore에 없는 경우, 새로 생성
      if (!docSnap.exists()) {
        // 사용자가 Firestore에 존재하지 않으면, 사용자 문서 생성
        await setDoc(userRef, {
          // name: user.email ? user.email.split("@")[0] : "Anonymous", // 이메일의 앞부분을 displayName으로 사용
          name: user.email, // 처음에 이름을 이메일로 설정 - 중복 이름 금지
          email: user.email,
          createdAt: Date.now(),
          follower: [],
          following: [],
          description: "",
          bookmark: [],
        });
      }
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
