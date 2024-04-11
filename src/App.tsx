import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import Home from "./routes/home";
import Profile from "./routes/profile";
import Login from "./routes/login";
import CreateAccount from "./routes/create-account";
import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";

//애플리케이션의 라우트를 정의하는 배열을 생성 -  router : 페이지 간의 이동 기능을 제공
const router = createBrowserRouter([
  {
    // path : URL 경로를 지정
    // element: 해당 경로에 접속했을 때 렌더링할 컴포넌트를 지정
    // children : //중첩된 라우트를 정의
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "", // localhost/
        element: <Home />,
      },
      {
        path: "profile", // localhost/profile
        element: <Profile />,
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
`;

function App() {
  return (
    <>
      <GlobalStyles /> {/*글로벌 스타일(GlobalStyles) 적용*/}
      <RouterProvider router={router} />{" "}
      {/*배열을 RouterProvider의 router prop으로 전달하여 라우팅이 적용되도록 함*/}
    </>
  );
}

export default App;
