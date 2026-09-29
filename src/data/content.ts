/* 站点全部内容配置 —— 改内容只动这个文件 */

export interface LiveConfig {
  isLive: boolean;
  liveText: string;
  liveUrl: string;
  nextText: string;
}

export interface ScheduleDay {
  weekday: string;
  isLive: boolean;
  time: string;
  note: string;
}

export interface Clip {
  title: string;
  plays: string;
  date: string;
  platform: 'B站' | '抖音';
  url: string;
  theme: 'pink' | 'violet' | 'amber';
  fruit: 'apple' | 'peach' | 'strawberry';
}

export interface Photo {
  src: string;
  caption: string;
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

export const content = {
  live: {
    isLive: false,
    liveText: '果子正在直播，快来看！',
    liveUrl: 'https://live.bilibili.com/',
    nextText: '下次直播：周六晚 8 点',
  } as LiveConfig,

  schedule: [
    { weekday: '周一', isLive: false, time: '', note: '休息日' },
    { weekday: '周二', isLive: true, time: '20:00', note: '游戏回' },
    { weekday: '周三', isLive: false, time: '', note: '休息日' },
    { weekday: '周四', isLive: true, time: '20:00', note: '歌回' },
    { weekday: '周五', isLive: true, time: '21:00', note: '深夜杂谈' },
    { weekday: '周六', isLive: true, time: '20:00', note: '高能游戏日' },
    { weekday: '周日', isLive: true, time: '15:00', note: '下午茶杂谈' },
  ] as ScheduleDay[],

  clips: [
    { title: '【高能】果子一嗓子把队友唱哭了', plays: '12.6万', date: '2026-09-20', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'pink', fruit: 'apple' },
    { title: '名场面：果子的反向 Flag 现场', plays: '8.9万', date: '2026-09-14', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'violet', fruit: 'peach' },
    { title: '三分钟看完果子的首播名场面', plays: '15.2万', date: '2026-09-06', platform: '抖音', url: 'https://www.douyin.com/', theme: 'amber', fruit: 'strawberry' },
    { title: '果子与猫の巅峰对决', plays: '6.4万', date: '2026-08-28', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'violet', fruit: 'apple' },
    { title: '深夜电台：果子读留言读到哽咽', plays: '9.8万', date: '2026-08-20', platform: '抖音', url: 'https://www.douyin.com/', theme: 'pink', fruit: 'peach' },
    { title: '果子教你做苹果派（翻车了）', plays: '11.1万', date: '2026-08-12', platform: 'B站', url: 'https://www.bilibili.com/', theme: 'amber', fruit: 'strawberry' },
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
    { name: 'B站', icon: 'tv' as const, url: 'https://space.bilibili.com/' },
    { name: '抖音', icon: 'music' as const, url: 'https://www.douyin.com/' },
    { name: '微博', icon: 'at' as const, url: 'https://weibo.com/' },
  ],
};

export const marqueeItems = ['高能切片', '每周直播', '果子的日常', '粉丝二创', '星光留言', '为爱发电'];
