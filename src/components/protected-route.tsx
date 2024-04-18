import React from "react";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode; //children이라는 props에 React.ReactNode 타입을 지정
  //children이 받을 수 있는 값의 종류를 React 노드(요소, 문자열, 숫자 등)로 제한
}) {
  const [user, setUser] = useState(auth.currentUser); //로그인 되어있다면 user, 아니면 null값을 넘겨받음

  useEffect(() => {
    //인증상태 변경을 감지
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser); // 사용자가 로그인하거나 로그아웃할 때마다 이 함수가 호출되어 user 상태를 업데이트
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (user === null) {
    return <Navigate to="/login" />; //로그인 되어있지 않다면, login페이지로 리다이렉트 되도록
  }
  return children;
}
