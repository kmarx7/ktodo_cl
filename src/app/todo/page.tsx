import { ListPage } from "@/components/ListPage";

export default function TodoPage() {
  return <ListPage type="todo" emptyLabel="할 일을 추가해보세요" showAmount={false} />;
}
