'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

const initialDir = {
  home: {
    guest: {
      skills: {
        'frontend.txt': 'React, Next.js, Tailwind CSS',
        'backend.txt': 'Node.js, Express, MongoDB'
      },
      projects: {
        'portfolio.txt': 'My dev portfolio built with Next.js',
        'ai-helper.txt': 'An AI tool for language and interview prep'
      },
      about: {
        'bio.txt': 'Creative full-stack developer with a passion for design, AI, and interaction.'
      },
      education: {
        'college.txt': 'BTech in Computer Engineering from GEU'
      }
    }
  }
};

export default function CLIComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    'ParthOS 2.2',
    'ParthOS login: guest',
    'Password: ********',
    'Welcome to parthOS 2.2 (GNU/LINUX 19.4.7-pog armv12)',
    '****************************************',
    '* ./help for more on cmds              *',
    '* ./gui  for UI based portfolio        *',
    '****************************************',
    `Last Reboot: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    '999999 packages can be updated.',
    '1345 updates are security updates.',
    '29023 updates are useless updates.',
    '-1 updates will completely brick your system if installed.'
  ]);
  const [cwd, setCwd] = useState(['home', 'guest']);
  const [fs] = useState(initialDir);
  const cliRef = useRef(null);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollToBottom = () => {
    cliRef.current?.scrollTo({ top: cliRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [output]);

  const getDirContent = (pathArr) => {
    return pathArr.reduce((acc, dir) => acc?.[dir], fs);
  };

  const resolvePath = (dir) => {
    if (dir === '/') return [];
    if (dir === '..') return cwd.slice(0, -1);
    return [...cwd, dir];
  };

  const handleCommand = (cmd) => {
    const args = cmd.trim().split(' ');
    const command = args[0];
    const currentDir = getDirContent(cwd);
    let newOutput = [`guest@parthgupta:/${cwd.join('/')} $ ${cmd}`];

    switch (command) {
      case 'ls':
        newOutput.push(Object.keys(currentDir).join('  '));
        break;
      case 'cd': {
        const target = args[1];
        const newPath = resolvePath(target);
        const newDir = getDirContent(newPath);
        if (newDir) setCwd(newPath);
        else newOutput.push(`cd: ${target}: No such file or directory`);
        break;
      }
      case 'cat': {
        const file = args[1];
        const content = currentDir[file];
        if (typeof content === 'string') newOutput.push(content);
        else newOutput.push(`cat: ${file}: No such file`);
        break;
      }
      case 'help':
        newOutput.push('Available commands: ls, cd, cat, help, sudo');
        break;
      case 'sudo':
        newOutput.push('[sudo] password for guest: ********', 'Permission denied');
        break;
      case 'gui':
        window.location.href = '/';
        return;
      default:
        if (cmd.trim()) newOutput.push(`command not found: ${cmd}`);
        break;
    }
    setOutput(prev => [...prev, ...newOutput]);
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      if (commandHistory.length && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className={styles.cliWrapper} tabIndex={0} ref={cliRef}>
      <div className={styles.windowHeader}>
        <span></span><span></span><span></span>
      </div>
      {output.map((line, idx) => (
        <div key={idx} className={styles.line}>{line}</div>
      ))}
      <form className={styles.inputLine} onSubmit={handleSubmit}>
        <span className={styles.prompt}>guest@parthgupta:/{cwd.join('/')} $</span>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </form>
    </div>
  );
}
