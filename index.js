import alfy from "alfy";
import { Gitlab } from "@gitbeaker/node";

/**
 * 判断是否是有效缓存
 */
const isValidCache = (key) => alfy.cache.has(key) && !alfy.cache.isExpired(key);

const { HOST, TOKEN } = process.env;
if (!(HOST && TOKEN)) {
  alfy.error('Please set "HOST" and "TOKEN" workflow variables.');
} else {
  const api = new Gitlab({
    token: TOKEN,
    host: HOST,
  });

  const menu = [
    {
      uid: "issues",
      title: "Issues Related to you",
      subtitle: "Browse issues assigned to or create by you",
      variables: {
        selection: "issues",
      },
    },
    {
      uid: "merge_requests",
      title: "Merge requests Related to or create by you",
      subtitle: "Browse all merge requests assigned to you",
      variables: {
        selection: "merge_requests",
      },
    },
    {
      uid: "todo",
      title: "Todos",
      subtitle: "Check all todos for you",
      variables: {
        selection: "todos",
      },
    },
    {
      uid: "remove",
      title: "Remove",
      subtitle: "Clear project cache",
      variables: {
        selection: "remove",
      },
    },
    {
      uid: "index",
      title: "Index",
      subtitle: "Open GitLab index",
      arg: "https://gitlab.dxy.net/",
    },
  ];

  // 没有输入，展示菜单
  if (!alfy.input) {
    alfy.output(menu);
  } else if (!isValidCache("projects")) {
    // 防重，没有获取时先提示一下，下次一获取中会卡住
    if (!isValidCache("gettingProjects")) {
      // 提示获取列表中，3s 重试一次
      alfy.output(
        [
          {
            title: `Updating indices`,
          },
        ],
        {
          rerunInterval: 1,
        }
      );
      // 设置标志位
      alfy.cache.set("gettingProjects", true, { maxAge: 5 * 1000 });
    } else {
      // 获取全部项目
      const projects = await api.Projects.all();
      // 缓存项目 30 天
      alfy.cache.set("projects", projects, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      // 清除标志位
      alfy.cache.delete("gettingProjects");
    }
  } else {
    const projects = alfy.cache.get("projects");
    let items = alfy.inputMatches(projects, "name").map((element) => ({
      uid: element.id,
      title: element.name,
      subtitle: element.name_with_namespace,
      arg: element.web_url,
      action: {
        url: element.web_url,
      },
      variables: {
        id: element.id,
        name: element.name,
        full_name: element.name_with_namespace,
        repo: element.web_url,
        default_branch: element.default_branch,
      },
    }));
    if (items.length) {
      alfy.output(items);
    } else {
      alfy.output([
        {
          title: `Search Gitlab for ${alfy.input}`,
          arg: `https://gitlab.dxy.net/search?search=${alfy.input}`,
        },
      ]);
    }
  }
}
