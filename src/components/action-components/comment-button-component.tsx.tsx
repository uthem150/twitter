import { useState } from "react";
import styled from "styled-components";

const CmtButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  width: 25px;
  transition: transform 0.3s ease; // 변환(크기, 위치 등)에 대해 0.3초 동안 부드럽게 변화
  &:hover {
    transform: scale(1.05); // 호버 시 버튼을 5% 확대
  }
`;

interface CmtClickProps {
  // userId: string;
  // tweetId: string;
  handleCmtClicked: (returnValue: boolean) => void;
}

export default function CmtClick({
  // userId,
  // tweetId,
  handleCmtClicked,
}: CmtClickProps) {
  const [isCmtd, setIsCmtd] = useState(false);
  // const [cmtCount, setCmtCount] = useState(0);

  // 댓글 버튼이 클릭되었을 때 실행될 함수
  const onClick = async () => {
    setIsCmtd(!isCmtd);
    handleCmtClicked(!isCmtd);
  };

  return (
    <>
      <CmtButton onClick={onClick}>
        <svg
          data-slot="icon"
          fill={isCmtd ? "white" : "none"} // isCmtd에 따라 fill 속성 변경
          strokeWidth="1.5"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
          ></path>
        </svg>
      </CmtButton>
      {/* <StatsContainer>
        {cmtCount > 0 ? `댓글 ${cmtCount}개` : null}
      </StatsContainer> */}
    </>
  );
}
