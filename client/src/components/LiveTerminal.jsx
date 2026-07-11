import React, { useEffect, useRef, useState } from 'react';

const SCRIPTS = [
  {
    tab: 'bash',
    lines: [
      { type: 'cmd', text: 'npm install @kyyinfinite/baileys' },
      { type: 'ok', text: '✓ installed in 1.2s' },
      { type: 'cmd', text: 'node bot.js' },
      { type: 'info', text: 'socket connected, ready for pairing' },
    ],
  },
  {
    tab: 'bash',
    lines: [
      { type: 'cmd', text: 'git clone kyyinfinite/whatsapp-bot' },
      { type: 'cmd', text: 'cd whatsapp-bot && npm install' },
      { type: 'ok', text: '✓ 214 packages installed' },
      { type: 'cmd', text: 'pm2 start bot.js --name kyy-bot' },
      { type: 'info', text: 'kyy-bot online, pid 48213' },
    ],
  },
  {
    tab: 'bash',
    lines: [
      { type: 'cmd', text: 'npm install @kyyinfinite/lumina' },
      { type: 'ok', text: '✓ installed in 0.9s' },
      { type: 'cmd', text: 'node index.js' },
      { type: 'info', text: 'lumina toolkit ready, 42 modules loaded' },
    ],
  },
  {
    tab: 'bash',
    lines: [
      { type: 'cmd', text: 'vercel --prod' },
      { type: 'info', text: 'uploading build...' },
      { type: 'ok', text: '✓ deployed to kyyinfinite.my.id' },
    ],
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const LINE_STYLES = {
  cmd: { prefix: '$ ', className: 'text-zinc-400' },
  ok: { prefix: '', className: 'text-brand-light' },
  info: { prefix: '[kyyinfinite] ', className: 'text-zinc-500' },
};

export default function LiveTerminal() {
  const [tab, setTab] = useState(SCRIPTS[0].tab);
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState('');
  const [currentType, setCurrentType] = useState('cmd');
  const [visible, setVisible] = useState(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    let index = 0;

    async function run() {
      while (!cancelledRef.current) {
        const script = SCRIPTS[index % SCRIPTS.length];
        setTab(script.tab);
        setLines([]);
        setCurrent('');
        setVisible(true);

        for (const line of script.lines) {
          if (cancelledRef.current) return;
          setCurrentType(line.type);

          if (line.type === 'cmd') {
            let typed = '';
            for (const char of line.text) {
              if (cancelledRef.current) return;
              typed += char;
              setCurrent(typed);
              await sleep(24 + Math.random() * 28);
            }
            await sleep(220);
          } else {
            await sleep(380);
          }

          if (cancelledRef.current) return;
          setLines((previous) => [...previous, { type: line.type, text: line.text }]);
          setCurrent('');
        }

        await sleep(2400);
        if (cancelledRef.current) return;
        setVisible(false);
        await sleep(350);
        index += 1;
      }
    }

    run();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return (
    <div className="terminal-mockup max-w-2xl mx-auto text-left overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs text-zinc-500 font-mono-ui">{tab}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono-ui">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          live
        </span>
      </div>
      <div
        className={`p-5 font-mono-ui text-sm leading-relaxed min-h-[148px] transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {lines.map((line, index) => {
          const style = LINE_STYLES[line.type];
          return (
            <p key={index} className={`${style.className} mt-1 first:mt-0`}>
              {style.prefix}
              {line.text}
            </p>
          );
        })}
        {current && (
          <p className={`${LINE_STYLES[currentType].className} mt-1 first:mt-0`}>
            {LINE_STYLES[currentType].prefix}
            {current}
            <span className="terminal-cursor">▌</span>
          </p>
        )}
      </div>
    </div>
  );
}
