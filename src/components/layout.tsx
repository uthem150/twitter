import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 10fr; //1:10 비율로 열의 너비 차지
  height: 100%;
  //padding: 50px 0px;
  margin-top: 50px;
  margin-bottom: 10px;
  width: 100%;
  max-width: 960px;
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column; //메인 축(main axis) : 수평방향
  align-items: center; //메인 축(main axis)과 직각으로 교차하는 축인, 교차 축(cross axis)을 따라 Flexbox 컨테이너 내 아이템들을 어떻게 정렬할지 결정
  gap: 20px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  svg {
    width: 30px;
    fill: white;
  }
  &.log-out {
    //클래스명이 log-out인 MenuItem타겟
    border-color: tomato;
    svg {
      fill: tomato;
    }
  }
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }
`;

export default function Layout() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null); // userId 상태 관리(상태의 타입은 string 또는 null을 포함할 수 있는 타입)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // 로그인한 사용자가 있으면 userId 설정
      } else {
        setUserId(null); // 로그인한 사용자가 없으면 userId를 null로 설정
      }
    });

    return () => unsubscribe(); // 컴포넌트가 언마운트될 때 구독 해제
  }, []);
  const onLogOut = async () => {
    const ok = confirm("Are you sure you want to log out?"); //확인을 누르면, ok 변수가 true가 됨
    if (ok === true) {
      await auth.signOut(); //signOut함수 호출
      //결과값을 반환하면, 로그인 페이지로 돌아감
      navigate("/login");
    }
  };
  return (
    //navigation bar
    <Wrapper>
      <Menu>
        {/* 홈으로 연결 버튼 */}
        <Link to="/">
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
              />
            </svg>
          </MenuItem>
        </Link>
        {/* 프로필 연결 버튼 */}
        <Link to={`/profile/${userId}`}>
          <MenuItem>
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
          </MenuItem>
        </Link>
        {/* 북마크 목록 버튼 */}
        <Link to={`/bookmark/${userId}`}>
          <MenuItem>
            <svg
              data-slot="icon"
              fill="white"
              strokeWidth="1.5"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              ></path>
            </svg>
          </MenuItem>
        </Link>
        {/* 로그아웃 버튼 */}
        <MenuItem onClick={onLogOut} className="log-out">
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
            />
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
            />
          </svg>
        </MenuItem>
      </Menu>
      <Outlet />
      {/*중첩된 라우트(nested route)의 컴포넌트를 렌더링하는 위치 지정(자식 라우트가 렌더링될 자리를 표시)*/}
    </Wrapper>
  );
}
