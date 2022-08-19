import alfy from "alfy";
import { Gitlab } from "@gitbeaker/node";

const { HOST, TOKEN } = process.env;
const api = new Gitlab({
  token: TOKEN,
  host: HOST,
});

const todos = await api.Todos.all();

if (todos.length === 0) {
  alfy.error("没有相关的待办事项");
} else {
  let items = alfy.inputMatches(todos, "body").map((element) => ({
    uid: element.id,
    title: element.body,
    subtitle: element.project.name_with_namespace,
    arg: element.target_url,
    action: {
      url: element.target_url,
    },
    variables: {
      id: element.id,
      url: element.target_url,
    },
  }));
  alfy.output(items);
}
