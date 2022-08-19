import alfy from "alfy";

alfy.output([
  {
    title: `${alfy.cache.has("projects")} ${alfy.cache.isExpired("projects")}`,
  },
]);

// 检查项目缓存
if (alfy.cache.has("projects") && !alfy.cache.isExpired("projects")) {
  alfy.cache.delete("projects");
}
