import { Link, Outlet } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 10fr 1fr; //1:10 비율로 열의 너비 차지
  /* overflow: hidden; // 전체 레이아웃에서 스크롤 숨기기 */

  margin-bottom: 10px;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr; // 단일 열로 변경
    /* grid-template-rows: 1fr auto; // 행을 추가하여 푸터 영역 확보 */
    height: auto;
  }
`;

const Menu = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column; //메인 축(main axis) : 수평방향
  align-items: center; //메인 축(main axis)과 직각으로 교차하는 축인, 교차 축(cross axis)을 따라 Flexbox 컨테이너 내 아이템들을 어떻게 정렬할지 결정
  gap: 20px;

  @media (max-width: 600px) {
    margin-top: 0;
    flex-direction: row; // 가로 방향으로 변경
    justify-content: space-around; // 버튼들 균등하게 분배
    position: fixed; // 고정 위치
    bottom: 0; // 하단에 위치
    width: 100%; // 전체 너비 사용
    background-color: #000; // 배경 색상 설정
    padding: 5px 0; // 상하 패딩
    border-top: 0.3px solid gray;
  }
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
  &.search {
    //클래스명이 search인 MenuItem타겟
    svg {
      fill: none;
    }
  }
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }

  @media (max-width: 600px) {
    border: none;
    height: 43px;
    width: 43px;
    svg {
      width: 27px;
      fill: white;
    }
  }
`;

const Extra = styled.div``;

export default function Layout() {
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

  return (
    <>
      {/* navigation bar */}
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
          {/* 팔로잉하는 사람들 게시글 목록 연결 버튼 */}
          <Link to={`/following`}>
            <MenuItem>
              <svg
                data-slot="icon"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
                ></path>
                <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"></path>
              </svg>
            </MenuItem>
          </Link>{" "}
          {/* 검색 버튼 */}
          <Link to={`/search`}>
            <MenuItem className="search">
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.5"
                stroke="white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                ></path>
              </svg>
            </MenuItem>
          </Link>
          {/* 북마크 목록 버튼 */}
          <Link to={`/bookmark`}>
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
        </Menu>
        <Outlet />
        {/*중첩된 라우트(nested route)의 컴포넌트를 렌더링하는 위치 지정(자식 라우트가 렌더링될 자리를 표시)*/}
        <Extra></Extra>
      </Wrapper>
    </>
  );
}
