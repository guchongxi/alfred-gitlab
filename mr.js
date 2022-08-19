import alfy from "alfy";
import { Gitlab } from "@gitbeaker/node";

const { HOST, TOKEN } = process.env;
const api = new Gitlab({
  token: TOKEN,
  host: HOST,
});

const mergeRequests = await api.MergeRequests.all({
  scope: "created_by_me",
  view: "simple",
  state: "opened",
});

if (mergeRequests.length === 0) {
  alfy.error("没有相关的 MR");
} else {
  const items = alfy.inputMatches(mergeRequests, "title").map((element) => ({
    uid: element.id,
    title: element.title,
    subtitle: element.web_url,
    arg: element.web_url,
    action: {
      url: element.web_url,
    },
    variables: {
      id: element.id,
      name: element.title,
      repo: element.web_url,
    },
  }));
  alfy.output(items);
}
