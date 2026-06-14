import { SearchEngines } from './types'

const searchEngines: SearchEngines = {
  google: "https://www.google.com/search?q=%s",
  bing: "https://www.bing.com/search?q=%s",
  baidu: "https://www.baidu.com/s?wd=%s",
  yandex: "https://yandex.com/search/?text=%s",
  duckduckgo: "https://duckduckgo.com/?q=%s",
  ecosia: "https://www.ecosia.org/search?q=%s",
  yahoo: "https://search.yahoo.com/search?p=%s",
  brave: "https://search.brave.com/search?q=%s",
  qwant: "https://www.qwant.com/?q=%s",
  aol: "https://search.aol.com/aol/search?q=%s"
}

const resourceEngines: SearchEngines = {
  zhihu: "https://www.zhihu.com/search?q=%s",
  wikipedia: "https://zh.wikipedia.org/wiki/%s",
  weibo: "https://s.weibo.com/weibo?q=%s",
  xiaohongshu: "https://www.xiaohongshu.com/search_result?keyword=%s",
  reddit: "https://www.reddit.com/search/?q=%s",
  x: "https://x.com/search?q=%s",
  bilibili: "https://search.bilibili.com/all?keyword=%s",
  douyin: "https://www.douyin.com/search/%s",
  kuaishou: "https://www.kuaishou.com/search/video?keyword=%s",
  taobao: "https://s.taobao.com/search?q=%s",
  amazon: "https://www.amazon.com/s?k=%s",
  jingdong: "https://search.jd.com/Search?keyword=%s"
}

const translateEngines: SearchEngines = {
  google: "https://translate.google.com/?sl=auto&tl=zh-CN&text=%s",
  bing: "https://www.bing.com/translator?text=%s",
  deepl: "https://www.deepl.com/zh/translator#zh/en-us/%s",
  baidu: "https://fanyi.baidu.com/#auto/zh/%s",
  yandex: "https://translate.yandex.com/?source_lang=en&target_lang=zh&text=%s"
}

export { searchEngines, resourceEngines, translateEngines }