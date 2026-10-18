import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Grade = 'A' | 'B' | 'C' | 'D';
type View = 'home' | 'quiz' | 'result';
type Option = { text: string; score: Grade };
type Question = { title: string; options: Option[] };
type Result = { level: string; tag: string; title: string; description: string; remark: string };

declare global {
  interface ImportMeta {
    readonly env: { readonly VITE_UMAMI_WEBSITE_ID?: string };
  }
  interface Window {
    umami?: { track: (eventName: string) => void };
  }
}

const questions: Question[] = [
  // 从 30 题候选中抽取，按主题混排，避免同类情境连续出现。
  { title: '你开玩笑后发现对方明显不舒服，会？', options: [ { text: '说“我就开个玩笑”，然后继续', score: 'C' }, { text: '停下来道歉，不要求对方“别当真”', score: 'A' }, { text: '反过来笑对方开不起玩笑', score: 'D' }, { text: '解释自己没有恶意，也会注意分寸', score: 'B' },
  ] },
  { title: '你答应帮人办事，后来发现比想象中麻烦，会怎么做？', options: [ { text: '先试着处理，确认有困难再及时告知', score: 'B' }, { text: '继续答应得很爽快，实际悄悄搁置', score: 'D' }, { text: '尽早说明难处，一起商量能否调整', score: 'A' }, { text: '先拖一拖，等对方问起再解释', score: 'C' },
  ] },
  { title: '你向别人推荐一件东西或一项服务，会怎么介绍？', options: [ { text: '夸大效果，保证“绝对不会踩雷”', score: 'D' }, { text: '主要说优点，也会提到明显缺点', score: 'B' }, { text: '放大优点，问题轻轻带过', score: 'C' }, { text: '优缺点都说清楚，让对方自己判断', score: 'A' },
  ] },
  { title: '有人找你倾诉，而你当时状态不太好，会？', options: [ { text: '一边应付一边做别的事', score: 'C' }, { text: '不回应，之后还嫌对方太情绪化', score: 'D' }, { text: '先听一会儿，再说明自己需要休息', score: 'B' }, { text: '说明现在的状态，约个能认真倾听的时间', score: 'A' },
  ] },
  { title: '团队合作时，有人没有完成自己负责的部分，你会？', options: [ { text: '适当补位，同时提醒对方补上责任', score: 'B' }, { text: '先把事实和分工说清楚，再协调后续', score: 'A' }, { text: '先把责任推给别人，避免自己被问到', score: 'D' }, { text: '不想冲突，默默把事情做完', score: 'C' },
  ] },
  { title: '你发现自己会迟到，通常会？', options: [ { text: '不说，觉得对方等一会儿也没关系', score: 'D' }, { text: '到了约定时间才说“我快到了”', score: 'C' }, { text: '提前告知预计时间，让对方决定怎么安排', score: 'A' }, { text: '确认迟到后马上发消息', score: 'B' },
  ] },
  { title: '别人反复请你帮忙，而你已经觉得为难，会？', options: [ { text: '说明自己的边界，讲清能帮和不能帮的部分', score: 'A' }, { text: '不好意思拒绝，心里越来越不满', score: 'C' }, { text: '先答应，之后用拖延或失联逼对方放弃', score: 'D' }, { text: '这次帮忙后提醒对方以后提前商量', score: 'B' },
  ] },
  { title: '别人告诉你一件私密的事，你会？', options: [ { text: '当作聊天素材讲给更多人听', score: 'D' }, { text: '未经允许不转述，也不拿来当谈资', score: 'A' }, { text: '只向确实需要知道的人求助，并保护隐私', score: 'B' }, { text: '觉得熟人之间说说没关系', score: 'C' },
  ] },
  { title: '朋友或同事提出一个你不同意的想法，你会？', options: [ { text: '表面赞同，之后按自己的想法做', score: 'C' }, { text: '温和表达不同意见，留出讨论空间', score: 'B' }, { text: '直接说明分歧和理由，保持尊重', score: 'A' }, { text: '当面说好，转头吐槽或拆台', score: 'D' },
  ] },
  { title: '一件事出了问题，发现自己也有责任，你会？', options: [ { text: '说清自己负责的部分，并提出补救办法', score: 'A' }, { text: '尽量模糊责任，让别人背下主要问题', score: 'D' }, { text: '先强调客观原因，等别人追问再承认', score: 'C' }, { text: '解释当时情况，也愿意承担该承担的部分', score: 'B' },
  ] },
  { title: '原定计划临时有变，你无法按约定参与，会？', options: [ { text: '确认无法参加后及时告知，简单说明原因', score: 'B' }, { text: '等对方来确认时再说计划有变', score: 'C' }, { text: '临近时才编个借口取消，避免解释真实情况', score: 'D' }, { text: '尽早主动说明，并一起商量替代安排', score: 'A' },
  ] },
  { title: '你不想参加一场邀约，通常会怎么回应？', options: [ { text: '口头答应，临近时再失联或临时放鸽子', score: 'D' }, { text: '先说“到时看看”，之后尽量不再提', score: 'C' }, { text: '礼貌婉拒，也表达感谢和歉意', score: 'B' }, { text: '坦诚说明不方便，不让对方一直等答复', score: 'A' },
  ] },
  { title: '朋友请你牵线介绍，你会如何处理？', options: [ { text: '先征得双方同意，再如实介绍彼此情况', score: 'A' }, { text: '确认大致合适后帮忙牵线，不替任何人打包票', score: 'B' }, { text: '未经同意就交换联系方式，还保证“一定合适”', score: 'D' }, { text: '为了促成见面，把双方优点说得过满', score: 'C' },
  ] },
];

