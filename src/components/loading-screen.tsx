import { styled } from "styled-components"; //CSS-in-JS를 구현하기 위한 라이브러리

//styled 객체를 사용하여 다양한 HTML 요소에 스타일을 적용
//div 요소에 CSS 스타일을 적용
const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

//span 요소에 스타일을 적용
const Text = styled.span`
  font-size: 24px;
`;

export default function LoadingScreen() {
  return (
    <Wrapper>
      <Text>Loading...</Text>
    </Wrapper>
  );
}
