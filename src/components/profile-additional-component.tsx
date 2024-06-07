import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column; //메인 축(main axis) : 수평방향
  width: 100%;
  padding: 10px 13px; //상하10 좌우10
  /* border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.5); //투명도 50% */

  list-style: none; // li 요소 스타일 제거
  gap: 3px;
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 35px;

  svg {
    width: 23px;
    fill: white;
  }
  &.log-out {
    //클래스명이 log-out인 MenuItem타겟
    /* border-color: tomato; */
    svg {
      fill: tomato;
    }
  }
  &.hamberger {
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 7px;
  }
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }
`;
const Text = styled.span`
  color: white;
  font-size: 14px;
`;

const MenuWrapper = styled.div`
  width: 150px;
  gap: 10px;
  display: grid;
  grid-template-columns: 1fr 8fr; //1:10 비율로 열의 너비 차지
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 5px;
  border-radius: 7px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

export default function AdditionalComponent() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null); // userId 상태 관리(상태의 타입은 string 또는 null을 포함할 수 있는 타입)
  const [isMenuVisible, setIsMenuVisible] = useState(false); // 메뉴 표시 상태 추가

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

  const toggleMenu = () => {
    // 메뉴 표시 상태 토글 함수
    setIsMenuVisible(!isMenuVisible);
  };

  return (
    <Wrapper>
      <MenuItem className="hamberger">
        <svg
          onClick={toggleMenu} // SVG 클릭 시 메뉴 표시 상태 토글
          data-slot="icon"
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          ></path>
        </svg>
      </MenuItem>

      {isMenuVisible && ( // 메뉴 표시 상태에 따라 조건부 렌더링
        <>
          {/* 북마크 목록 버튼 */}
          <StyledLink to={`/bookmark/${userId}`}>
            <MenuWrapper>
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
              <Text>북마크 게시글</Text>
            </MenuWrapper>
          </StyledLink>
          <MenuWrapper>
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
            <Text onClick={onLogOut}>로그아웃</Text>
          </MenuWrapper>
        </>
      )}
    </Wrapper>
  );
}
