// 搜索引擎配置模块
const searchEngines = {
  google: "https://www.google.com/search?q=",
  bing: "https://www.bing.com/search?q=",
  baidu: "https://www.baidu.com/s?wd=",
  yandex: "https://yandex.com/search/?text=",
  duckduckgo: "https://duckduckgo.com/?q=",
  ecosia: "https://www.ecosia.org/search?q=",
  yahoo: "https://search.yahoo.com/search?p=",
  brave: "https://search.brave.com/search?q=",
  qwant: "https://www.qwant.com/?q=",
  aol: "https://search.aol.com/aol/search?q="
}

const resourceEngines = {
  // 知识/问答
  zhihu: "https://www.zhihu.com/search?q=",

  // 社交
  weibo: "https://s.weibo.com/weibo?q=",
  xiaohongshu: "https://www.xiaohongshu.com/search_result?keyword=",

  // 视频
  bilibili: "https://search.bilibili.com/all?keyword=",
  douyin: "https://www.douyin.com/search/",

  // 电商
  taobao: "https://s.taobao.com/search?q="
}

const translateEngines = {
  google: "https://translate.google.com/?sl=auto&tl=zh-CN&text=",
  bing: "https://www.bing.com/translator?text=",
  deepl: "https://www.deepl.com/zh/translator#zh/en-us/",
  baidu: "https://fanyi.baidu.com/#auto/zh/",
  yandex: "https://translate.yandex.com/?source_lang=en&target_lang=zh&text="
}

export { searchEngines, resourceEngines, translateEngines }