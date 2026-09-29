/* 站点全部内容配置 —— 改内容只动这个文件
   （streams 回放列表、live-status 开播状态由 scripts/ 下的脚本自动更新） */
import streamsData from './streams.json';
import liveStatusData from './live-status.json';

export interface LiveStatus {
  isLive: boolean;
  nick: string;
  roomName: string;
  game: string;
  startTime: number;
  checkedAt: string;
}

export interface StreamDay {
  /** 格式 YYYY-MM-DD */
  date: string;
  title: string;
  /** 当天回放地址 */
  url: string;
}

export interface Clip {
  title: string;
  /** 显示用时长，如 "2:13" */
  duration: string;
  /** 本地视频地址（public/clips/，视频不进 git） */
  src: string;
  /** 封面图（ffmpeg 从视频 30% 处截取） */
  cover: string;
}

export interface Photo {
  src: string;
  caption: string;
}

export interface Meme {
  src: string;
  top?: string;
  bottom?: string;
}

export interface FanWork {
  author: string;
  theme: 'pink' | 'violet' | 'amber';
  fruit: 'apple' | 'peach' | 'strawberry';
  ratio: '4:3' | '1:1' | '3:4';
}

export interface SeedMessage {
  name: string;
  text: string;
}

const photo = (n: number) => `${import.meta.env.BASE_URL}photos/photo-${String(n).padStart(2, '0')}.jpg`;
const meme = (n: number, ext: 'gif' | 'jpg') => `${import.meta.env.BASE_URL}memes/meme-${String(n).padStart(2, '0')}.${ext}`;
const clip = (n: number) => ({
  src: `${import.meta.env.BASE_URL}clips/clip-${String(n).padStart(2, '0')}.mp4`,
  cover: `${import.meta.env.BASE_URL}clips/cover-${String(n).padStart(2, '0')}.jpg`,
});

const HUYA_URL = 'https://www.huya.com/158924';
const DOUYIN_URL =
  'https://www.douyin.com/user/MS4wLjABAAAAwtjsL_j2iIWoyrQQfUXytyr97lmDiauG2yZ8wPWdJRHsOjUhH_9d_R1CLPx66cTH?from_tab_name=main';

export const content = {
  live: {
    liveUrl: HUYA_URL,
  },

  /* 虎牙实时开播状态（scripts/fetch-live-status.mjs 每 10 分钟同步） */
  liveStatus: liveStatusData as LiveStatus,

  /* 历史直播记录：有记录的日子会在月历上标粉，点击看回放
     数据来自 B站录像合集，scripts/fetch-replays.mjs 每日自动同步 */
  streams: streamsData as StreamDay[],

  /* 高能切片：本地视频（果子素材/高能切片），点击卡片站内播放 */
  clips: [
    { title: '果子大资庄园游龙记，一来就拉着姿态跳新宝岛', duration: '2:13', ...clip(1) },
    { title: '果子小黑子露出鸡脚了，直播间跳鸡你太美', duration: '1:26', ...clip(2) },
    { title: '果子生涯首哭，被弹幕吓哭了，像极了犯错事的小孩子', duration: '8:20', ...clip(3) },
    { title: '姿态意外发现果子捂嘴变得巨好看，锐评捂嘴变田曦薇', duration: '1:30', ...clip(4) },
    { title: '姿态果子互相全力打对方一拳，姿态手都红了', duration: '4:11', ...clip(5) },
    { title: '果子问 AJ 怎么对待弹幕指挥，AJ：听大哥指挥', duration: '1:13', ...clip(6) },
  ] as Clip[],

  /* Hero 照片轮播（精选） */
  heroPhotos: [
    { src: photo(18), caption: '女仆果的 wink 暴击' },
    { src: photo(3), caption: '直播间的眼镜果' },
    { src: photo(15), caption: '营业中的爱豆果' },
    { src: photo(16), caption: '赛道酷盖果' },
    { src: photo(4), caption: '和狗狗们的一天' },
    { src: photo(14), caption: '街头卫衣果' },
    { src: photo(1), caption: '今日份自拍' },
  ] as Photo[],

  /* 果子的日常（真人照片墙） */
  photos: [
    { src: photo(3), caption: '眼镜果出击' },
    { src: photo(4), caption: '和狗狗们的一天' },
    { src: photo(1), caption: '直播前的自拍' },
    { src: photo(2), caption: '慵懒午后' },
    { src: photo(5), caption: '今日份营业' },
    { src: photo(6), caption: '奶茶续命中' },
    { src: photo(7), caption: '排练室打卡' },
    { src: photo(8), caption: '宅家日记' },
    { src: photo(9), caption: '草莓味下午' },
    { src: photo(10), caption: '晚安电台' },
    { src: photo(11), caption: '下班路上' },
    { src: photo(12), caption: '周末碎片' },
  ] as Photo[],

  /* 表情包广场·内置表情包（粉丝群真实素材，GIF 直接播放） */
  memes: [
    { src: meme(1, 'gif'), bottom: '气鼓鼓' },
    { src: meme(2, 'gif'), bottom: '盯——' },
    { src: meme(3, 'gif'), bottom: '高冷果' },
    { src: meme(4, 'gif'), bottom: '小小的眼睛大大的疑惑' },
    { src: meme(5, 'gif'), bottom: '小丑竟是我自己' },
    { src: meme(6, 'jpg'), bottom: '刚睡醒' },
    { src: meme(7, 'jpg') },
    { src: meme(8, 'jpg') },
    { src: meme(9, 'jpg') },
  ] as Meme[],

  fanwall: {
    tip: '想上墙？投稿到',
    email: 'guoziyuan@example.com',
    works: [
      { author: '桃桃乌龙', theme: 'pink', fruit: 'peach', ratio: '4:3' },
      { author: '一颗小苹果', theme: 'violet', fruit: 'apple', ratio: '1:1' },
      { author: '草莓大福', theme: 'amber', fruit: 'strawberry', ratio: '3:4' },
      { author: '果园园丁甲', theme: 'pink', fruit: 'strawberry', ratio: '4:3' },
      { author: '芝士奶盖', theme: 'violet', fruit: 'apple', ratio: '1:1' },
      { author: '路过的蚂蚁', theme: 'amber', fruit: 'peach', ratio: '3:4' },
    ] as FanWork[],
  },

  messages: {
    maxLength: 50,
    notice: '留言会化作星星挂在夜空里～保存在你的浏览器中，只有你自己能看到哦',
    seeds: [
      { name: '果小糖', text: '果子加油！每天看你直播下饭！' },
      { name: '苹果核', text: '从首播追到现在，果子越来越棒了' },
      { name: '桃气包', text: '周六的直播我设了三个闹钟' },
      { name: '草莓籽', text: '高能切片已经循环了一百遍' },
      { name: '小叶子', text: '果子要天天开心呀' },
      { name: '果园保安', text: '守护全世界最好的果子' },
      { name: '荧光棒本棒', text: '舞台上闪闪发光的就是你' },
    ] as SeedMessage[],
  },

  social: [
    { name: '虎牙', icon: 'tv' as const, url: HUYA_URL },
    { name: '抖音', icon: 'music' as const, url: DOUYIN_URL },
  ],
};

export const marqueeItems = ['高能切片', '每周直播', '果子的日常', '表情包广场', '粉丝二创', '星光留言', '为爱发电'];
