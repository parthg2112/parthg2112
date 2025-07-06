'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

const initialDir = {
  home: {
    guest: {
      skills: {
        'frontend': 'React, Next.js, Tailwind CSS',
        'backend': 'SQLite3, Apache, Node.js, Flask'
      },
      projects: {
        'SAANai': 'A real-time AI tool that analyzes speech or writing to assess clarity, tone, and personality using the Big Five Model.',
        'MindMarket': 'AI-Powered Ad Targeting: An intelligent ad system that studies a user’s digital behavior searches, purchases, patterns, to recommend products with uncanny relevance.',
        'Portfolio': 'My dev portfolio built with Next.js'
      },
      about: {
        'bio': 'I am a creative technologist and developer who blends code with design.'
      },
      education: {
        'college': '2nd year BTech student in Information Technology from NMIMS with 9.13 CGPA'
      }
    }
  }
};

export default function CLIComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [isBooting, setIsBooting] = useState(true); // ADDED: State to manage boot sequence

  useEffect(() => {
    // FIXED: Boot sequence logic
    const welcomeLines = [
      'parthg OS v42.0 booting...',
      'user: guest',
      'access: granted // stay sharp',
      '> Welcome to kernel.parthg.me [Custom Kernel 404.yzy.szn]',
      '-----------------------------------------------',
      '| ./help — command list                        |',
      '| ./gui  — launch the visual interface         |',
      '-----------------------------------------------',
      `last boot: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < welcomeLines.length) {
        setOutput(prev => [...prev, welcomeLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsBooting(false); // End booting state
      }
    }, 400); // 200ms delay between lines

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  const [cwd, setCwd] = useState(['home', 'guest']);
  const [fs] = useState(initialDir);
  const cliRef = useRef(null);
  const inputRef = useRef(null);
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
    if (!dir) return cwd;
    if (dir === '/') return ['home', 'guest'];
    if (dir === '..') return cwd.length > 2 ? cwd.slice(0, -1) : cwd;
    
    // Handle absolute paths starting from /home/guest
    const absolutePath = dir.startsWith('/') ? dir.substring(1).split('/') : null;
    if (absolutePath) {
        if (absolutePath[0] === 'home' && absolutePath[1] === 'guest') {
            return absolutePath;
        } else {
            return null; // Invalid absolute path
        }
    }

    return [...cwd, dir];
  };

  const handleCommand = (cmd) => {
    const args = cmd.trim().split(' ');
    const command = args[0];
    const currentDir = getDirContent(cwd);
    let newOutput = [`guest@parthgupta:/${cwd.join('/')} $ ${cmd}`];

    switch (command) {
      case 'ls': {
        // FIXED: ls command to handle colored filenames
        const items = Object.keys(currentDir);
        if (items.length === 0) {
          newOutput.push('');
          break;
        }
        const lsOutput = (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {items.map(key => {
              const isFile = typeof currentDir[key] === 'string';
              return (
                <span key={key} className={isFile ? styles.lsFile : ''}>
                  {key}
                </span>
              );
            })}
          </div>
        );
        newOutput.push(lsOutput);
        break;
      }
      case 'cd': {
        const target = args[1];
        if (!target) break; // If no directory is specified, do nothing.
        const newPath = resolvePath(target);
        const newDir = getDirContent(newPath);
        if (newDir && typeof newDir === 'object') {
            setCwd(newPath);
        } else if (newDir) {
            newOutput.push(`cd: ${target}: Not a directory`);
        }
        else {
            newOutput.push(`cd: ${target}: No such file or directory`);
        }
        break;
      }
      case 'cat': {
        const file = args[1];
        const content = currentDir[file];
        if (typeof content === 'string') newOutput.push(<span className={styles.fileContent}>{content}</span>);
        else if (typeof content === 'object') newOutput.push(`cat: ${file}: Is a directory`);
        else newOutput.push(`cat: ${file}: No such file`);
        break;
      }
      case './help':
        newOutput.push('Available commands: ls, cd, cat, clear, sudo, ./help, ./gui');
        break;
      case 'sudo':
        newOutput.push('[sudo] password for guest: ********', 'Permission denied');
        break;
      case 'clear':
        setOutput([]); // Clear the output
        return; // Return early to prevent adding the command to the output
      case './gui':
        // <Link href="/"></Link>
        window.location.href = '/';
        return;
      case '': // Handle empty command
        break;
      default:
        if (cmd.trim()) newOutput.push(`command not found: ${cmd}`);
        break;
    }
    setOutput(prev => [...prev, ...newOutput]);
    if (cmd.trim()) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    setHistoryIndex(-1);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
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

  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className={styles.cliWrapper} tabIndex={0} ref={cliRef} onClick={handleWrapperClick}>
      <div className={styles.windowHeader}>
        <span></span><span></span><span></span>
      </div>
      {output.map((line, idx) => (
        <div key={idx} className={styles.line}>{line}</div>
      ))}
      {/* FIXED: Conditionally render the input form after booting is complete */}
      {!isBooting && (
        <form className={styles.inputLine} onSubmit={handleSubmit}>
          <span className={styles.prompt}>guest@parthgupta:/{cwd.join('/')} $</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      )}
    </div>
  );
}