import React from "react";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode; //children이라는 props에 React.ReactNode 타입을 지정
  //children이 받을 수 있는 값의 종류를 React 노드(요소, 문자열, 숫자 등)로 제한
}) {
  const user = auth.currentUser; //로그인 되어있다면 user, 아니면 null값을 넘겨받음
  console.log(user);
  if (user === null) {
    return <Navigate to="/login" />; //로그인 되어있지 않다면, login페이지로 리다이렉트 되도록
  }
  return children;
}
