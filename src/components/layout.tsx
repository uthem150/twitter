import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Outlet />
      {/*중첩된 라우트(nested route)의 컴포넌트를 렌더링하는 위치 지정(자식 라우트가 렌더링될 자리를 표시)*/}
    </>
  );
  0;
}
