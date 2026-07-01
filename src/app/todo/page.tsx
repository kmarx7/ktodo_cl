import { ListPage } from "@/components/ListPage";

export default function TodoPage() {
  return <ListPage type="todo" emptyLabel="Add a task" showAmount={false} />;
}
