import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle, styled } from "styled-components";
import reset from "styled-reset";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/loading-screen";
import { auth } from "./firebase";
import ProtectedRoute from "./components/protected-route";
import ResetPassword from "./routes/reset-password";
import Bookmark from "./routes/bookmark";
import PostTweet from "./routes/post-tweet";
import Search from "./routes/search";
import FollowingUserPost from "./routes/following-user-post";

//애플리케이션의 라우트를 정의하는 배열을 생성 -  router : 페이지 간의 이동 기능을 제공
const router = createBrowserRouter([
  {
    // path : URL 경로를 지정
    // element: 해당 경로에 접속했을 때 렌더링할 컴포넌트를 지정
    // children : //중첩된 라우트를 정의
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "", // localhost/
        element: <Home />,
      },
      {
        path: "following/:userId", // localhost/following
        element: <FollowingUserPost />,
      },
      {
        path: "post", // localhost/post
        element: <PostTweet />,
      },
      {
        path: "profile/:userId", // localhost/profile
        element: <Profile />,
      },
      {
        path: "bookmark/:userId", // localhost/bookmark
        element: <Bookmark />,
      },
      {
        path: "search", // localhost/search
        element: <Search />,
      },
    ],
  },
  //layout은 로그인한 사용자만 사용할 수 있도록, login요소를 바깥에
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/create-account",
    element: <CreateAccount />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
]);

// styled-components에서 제공하는 API로, 글로벌 스타일을 생성하기 위해 사용
// reset : 브라우저 간의 일관성 없는 기본 스타일링을 제거하고, 모든 브라우저에서 일관된 스타일링을 시작할 수 있는 깨끗한 기반을 제공
const GlobalStyles = createGlobalStyle`
  ${reset}; 
  * {
    box-sizing: border-box;
  }
  body {
    background-color: black;
    color:white;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  ::-webkit-scrollbar { //스크롤 기능은 유지하되, 스크롤바 없애기
    display:none;
  }
`;

// 앱 전체를 Wrapper로 감싸면, 모든게 화면 가운데로 위치
const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
`;

function App() {
  const [isLoading, setLoading] = useState(true);
  const init = async () => {
    // firebase가 쿠키와 토큰을 읽고 백엔드와 소통해서 로그인 정보를 확인하는 동안 기다리겠다.
    // authStateReady : 최초 인증 상태가 완료될 때, 실행되는 Promise를 return
    await auth.authStateReady();
    setLoading(false);
  };
  useEffect(() => {
    init();
  }, []);
  return (
    <Wrapper>
      <GlobalStyles /> {/*글로벌 스타일(GlobalStyles) 적용*/}
      {isLoading ? <LoadingScreen /> : <RouterProvider router={router} />}
      {/*배열을 RouterProvider의 router prop으로 전달하여 라우팅이 적용되도록 함*/}
    </Wrapper>
  );
}

export default App;
