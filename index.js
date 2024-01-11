import alfy from "alfy";
import { Gitlab } from "@gitbeaker/node";

const { HOST, TOKEN } = process.env;
if (!(HOST && TOKEN)) {
  alfy.error("请设置 HOST 和 TOKEN 环境变量");
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
  } else if (!alfy.cache.has("projects")) {
    // 无缓存时获取项目数据
    const passTime = alfy.cache.get("gettingProjects");
    // 获取中，轮询检查一次是否完成
    if (passTime) {
      alfy.output(
        [
          {
            title: `更新项目索引中... ${Math.round(
              (Date.now() - passTime) / 1000
            )}s`,
          },
        ],
        {
          rerunInterval: 0.4,
        }
      );
    } else if (passTime === 0) {
      // 设置标志位
      alfy.cache.set("gettingProjects", Date.now(), { maxAge: 60 * 1000 });
      // 获取全部项目
      api.Projects.all().then((projects) => {
        // 缓存项目 30 天
        alfy.cache.set("projects", projects, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        // 清除标志位
        alfy.cache.delete("gettingProjects");
      });
    } else {
      // 还未获取，则提示退出再试，启动请求
      alfy.output(
        [
          {
            title: "更新项目索引中，请退出稍后再试",
          },
        ],
        {
          rerunInterval: 0.1,
        }
      );
      // 设置 0 标识提示了，但还没启动请求
      alfy.cache.set("gettingProjects", 0, { maxAge: 60 * 1000 });
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