const results: Record<Grade, Result> = {
  A: { level: 'A级｜社交清流', tag: '靠谱珍稀款', title: '背调结论：社交清流', description: '经鉴定，你属于社交圈里罕见的老实人。不画饼，不迂回，不把别人的期待当耗材。跟你相处不用反复复盘，不用偷偷留后路，心脏温度稳定，基本不烧心。', remark: '备注：此类人物因过于稀缺，建议社交圈重点保护。' },
  B: { level: 'B级｜懂得留余地的聪明人', tag: '微烫预警，尚可控场', title: '背调结论：懂得留余地的聪明人', description: '大方向还算稳，底线没有明显崩塌。只是你很懂社交包装术，该藏的藏，该美化的美化，小事不摊开，细节不深究。轻微烧心，但在可接受范围内。', remark: '备注：属于职场和社交场上的合格选手，不算翻车，也不算惊喜。' },
  C: { level: 'C级｜状态看老天爷的选手', tag: '随机烧心盲盒', title: '背调结论：状态看老天爷的选手', description: '顺利时你很正常，甚至显得可靠；一旦压力上来，拖延、回避、含糊其辞立刻上线。你的社交稳定性不稳定，别人跟你相处像开盲盒，随时可能突然烧心。', remark: '备注：建议合作前先确认天气、星座、当日精神状态及老板脸色。' },
  D: { level: 'D级｜期待毁灭专家', tag: '烧心专业户', title: '背调结论：期待毁灭专家', description: '你很会把气氛和期待值拉满，常让人觉得“这次肯定有戏”。偶尔计划赶不上灵感，过程比结果更有故事感。和你相处总有新鲜感，提前对齐节奏，就能把小火花变成好玩的回忆。', remark: '备注：此类人物建议随身携带灭火器、降压药和心理建设指南。' },
};

