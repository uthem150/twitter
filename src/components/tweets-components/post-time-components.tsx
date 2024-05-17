import styled from "styled-components";

const CreateTime = styled.p`
  // Username 컴포넌트를 styled(Link)로 변경합니다.
  color: #bebebe; // Link의 기본 색상을 상속받도록 설정
  text-decoration: none; // 밑줄 제거
  font-size: 13px;
  margin-left: 5px;
`;

//컴포넌트에 전달되는 props의 타입 정의
interface TimeProps {
  createdAt: number; // 'createdAt'의 타입 number로 정의
}

const getTimeDifference = (createdAt: number) => {
  const date = new Date(createdAt);
  const now = new Date();
  let timeDifference = (now.getTime() - date.getTime()) / 1000 / 60; // 분 단위로 시간 차이 계산

  if (timeDifference < 1) {
    return "방금 전";
  } else if (timeDifference < 60) {
    return Math.floor(timeDifference) + "분 전";
  }
  timeDifference /= 60; // 시간 단위로 변환

  if (timeDifference < 24) {
    return Math.floor(timeDifference) + "시간 전";
  }
  timeDifference /= 24; // 일 단위로 변환

  if (timeDifference < 7) {
    return Math.floor(timeDifference) + "일 전";
  }

  if (timeDifference < 30) {
    return Math.floor(timeDifference / 7) + "주 전";
  }
  // 30일 이상이면 날짜 반환
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default function PostTime({ createdAt }: TimeProps) {
  return (
    <CreateTime>{createdAt ? getTimeDifference(createdAt) : ""}</CreateTime>
  );
}
