import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import BackgroundAnimation from "../components/BackgroundStyle/BackgroundAnimation";

const Wrapper = styled.div`
  display: grid;
  gap: 50px;
  overflow-y: scroll; //양식은 고정된 상태에서 내용을 스크롤
  grid-template-rows: 1fr 5fr;
`;

export default function Home() {
  return (
    <>
      <Wrapper>
        <BackgroundAnimation />

        <PostTweetForm />
        <Timeline />
      </Wrapper>
    </>
  );
}