const grades: Grade[] = ['A', 'B', 'C', 'D'];
const burnPoints: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3 };
function gradeFromBurnScore(total: number): Grade {
  const average = total / questions.length;
  if (average <= 0.75) return 'A';
  if (average <= 1.5) return 'B';
  if (average <= 2.25) return 'C';
  return 'D';
}
const resultQuotes: Record<Grade, string> = {
  A: '真诚自有分量，可靠无需声张。',
  B: '进退有度，是温柔的清醒。',
  C: '生活有晴有雨，答案也会变化。',
  D: '故事很动人，愿你也有好结局。',
};
const resultCallouts: Record<Grade, string> = {
  A: '一点不烧心！',
  B: '烧就是烧，微烧什么意思？',
  C: '烧不烧看状态',
  D: '规矩没立好，烧起来了！',
};
const fireScale: Record<Grade, number> = { A: 0, B: 0.3, C: 0.62, D: 1 };
const displayResultName = (level: string) => level.replace(/^[A-D]级｜/, '');

function readHashResult(): Grade | null {
  const value = new URLSearchParams(window.location.hash.slice(1)).get('result');
  return value && grades.includes(value as Grade) ? (value as Grade) : null;
}

function trackQuizCompletion(attempt = 0) {
  if (window.umami?.track) {
    window.umami.track('quiz_completed');
  } else if (attempt < 20) {
    // 统计脚本若仍在加载，短暂等待；脚本被拦截时不影响测试流程。
    window.setTimeout(() => trackQuizCompletion(attempt + 1), 100);
  }
}

