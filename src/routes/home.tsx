import styled from "styled-components";
import Timeline from "../components/timeline";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  display: grid;
  /* gap: 30px; */
  /* grid-template-rows: 1fr 5fr; */
  overflow-y: scroll; //양식은 고정된 상태에서 내용을 스크롤
  grid-template-rows: auto 1fr auto; // 헤더, 메인, 푸터의 비율을 설정
  height: 100vh;
`;

const MainContent = styled.main`
  margin-top: 30px;
  margin-bottom: 10px;
  @media (max-width: 600px) {
    margin-top: 60px;
  }
`;

const MenuItem = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #8792e2;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
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
`;

const FloatingButton = styled(Link)`
  position: fixed; // 화면에 고정
  bottom: 20px; // 화면 아래에서 20px 위로
  right: 20px; // 화면 오른쪽에서 20px 왼쪽으로
  z-index: 1000; // 다른 요소들 위에 표시되도록 z-index 설정

  @media (max-width: 600px) {
    bottom: 60px; // 푸터 고려하여, 화면 아래에서 70px 위로
  }
`;

const Header = styled.header`
  display: none; // 기본 상태에서는 숨김
  justify-content: center;
  align-items: center;
  height: 50px;
  background-color: #000; // 헤더 배경 색상 설정
  border-bottom: 0.3px solid lightgray; // 헤더 하단에 경계선 추가
  width: 100%;

  font-size: 24px;
  color: white;
  font-family: "Lobster", sans-serif; // 폰트 적용
  position: fixed; // 고정 위치
  top: 0;
  z-index: 1000; // 다른 요소들 위에 표시되도록 z-index 설정

  @media (max-width: 600px) {
    display: flex; // 600px 이하일 때 요소를 보이게 함
  }
`;

export default function Home() {
  return (
    <>
      <Wrapper>
        <Header>Universe</Header>
        <MainContent>
          <BackgroundAnimation />
          <Timeline />
        </MainContent>
      </Wrapper>
      {/* tweet작성 버튼 */}
      <FloatingButton to={`/post`}>
        <MenuItem>
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
              d="M12 4.5v15m7.5-7.5h-15"
            ></path>
          </svg>
        </MenuItem>
      </FloatingButton>
      {/* 검색 버튼 */}
    </>
  );
}
