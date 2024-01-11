import alfy from "alfy";

let title = "";

// 检查项目缓存
if (alfy.cache.has("projects")) {
  alfy.cache.delete("projects");
  title = "清理完成";
} else {
  title = "无需清理";
}

alfy.output([
  {
    title,
  },
]);