export default function App() {
  const initialShared = readHashResult();
  const [view, setView] = useState<View>(initialShared ? 'result' : 'home');
  const [grade, setGrade] = useState<Grade | null>(initialShared);
  const [isShared, setIsShared] = useState(Boolean(initialShared));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [burnScore, setBurnScore] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSaveHint, setShowSaveHint] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const transition = (next: View) => { setView(next); setTransitionKey((key) => key + 1); };

  useEffect(() => {
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    if (!websiteId) return;

    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = 'https://cloud.umami.is/script.js';
    analytics.dataset.websiteId = websiteId;
    analytics.dataset.autoTrack = 'false';
    document.head.appendChild(analytics);
    return () => analytics.remove();
  }, []);

  // 支持加载后手动修改哈希时同步切换到分享结果。
  useEffect(() => {
    const onHashChange = () => {
      const shared = readHashResult();
      if (shared) { setGrade(shared); setIsShared(true); transition('result'); }
      else if (isShared) { setIsShared(false); setGrade(null); transition('home'); }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [isShared]);

  const completeQuiz = (totalBurnScore: number) => {
    const winner = gradeFromBurnScore(totalBurnScore);
    setBurnScore(totalBurnScore); setGrade(winner); setIsShared(false);
    // 只统计完整答题次数，不附带答案或结果等级。
    trackQuizCompletion();
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#result=${winner}`);
    transition('result');
  };

  const chooseOption = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    window.setTimeout(() => {
      const selectedGrade = questions[questionIndex].options[optionIndex].score;
      const updated = burnScore + burnPoints[selectedGrade];
      if (questionIndex === questions.length - 1) completeQuiz(updated);
      else { setBurnScore(updated); setQuestionIndex((index) => index + 1); setSelectedOption(null); }
    }, 380);
  };

  const startQuiz = () => { setBurnScore(0); setQuestionIndex(0); setSelectedOption(null); transition('quiz'); };
  const reset = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setBurnScore(0); setGrade(null); setIsShared(false); setQuestionIndex(0); setSelectedOption(null); transition('home');
  };
  const saveImage = () => setShowSaveHint(true);
  const copyLink = async () => {
    const homeUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    try { await navigator.clipboard.writeText(homeUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { window.prompt('复制测试首页链接：', homeUrl); }
  };

  const progress = ((questionIndex + 1) / questions.length) * 100;
  const result = grade ? results[grade] : null;

  return (
    <main className="min-h-screen bg-[#fff5f8] px-4 py-6 text-[#171518] sm:py-12">
      <div key={transitionKey} className="animate-fade-in mx-auto w-full max-w-xl">
        {view === 'home' && <section className="relative overflow-hidden rounded-[28px] border border-[#f0e3e9] bg-white px-7 py-8 shadow-[0_12px_40px_rgba(38,20,30,0.045)] sm:px-12 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full border border-[#f7e4eb] sm:-right-24 sm:h-80 sm:w-80">
            <div className="absolute inset-5 rounded-full border border-[#f9edf1]" />
            <div className="absolute inset-10 rounded-full border border-dashed border-[#f8e8ee]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold tracking-[.3em] text-[#edc5d4]">TRUST / 13</span>
          </div>
          <div className="relative z-10">
            <div className="mb-10 flex items-center justify-between border-b border-[#f0e5e9] pb-4 text-[10px] font-semibold tracking-[.16em] text-[#938994]"><span>PERSONNEL / SOCIAL REVIEW</span><span className="font-mono">NO. 09—042</span></div>
            <p className="mb-4 text-[11px] font-bold tracking-[.24em] text-[#d65e8d]">社交风险评估 <span className="mx-1 text-[#d9b7c5]">/</span> PERSONALITY CHECK</p>
            <h1 className="max-w-sm text-[52px] font-black leading-[.98] tracking-[-.065em] text-[#171518] sm:text-[66px]">万物<br /><span className="text-[#e26c9a]">烧心测试</span></h1>
            <p className="mt-5 text-[17px] font-semibold tracking-[.08em] text-[#555057]">社交靠谱度背调报告</p>
            <div className="my-8 rounded-2xl bg-[#fff3f7] px-5 py-5 text-[14px] leading-7 text-[#514a50]"><span className="mb-2 block text-[10px] font-bold tracking-[.18em] text-[#d65e8d]">评估说明 <span className="text-[#c5a8b4]">/ PURPOSE</span></span>本次评估将从承诺、沟通、责任、预期管理等维度，鉴定你的社交烧心属性。</div>
            <div className="mb-8 grid grid-cols-3 divide-x divide-[#f0e5e9] rounded-2xl border border-[#f0e5e9] bg-white/70 py-4 text-center text-[10px] tracking-[.04em] text-[#89818a]"><div><b className="mb-1 block font-mono text-xl font-semibold tracking-normal text-[#171518]">{String(questions.length).padStart(2, '0')}</b>评估题目</div><div><b className="mb-1 block font-mono text-xl font-semibold tracking-normal text-[#171518]">04</b>风险等级</div><div><b className="mb-1 block font-mono text-xl font-semibold tracking-normal text-[#171518]">100%</b>主观判断</div></div>
            <button onClick={startQuiz} className="group flex w-full items-center justify-between rounded-full bg-[#171518] py-2 pl-6 pr-2 text-sm font-bold tracking-[.12em] text-white transition duration-200 hover:bg-[#3a3934] active:scale-[.99]"><span>开始背调</span><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ed83ad] text-lg transition-transform group-hover:translate-x-0.5">→</span></button>
            <p className="mt-5 text-center text-[9px] font-medium tracking-[.16em] text-[#a29aa1]">FOR ENTERTAINMENT PURPOSES ONLY</p>
          </div>
        </section>}

        {view === 'quiz' && <section className="relative overflow-hidden rounded-[28px] border border-[#f0e3e9] bg-white px-5 py-6 shadow-[0_12px_40px_rgba(38,20,30,0.045)] sm:px-10 sm:py-10">
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-[#f0e5e9] pb-5"><div><p className="font-mono text-[9px] tracking-[.16em] text-[#99919a]">SOCIAL RELIABILITY REVIEW</p><h2 className="mt-2 text-xl font-bold tracking-tight text-[#171518]">行为核验问卷</h2></div><span className="rounded-full bg-[#fff0f5] px-3 py-2 font-mono text-[12px] font-bold text-[#d65e8d]">{String(questionIndex + 1).padStart(2, '0')}<span className="text-[#cda8b7]"> / {String(questions.length).padStart(2, '0')}</span></span></div>
            <div className="mt-8 min-h-[112px]"><p className="mb-3 text-[10px] font-bold tracking-[.16em] text-[#d65e8d]">问题 {String(questionIndex + 1).padStart(2, '0')} <span className="ml-1 font-mono font-medium text-[#a49ba3]">/ CHECKPOINT</span></p><h3 className="text-[21px] font-bold leading-[1.65] tracking-[-.02em] text-[#201d21]">{questions[questionIndex].title}</h3></div>
            <div className="mt-5 space-y-3">{questions[questionIndex].options.map((option, index) => <button key={option.score} onClick={() => chooseOption(index)} className={`group flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left text-[14px] leading-6 transition duration-200 active:scale-[.99] ${selectedOption === index ? 'border-[#e681a7] bg-[#fff0f5]' : 'border-[#eee7eb] bg-white/75 hover:border-[#e7a9bf] hover:bg-[#fff7fa]'}`}><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold transition-colors ${selectedOption === index ? 'bg-[#e77ba2] text-white' : 'bg-[#f3eff2] text-[#827a83] group-hover:bg-[#fbe4ed] group-hover:text-[#bd4f7b]'}`}>{String.fromCharCode(65 + index)}</span><span className="pt-0.5 text-[#45433e]">{option.text}</span></button>)}</div>
            <div className="mt-8 border-t border-[#eee7eb] pt-5"><div className="mb-3 flex justify-between text-[10px] font-semibold tracking-[.08em] text-[#928a94]"><span>背调进度</span><span className="font-mono">{questionIndex + 1} / {questions.length}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#f2edf0]"><div className="h-full rounded-full bg-[#ed83ad] transition-all duration-500" style={{ width: `${progress}%` }} /></div><div aria-hidden="true" className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }}>{questions.map((_, index) => <span key={index} className={`h-1 rounded-full transition-colors duration-300 ${index < questionIndex ? 'bg-[#ed83ad]' : index === questionIndex ? 'bg-[#171518]' : 'bg-[#eee8ec]'}`} />)}</div></div>
          </div>
        </section>}

        {view === 'result' && result && grade && <>
          <div data-result-card className="mx-auto aspect-[9/16] w-full max-w-[390px] shadow-[0_6px_24px_rgba(36,32,24,0.055)]">
          <article data-result-card-inner style={{ gridTemplateRows: '22% 24% 10% 44%' }} className="grid h-full w-full overflow-hidden rounded-[20px] border border-[#ebe7dd] bg-[#f8f6f0] text-[#202326] [container-type:inline-size]">
            <div className="flex min-h-0 flex-col items-center overflow-hidden px-[4cqw] pt-[4cqw] text-center">
              <p className="shrink-0 text-[8.7cqw] font-black leading-none tracking-[-0.065em] text-[#202124]">PYROSIS</p>
              <p className="mt-[0.8cqw] shrink-0 text-[4.1cqw] font-black leading-tight tracking-[0.01em] text-[#d06435]">= FIRE IN THE CHEST?</p>
              <p className="mt-[1.7cqw] shrink-0 text-[2.7cqw] font-medium tracking-[0.16em] text-[#8e8c84]">社交靠谱度 · 结果画像</p>
              <div className="mt-[1cqw] flex min-h-0 flex-1 items-center justify-center px-[1cqw]">
                <p data-export-result-tag className="whitespace-nowrap text-[9.2cqw] font-black leading-none tracking-[-0.06em] text-[#ef7f9f]">
                  {result.tag}
                </p>
              </div>
            </div>
            <div className="relative mx-[3cqw] min-h-0 overflow-hidden">
              <HeartburnIllustration grade={grade} />
            </div>
            <div className="relative z-10 flex min-h-0 items-center justify-center overflow-hidden px-[2cqw]">
              <span data-export-callout style={{ fontSize: '6cqw' }} className="font-black leading-tight tracking-[-0.04em] text-black">
                “{resultCallouts[grade]}”
              </span>
            </div>
            <div className="grid min-h-0 overflow-hidden px-[5cqw] pb-[2cqw] pt-[1cqw]" style={{ gridTemplateRows: 'minmax(0, 1fr) auto' }}>
              <div className="flex min-h-0 flex-col overflow-hidden border-t border-[#e8e3d8] pt-[2cqw] text-center">
                <p className="shrink-0 text-[2.7cqw] font-semibold tracking-[0.14em] text-[#99958b]">你的社交烧心画像</p>
                <h2 className="mt-[1cqw] shrink-0 text-[5.4cqw] font-black leading-tight tracking-[-0.04em] text-[#242426]">{displayResultName(result.level)}</h2>
                <p className="mt-[2cqw] text-left text-[3.1cqw] leading-[1.5] text-[#4e4d49]">{result.description}</p>
                <p className="mt-[2cqw] shrink-0 text-[3.1cqw] italic leading-[1.4] text-[#8d887e]">“{resultQuotes[grade]}”</p>
                <p className="mt-[2cqw] border-t border-[#e8e3d8] pt-[2cqw] text-left text-[2.8cqw] leading-[1.45] text-[#77736a]">{result.remark}</p>
              </div>
              <div className="mt-[2cqw] flex shrink-0 items-end justify-between border-t border-dashed border-[#d9d2c5] pt-[2cqw]">
                <div className="space-y-[1cqw] font-mono text-[2cqw] tracking-[0.04em] text-[#9b978c]">
                  <p>HEARTBURN PERSONALITY TEST</p>
                  <p>仅供娱乐 · 请勿当真</p>
                </div>
                <div aria-label="当前结果分享二维码" className="aspect-square w-[18cqw] shrink-0 border border-[#d9d2c5] bg-white p-[1cqw]">
                  <QRCodeSVG className="block h-full w-full" value={`${window.location.origin}${window.location.pathname}${window.location.search}`} size={100} bgColor="#ffffff" fgColor="#171518" level="M" />
                </div>
              </div>
            </div>
          </article>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3"><button onClick={saveImage} className="rounded-full bg-[#171518] px-3 py-3.5 text-[12px] font-bold tracking-[.04em] text-[#fffdf7] transition hover:bg-[#353036] active:scale-[.99]">保存图片</button><button onClick={copyLink} className="rounded-full border border-[#f0dce5] bg-white px-3 py-3.5 text-[12px] font-bold tracking-[.04em] text-[#4c4942] transition hover:border-[#e7a0bb] hover:bg-[#fff7fa] active:scale-[.99]">{copied ? '已复制' : '复制分享链接'}</button>{isShared ? <button onClick={reset} className="col-span-2 rounded-full border border-[#f0c8d8] bg-[#fff0f5] px-3 py-3.5 text-[12px] font-bold tracking-[.04em] text-[#bd4f7b] transition hover:bg-[#fbe4ed] active:scale-[.99] sm:col-span-1">我也要测</button> : <button onClick={reset} className="col-span-2 rounded-full border border-[#f0dce5] bg-transparent px-3 py-3.5 text-[12px] font-bold tracking-[.04em] text-[#777268] transition hover:border-[#e7a0bb] hover:bg-white active:scale-[.99] sm:col-span-1">重新测试</button>}</div>
        </>}
      </div>
      <style>{`[data-result-card-inner],[data-result-card-inner] *{font-family:system-ui,sans-serif!important}@keyframes fade-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes stamp{0%{opacity:0;transform:translateY(-18px) rotate(-12deg) scale(1.2)}70%{opacity:1;transform:translateY(2px) rotate(-12deg) scale(.96)}100%{transform:translateY(0) rotate(-12deg) scale(1)}}.animate-fade-in{animation:fade-in .32s ease-out both}.animate-stamp{animation:stamp .55s cubic-bezier(.2,.75,.25,1) both}`}</style>
      {showSaveHint && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171518]/55 p-5" role="dialog" aria-modal="true" aria-labelledby="save-hint-title">
        <div className="w-full max-w-sm rounded-[24px] border border-[#f0e3e9] bg-[#fffdfb] px-6 py-7 text-center shadow-[0_24px_80px_rgba(23,21,24,0.2)]">
          <h2 id="save-hint-title" className="text-xl font-black tracking-tight text-[#171518]">📸 保存你的社交烧心画像</h2>
          <p className="mt-4 text-sm leading-7 text-[#625c60]">不同苹果机型浏览器内核存在差异，推荐直接手机截屏保存～😉</p>
          <button onClick={() => setShowSaveHint(false)} className="mt-6 w-full rounded-full bg-[#171518] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#353036] active:scale-[.99]">知道了</button>
        </div>
      </div>}
    </main>
  );
}

function HeartburnIllustration({ grade }: { grade: Grade }) {
  const flame = fireScale[grade];
  const face = {
    A: { brows: 'M143 108 Q153 103 163 108 M199 108 Q209 103 219 108', eyes: 'M146 119 Q155 130 164 119 M198 119 Q207 130 216 119', mouth: 'M160 149 Q181 171 202 149', mouthFill: 'none' },
    B: { brows: 'M143 111 Q153 104 164 111 M198 111 Q209 104 219 111', eyes: 'M147 120 Q155 116 164 121 M199 121 Q207 116 216 120', mouth: 'M164 154 Q181 149 199 154', mouthFill: 'none' },
    C: { brows: 'M141 108 Q153 93 165 108 M198 108 Q210 94 222 111', eyes: 'M146 119 Q155 130 164 117 M198 117 Q207 129 217 120', mouth: 'M160 153 Q181 134 203 153 Q181 174 160 153Z', mouthFill: '#6d352d' },
    D: { brows: 'M140 109 Q152 88 165 105 M198 105 Q211 87 224 109', eyes: 'M145 119 Q154 104 165 117 Q165 133 151 131 Q145 128 145 119Z M198 117 Q209 104 218 119 Q218 132 205 131 Q198 128 198 117Z', mouth: 'M157 151 Q171 137 183 147 Q197 135 207 152 Q207 172 183 175 Q160 172 157 151Z', mouthFill: '#6d352d' },
  }[grade];

  return (
    <svg viewBox="0 0 360 330" role="img" aria-label={`${displayResultName(results[grade].level)}的烧心表情插画`} className="absolute inset-0 h-full w-full -translate-y-[4cqw]">
      <path d="M49 328 C55 272 73 225 119 207 C140 199 156 195 180 194 C211 193 239 200 263 211 C305 230 318 276 323 330Z" fill="#438f8b" stroke="#47352a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M125 214 C138 247 154 266 179 269 C205 269 223 247 237 213" fill="none" stroke="#315f5d" strokeWidth="3" />
      <path d="M168 181 L168 211 Q181 225 198 211 L198 178" fill="#eaa176" stroke="#47352a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M116 104 C116 67 142 43 181 43 C222 43 245 72 244 112 L239 157 C236 189 215 211 181 212 C146 211 124 186 120 155Z" fill="#f1b27f" stroke="#47352a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M119 111 C104 109 103 93 107 80 C116 87 127 84 139 73 C150 61 155 52 158 43 C178 33 211 38 228 52 C243 64 251 83 246 108 C239 101 231 92 228 80 C217 95 198 92 183 81 C174 95 151 103 132 101Z" fill="#9a7047" stroke="#47352a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M120 119 C108 115 105 127 110 140 C113 149 120 151 125 145 M242 119 C255 114 260 128 254 141 C251 149 244 151 239 145" fill="#f1b27f" stroke="#47352a" strokeWidth="4" />
      <path d={face.brows} fill="none" stroke="#47352a" strokeWidth="5" strokeLinecap="round" />
      <path d={face.eyes} fill={grade === 'D' ? '#fff6e8' : 'none'} stroke="#47352a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {grade === 'D' && <path d="M153 118 Q156 115 159 118 M204 118 Q207 115 210 118" fill="none" stroke="#47352a" strokeWidth="3" strokeLinecap="round" />}
      <path d="M181 120 C177 133 170 140 174 144 Q179 148 187 144" fill="none" stroke="#8d523d" strokeWidth="3.5" strokeLinecap="round" />
      <path d={face.mouth} fill={face.mouthFill} stroke="#47352a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {grade !== 'A' && <>
        <path d="M82 111 C69 98 93 91 78 77 M278 116 C292 102 270 95 286 80" fill="none" stroke="#d9c9a9" strokeWidth="3" strokeLinecap="round" />
        <path d="M129 132 Q136 138 143 133 M219 133 Q226 138 233 132" fill="none" stroke="#d98173" strokeWidth={grade === 'D' ? 4 : 2.5} strokeLinecap="round" opacity={grade === 'D' ? 0.9 : 0.55} />
      </>}
      {grade === 'C' && <><path d="M239 111 C229 123 229 132 238 137 C247 132 247 123 239 111Z" fill="#73cce0" stroke="#fff8ec" strokeWidth="2" /><path d="M111 133 C104 143 105 150 112 153 C119 148 118 141 111 133Z" fill="#73cce0" stroke="#fff8ec" strokeWidth="2" /></>}
      {grade === 'D' && <><path d="M239 111 C228 125 229 135 239 140 C250 134 249 124 239 111Z" fill="#73cce0" stroke="#fff8ec" strokeWidth="2.5" /><path d="M111 114 C101 127 102 137 112 141 C122 135 120 125 111 114Z" fill="#73cce0" stroke="#fff8ec" strokeWidth="2.5" /><path d="M87 153 L77 160 M275 154 L286 162" stroke="#e65e52" strokeWidth="4" strokeLinecap="round" /></>}
      <path d="M80 330 C94 281 108 250 133 236 C148 254 164 265 181 264 C198 263 215 251 230 236 C255 250 272 283 282 330" fill="#438f8b" stroke="#47352a" strokeWidth="4" strokeLinejoin="round" />
      {grade !== 'A' && <g transform={`translate(185 292) scale(${flame}) translate(-185 -292)`}>
        <path d="M181 326 C151 309 159 282 176 267 C189 255 181 241 190 227 C202 243 199 254 209 266 C222 282 221 301 207 316 C200 324 190 327 181 326Z" fill="#e85c31" stroke="#b84e2e" strokeWidth="3" strokeLinejoin="round" />
        <path d="M183 316 C169 305 176 289 187 279 C194 272 192 265 196 257 C207 271 211 283 207 296 C204 307 195 315 183 316Z" fill="#f69b32" />
        <path d="M185 309 C179 301 185 292 192 287 C197 294 199 301 195 307Z" fill="#ffd66d" />
      </g>}
      {grade === 'A' ? (
        <path d="M87 270 C70 272 60 287 62 306 C64 321 78 329 98 325 L133 308 C142 304 139 296 131 296 L103 307 C101 291 96 275 87 270Z" fill="#f1b27f" stroke="#47352a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M86 281 C105 268 120 267 138 276 C147 281 151 291 146 297 C141 304 131 300 122 296 L105 291 C96 304 83 311 67 313" fill="#f1b27f" stroke="#47352a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M134 281 C151 274 162 275 170 281 C176 286 172 293 164 294 L145 295 M142 291 C156 285 169 287 177 293 C182 298 177 304 169 304 L145 301" fill="#f1b27f" stroke="#47352a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      <text x="190" y="302" textAnchor="middle" fontSize="30" fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">{{ A: '❤️', B: '💔', C: '❤️‍🔥', D: '🔥' }[grade]}</text>
    </svg>
  );
}
