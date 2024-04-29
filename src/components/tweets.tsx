import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span``;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return; //userId가 일치하지 않으면 종료
    try {
      await deleteDoc(doc(db, "tweets", id)); //deleteDoc함수를 사용하여 문서 삭제
      // deleteDoc의 매개변수는 삭제할 문서에 대한 참조. doc함수를 사용하여 해당 참조 불러옴
      //firebase 인스턴스 db넘겨주고, 문서가 저장된 경로 제공(tweets 컬렉션에 저장되어 있음), 해당 문서는 id를 가짐
      if (photo) {
        //트윗에 사진이 첨부되어 있는지 확인 (사진이 있다면, 사진에 대한 참조를 받아야 함)
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`); //스토리지 인스턴스, 경로
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };
  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        <Payload>{tweet}</Payload>
        {/* user?.uid는 JavaScript의 Optional Chaining (?.) 연산자 -  user 객체가 null이거나 undefined가 아닐 경우에만 uid 속성에 접근(타입에러 방지) */}
        {user?.uid === userId ? (
          <DeleteButton onClick={onDelete}>Delete</DeleteButton>
        ) : null}
      </Column>
      {/* 사진이 있으면, 보여주고 아니면 null */}
      {photo ? (
        <Column>
          <Photo src={photo} />
        </Column>
      ) : null}
    </Wrapper>
  );
}
