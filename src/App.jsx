import React, { useState, useRef, useEffect } from 'react';
import { TerminalSquare, FileText, ShieldAlert, Activity, Lock, Play, Database, UserX, MonitorPlay, WifiOff, Globe, Ban, KeyRound, CheckCircle, XCircle, Laptop, Smartphone } from 'lucide-react';

// --- 1. MENU DEFINITIONS ---
const LAB_TYPES = [
  { id: 'ransomware', title: 'Ransomware Lab', icon: <Lock className="text-red-500" size={32} />, difficulty: 'Hard', description: 'Investigate encrypted systems. Identify the malware strain and entry point.' },
  { id: 'phishing', title: 'Phishing Lab', icon: <ShieldAlert className="text-blue-500" size={32} />, difficulty: 'Easy', description: 'Analyze suspicious emails and fake domains targeting employees.' },
  { id: 'sqlinjection', title: 'Web Breach Lab', icon: <Database className="text-orange-500" size={32} />, difficulty: 'Medium', description: 'Web server compromised. Investigate database logs for injection attacks.' },
  { id: 'insider', title: 'Insider Threat Lab', icon: <UserX className="text-purple-500" size={32} />, difficulty: 'Hard', description: 'Data exfiltration detected. Find the rogue employee stealing secrets.' },
];

// --- 2. SCENARIO DATABASE ---
const SCENARIO_DB = {
  ransomware: [
    { title: 'Variant: WannaCry Legacy', description: 'Users report a red screen. SMB ports are open. The malware is spreading rapidly via the network.', mission: 'Identify the propagation method and isolate the infected host.', files: { 'READ_ME.txt': 'Send $300 to wallet 123xyz.', 'sys_logs.log': '[10:00] SMB v1 Connection Accepted from 192.168.1.55 (Spreading)' }, scannerOutput: "Scanning... [!] Port 445 (SMB): OPEN. Host 192.168.1.55 is propagating malware.", correctAction: 'ISOLATE_HOST', successMsg: "SUCCESS: Host 192.168.1.55 isolated. The spread of WannaCry has been stopped.", failMsg: "FAILURE: Blocking the IP didn't help; the worm is spreading via internal SMB." },
    { title: 'Variant: LockBit 3.0', description: 'HR Server encrypted. Malware entered via a fake resume PDF. No network spread detected yet.', mission: 'Isolate the infected machine before data exfiltration occurs.', files: { 'Restore_Files.txt': 'LOCKBIT 3.0.', 'process_list.txt': 'PID 999: Resume.pdf.exe' }, scannerOutput: "Scanning... [!] Suspicious Outbound Traffic to TOR Node.", correctAction: 'ISOLATE_HOST', successMsg: "SUCCESS: HR Server isolated. Data exfiltration to the dark web cut off.", failMsg: "FAILURE: Resetting passwords didn't stop the encryption process." },
    { title: 'Variant: BlackCat C2', description: 'Files are encrypted, but the malware is "calling home" to receive encryption keys. Cut the connection.', mission: 'Stop the malware from communicating with the Command & Control server.', files: { 'network_dump.pcap': 'DNS Query: api.evil-hacker.com (NXDOMAIN)', 'sys_logs.log': '[14:00] Encryptor waiting for server key...' }, scannerOutput: "Scanning... [!] High traffic to domain 'api.evil-hacker.com'. Malware is beaconing.", correctAction: 'BLOCK_DOMAIN', successMsg: "SUCCESS: Domain 'api.evil-hacker.com' blocked. Encryption process halted due to missing key.", failMsg: "FAILURE: Isolating the host was too slow; the key was already downloaded." }
  ],
  phishing: [
    { title: 'Variant: Mass Credential Harvest', description: 'ALERT: 47 Employees clicked a link in a "Payroll Update" email. Defenders must act fast.', mission: 'Prevent the attacker from using the stolen credentials.', files: { 'email_dump.eml': 'Subject: Payroll Update\nLink: http://payro11-update.com/login' }, scannerOutput: "Scanning... [!] 47 outbound connections to payro11-update.com established.", correctAction: 'RESET_CREDS', successMsg: "SUCCESS: All 47 compromised accounts have forced password resets. Attacker locked out.", failMsg: "FAILURE: Blocking the domain is too late; they already have the passwords!" },
    { title: 'Variant: Drive-By Download', description: 'An email prompted users to download a "Security Update". It contains a Trojan.', mission: 'Stop the download source.', files: { 'security_alert.eml': 'Link: http://microsft-verify.net/patch.exe' }, scannerOutput: "Scanning... [!] Domain 'microsft-verify.net' hosting malicious executable.", correctAction: 'BLOCK_DOMAIN', successMsg: "SUCCESS: Domain microsft-verify.net blocked. No further downloads possible.", failMsg: "FAILURE: Isolating one host didn't stop others from downloading the file." },
    { title: 'Variant: The "Invoice" Macro', description: 'Finance dept opened "Invoice_2024.doc". A malicious macro script is now running on Workstation-04.', mission: 'Contain the infected Finance Workstation.', files: { 'file_system.log': '[11:05] Invoice_2024.doc spawned cmd.exe (Macro Attack)' }, scannerOutput: "Scanning... [!] Workstation-04 executing unauthorized PowerShell scripts.", correctAction: 'ISOLATE_HOST', successMsg: "SUCCESS: Workstation-04 isolated. The macro script cannot reach the rest of the network.", failMsg: "FAILURE: Blocking the IP didn't stop the script running locally on the machine." }
  ],
  sqlinjection: [
    { title: 'Variant: Login Bypass', description: 'Attacker is using SQL Injection to bypass the admin login screen.', mission: 'Stop the active attack vector.', files: { 'access.log': 'POST /login user="admin" pass="\' OR 1=1; --"' }, scannerOutput: "Scanning... [!] SQL Injection pattern detected from IP 45.33.22.11.", correctAction: 'BLOCK_IP', successMsg: "SUCCESS: IP 45.33.22.11 blocked. Admin panel is secure.", failMsg: "FAILURE: Taking the database offline caused a business outage." },
    { title: 'Variant: UNION-Based Exfiltration', description: 'Customer credit card data is leaking. Logs show a UNION SELECT attack.', mission: 'Block the attacker stealing data.', files: { 'db_query.log': 'SELECT cc_num FROM payments UNION SELECT 1,2,3 --' }, scannerOutput: "Scanning... [!] Massive data egress to IP 198.51.100.22 via SQL query.", correctAction: 'BLOCK_IP', successMsg: "SUCCESS: Attacker IP 198.51.100.22 blocked. Data leak stopped.", failMsg: "FAILURE: Resetting passwords doesn't stop an active SQL connection." },
    { title: 'Variant: Destructive Attack', description: 'An attacker is attempting to delete the entire users database using SQL injection.', mission: 'Prevent the database destruction immediately.', files: { 'error_log.txt': 'Syntax Error: "; DROP TABLE users; --" near line 1' }, scannerOutput: "Scanning... [!] High-Risk Destructive SQL commands from IP 103.21.44.11.", correctAction: 'BLOCK_IP', successMsg: "SUCCESS: IP 103.21.44.11 blocked just in time. The database integrity is saved.", failMsg: "FAILURE: Revoking access failed because the attacker is external." }
  ],
  insider: [
    { title: 'Variant: The Night Shift', description: 'User "J.Smith" copied confidential blueprints to a USB drive at 3 AM.', mission: 'Neutralize the insider threat immediately.', files: { 'usb_logs.txt': '[03:15 AM] User "J.Smith" copied "Project_X.pdf"' }, scannerOutput: "Scanning... [!] User J.Smith currently active.", correctAction: 'REVOKE_ACCESS', successMsg: "SUCCESS: User J.Smith's account disabled. Security escorting him out.", failMsg: "FAILURE: Blocking the IP doesn't help; he is physically at the computer." },
    { title: 'Variant: Cloud Leak', description: 'User "M.Jones" is uploading 50GB of company data to a personal Google Drive.', mission: 'Stop the employee from exfiltrating data.', files: { 'dlp_logs.txt': '[14:00] Uploading "Client_List.xlsx" to drive.google.com' }, scannerOutput: "Scanning... [!] User M.Jones utilizing 90% of upload bandwidth.", correctAction: 'REVOKE_ACCESS', successMsg: "SUCCESS: Account M.Jones suspended. Upload session terminated.", failMsg: "FAILURE: Blocking the domain 'google.com' would stop the whole company from working." },
    { title: 'Variant: The Logic Bomb', description: 'A disgruntled admin "SysAdmin_Bob" wrote a script to delete all servers if he is fired.', mission: 'Detect and neutralize the malicious admin account.', files: { 'script_audit.log': 'User SysAdmin_Bob created "doom_switch.sh"' }, scannerOutput: "Scanning... [!] User SysAdmin_Bob scheduled a suspicious cron job for 5:00 PM.", correctAction: 'REVOKE_ACCESS', successMsg: "SUCCESS: SysAdmin_Bob's privileges revoked. The cron job has been cancelled.", failMsg: "FAILURE: Isolating the host doesn't stop the cron job if the user is still active." }
  ]
};

// --- 3. AVAILABLE ACTIONS ---
const RESPONSE_ACTIONS = [
  { id: 'ISOLATE_HOST', label: 'Isolate Host', icon: <WifiOff size={20}/>, color: 'hover:bg-red-600' },
  { id: 'BLOCK_IP', label: 'Block Source IP', icon: <Ban size={20}/>, color: 'hover:bg-orange-600' },
  { id: 'BLOCK_DOMAIN', label: 'Block Domain', icon: <Globe size={20}/>, color: 'hover:bg-blue-600' },
  { id: 'RESET_CREDS', label: 'Reset All Passwords', icon: <KeyRound size={20}/>, color: 'hover:bg-yellow-600' },
  { id: 'REVOKE_ACCESS', label: 'Revoke User ID', icon: <UserX size={20}/>, color: 'hover:bg-purple-600' },
];

function App() {
  const [currentView, setCurrentView] = useState('MENU');
  const [activeScenario, setActiveScenario] = useState(null);
  
  // New Startups States
  const [showSplash, setShowSplash] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Game States
  const [showTerminal, setShowTerminal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [resolution, setResolution] = useState(null);

  // Terminal Logic
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  // --- INITIAL CHECK: Splash & Mobile Detect ---
  useEffect(() => {
    // 1. Check Mobile
    const checkMobile = () => {
        if (window.innerWidth < 1024) setIsMobile(true);
        else setIsMobile(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 2. Splash Timer (3.5 Seconds cinematic intro)
    const splashTimer = setTimeout(() => {
        setShowSplash(false);
    }, 3500);

    return () => {
        window.removeEventListener('resize', checkMobile);
        clearTimeout(splashTimer);
    }
  }, []);

  const pickRandomScenario = (typeId) => {
    const variations = SCENARIO_DB[typeId];
    return variations[Math.floor(Math.random() * variations.length)];
  };

  const startScenario = (typeId) => {
    setHistory([]); setInput(""); setResolution(null);
    setShowTerminal(false); setShowDashboard(false); setShowMission(false);
    
    const selectedScenario = pickRandomScenario(typeId);
    setActiveScenario(selectedScenario);
    setCurrentView('BOOTING');

    setTimeout(() => {
      setCurrentView('DESKTOP');
      setHistory([`System Boot: ${selectedScenario.title}`, "Type 'help' to start."]);
      setShowTerminal(true);
    }, 4500);
  };

  const handleResponseAction = (actionId) => {
    if (actionId === activeScenario.correctAction) {
      setResolution({ status: 'SUCCESS', title: 'THREAT NEUTRALIZED', message: activeScenario.successMsg });
    } else {
      setResolution({ status: 'FAILURE', title: 'INCIDENT FAILED', message: activeScenario.failMsg || "Incorrect response. The threat persists." });
    }
  };

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();
      let response = "";
      const scenarioFiles = activeScenario ? activeScenario.files : {};

      if (cmd === 'help') response = "Commands: ls, cat <file>, scan_network, clear, exit";
      else if (cmd === 'ls') response = Object.keys(scenarioFiles).join('   ');
      else if (cmd.startsWith('cat ')) response = scenarioFiles[cmd.split(' ')[1]] || `File not found`;
      else if (cmd === 'scan_network') response = activeScenario.scannerOutput;
      else if (cmd === 'clear') { setHistory([]); setInput(""); return; }
      else if (cmd === 'exit') { setCurrentView('MENU'); setHistory([]); return; }
      else response = `Command not found: ${cmd}`;

      setHistory([...history, `analyst@vm:~$ ${cmd}`, response]);
      setInput("");
    }
  };

  const getDifficultyColor = (diff) => diff === 'Hard' ? 'text-red-500' : diff === 'Medium' ? 'text-orange-500' : 'text-green-500';
  const getBorderColor = (diff) => diff === 'Hard' ? 'hover:border-red-500' : diff === 'Medium' ? 'hover:border-orange-500' : 'hover:border-green-500';


  // --- VIEW 0: MOBILE BLOCKER ---
  if (isMobile) {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-8 text-center font-mono">
              <Smartphone className="text-red-500 mb-6" size={64} />
              <h1 className="text-2xl font-bold text-white mb-4">Desktop Environment Required</h1>
              <p className="text-slate-400 max-w-md">
                  The Cyber Range Simulator requires a physical keyboard and terminal interface. 
                  Please access this simulation on a <span className="text-green-500 font-bold">Laptop or PC</span>.
              </p>
              <div className="mt-8 flex gap-4 opacity-50">
                  <Laptop className="text-green-500" />
                  <span className="text-white">Supported</span>
              </div>
          </div>
      );
  }

  // --- VIEW 0.5: SPLASH SCREEN (NETFLIX STYLE) ---
  if (showSplash) {
      return (
          <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden relative">
              <div className="text-center z-10 animate-[ping_3s_ease-out_reverse]">
                  <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-800 scale-150 animate-[pulse_3s_ease-in-out]">
                      CYBER<br/>RANGE
                  </h1>
              </div>
              <div className="absolute bottom-10 text-slate-500 text-xs tracking-[0.5em] animate-pulse">
                  ESTABLISHING SECURE CONNECTION...
              </div>
          </div>
      );
  }

  // --- VIEW 1: MENU ---
  if (currentView === 'MENU') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-10 font-mono text-white overflow-y-auto">
        <h1 className="text-5xl font-bold text-green-500 mb-4 mt-10 tracking-widest">CYBER RANGE</h1>
        <p className="text-slate-400 mb-12 text-lg">Select a Training Module</p>
        <div className="grid grid-cols-2 gap-8 w-full max-w-5xl pb-10">
          {LAB_TYPES.map((lab) => (
            <div key={lab.id} onClick={() => startScenario(lab.id)} className={`border border-slate-700 bg-slate-900/40 p-8 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-slate-800 shadow-xl group ${getBorderColor(lab.difficulty)}`}>
              <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition">{lab.icon}</div><h2 className="text-2xl font-bold text-slate-200">{lab.title}</h2></div>
              <p className="text-slate-400 text-sm mb-6 h-12 leading-relaxed">{lab.description}</p>
              <div className={`flex justify-between items-center text-xs font-bold tracking-wider ${getDifficultyColor(lab.difficulty)}`}><span>DIFFICULTY: {lab.difficulty.toUpperCase()}</span><span className="flex items-center gap-2 group-hover:underline text-white bg-slate-700 px-3 py-1 rounded">LAUNCH <MonitorPlay size={14}/></span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: BOOTING (Updated with "Call to Action") ---
  if (currentView === 'BOOTING') {
    return (
      <div className="h-screen w-screen bg-black text-green-500 font-mono flex flex-col items-center justify-center relative p-20">
        <div className="z-10 text-center space-y-6 max-w-4xl">
            {/* Blinking Status */}
            <div className="text-xl text-red-500 uppercase tracking-[0.3em] animate-pulse font-bold">⚠️ Incoming Incident Report ⚠️</div>
            
            {/* Scenario Title */}
            <h1 className="text-5xl font-bold text-white border-b-2 border-red-600 pb-4 inline-block">{activeScenario.title}</h1>
            
            {/* The Scenario & The Question */}
            <div className="bg-slate-900/90 border border-slate-600 p-8 rounded-lg text-left mt-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-600"></div>
                <h3 className="text-slate-400 font-bold mb-2 uppercase text-xs tracking-wider">SITUATION REPORT:</h3>
                <p className="text-2xl text-white leading-relaxed mb-8 font-light">"{activeScenario.description}"</p>
                <div className="bg-black/50 p-4 rounded border border-yellow-600/50 flex items-start gap-3">
                    <Activity className="text-yellow-500 shrink-0 mt-1" size={24} />
                    <div>
                        <h4 className="text-yellow-500 font-bold uppercase text-sm tracking-wider mb-1">Your Objective:</h4>
                        <p className="text-lg text-slate-200 font-bold">Based on the evidence, identify the threat and execute the appropriate defensive protocol. What is the correct response step?</p>
                    </div>
                </div>
            </div>

            <div className="text-sm text-slate-500 pt-6 font-mono space-y-1">
                <p>{'>'} Decrypting intelligence report...</p>
                <p>{'>'} Establishing secure link to SOC Dashboard...</p>
                <p>{'>'} Loading containment protocols...</p>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-900"><div className="h-full bg-red-600 animate-[width_5.5s_ease-in-out_forwards]" style={{width: '0%'}}></div></div>
      </div>
    );
  }

  // --- VIEW 3: DESKTOP ---
  return (
    <div className="h-screen w-screen bg-slate-900 text-white relative font-mono overflow-hidden">
      {/* Top Bar */}
      <div className="w-full bg-slate-800 p-2 border-b border-slate-700 flex justify-between items-center shadow-lg z-50 relative">
        <div className="flex items-center gap-2 px-4"><span className="font-bold text-red-500 uppercase tracking-widest animate-pulse">ACTIVE INCIDENT: {activeScenario.title}</span></div>
        <button onClick={() => { setCurrentView('MENU'); setHistory([]); }} className="text-xs bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-white font-bold mr-4 transition">ABORT MISSION</button>
      </div>

      {/* Desktop Icons */}
      <div className="p-8 grid grid-cols-1 gap-8 w-32 absolute top-12 left-0 z-0">
        <div onClick={() => setShowTerminal(true)} className="flex flex-col items-center cursor-pointer hover:bg-white/5 p-4 rounded-lg transition duration-200"><TerminalSquare size={48} className="text-slate-300" /><span className="text-xs mt-3 font-bold text-slate-300">Terminal</span></div>
        <div onClick={() => setShowMission(true)} className="flex flex-col items-center cursor-pointer hover:bg-white/5 p-4 rounded-lg transition duration-200"><FileText size={48} className="text-yellow-500" /><span className="text-xs mt-3 font-bold text-slate-300">Briefing</span></div>
        <div onClick={() => setShowDashboard(true)} className="flex flex-col items-center cursor-pointer hover:bg-white/5 p-4 rounded-lg transition duration-200"><Activity size={48} className="text-blue-500" /><span className="text-xs mt-3 font-bold text-slate-300">Net Defense</span></div>
      </div>

      {/* Mission Popup */}
      {showMission && (
        <div className="absolute top-1/4 left-1/3 w-[500px] bg-yellow-50 p-6 rounded shadow-2xl text-black z-50 border-l-8 border-yellow-500 animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-bold mb-2 uppercase flex items-center gap-2"><FileText size={20}/> Mission Orders</h2>
            <p className="mb-4 text-sm leading-relaxed">{activeScenario.description}</p>
            <div className="bg-yellow-200 p-3 rounded text-sm font-bold border border-yellow-400 shadow-sm">OBJECTIVE: {activeScenario.mission}</div>
            <button onClick={() => setShowMission(false)} className="mt-6 text-xs font-bold text-slate-500 hover:text-black uppercase tracking-wide">Close Briefing</button>
        </div>
      )}

      {/* Terminal Window */}
      {showTerminal && (
        <div className="absolute top-20 left-[30%] w-[700px] h-[500px] shadow-2xl rounded-lg border border-slate-600 bg-black/95 backdrop-blur z-10 flex flex-col ring-1 ring-white/10">
          <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700 cursor-move select-none"><span className="text-xs text-slate-300 ml-2 font-bold">sysadmin@lab-vm:~</span><div className="flex gap-2 mr-2"><div className="w-3 h-3 rounded-full bg-red-500 cursor-pointer hover:bg-red-400" onClick={() => setShowTerminal(false)}></div></div></div>
          <div className="flex-1 p-4 overflow-y-auto text-sm" onClick={() => document.getElementById('cmdInput')?.focus()}>
            {history.map((line, i) => <div key={i} className="mb-1 text-green-400 font-medium whitespace-pre-wrap">{line}</div>)}
            <div className="flex items-center text-green-400 font-medium"><span className="mr-2">sysadmin@vm:~$</span><input id="cmdInput" type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleCommand} className="bg-transparent outline-none flex-1 text-green-400" autoFocus autoComplete="off"/></div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* --- DASHBOARD WITH RESPONSE ACTIONS --- */}
      {showDashboard && (
        <div className="absolute top-10 left-[15%] w-[900px] h-[600px] shadow-2xl rounded bg-slate-900 border border-slate-700 z-20 flex flex-col ring-1 ring-white/10">
            {/* Header */}
            <div className="bg-slate-800 p-3 flex justify-between border-b border-blue-500/30">
                <span className="font-bold text-sm text-blue-100 flex items-center gap-2"><Activity size={16}/> Net Defense Console</span>
                <button onClick={() => setShowDashboard(false)} className="text-slate-400 hover:text-white">Close</button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Logs */}
                <div className="w-1/2 p-6 border-r border-slate-700 bg-slate-900/50">
                    <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-wider">Live Telemetry</h3>
                    <div className="font-mono text-xs space-y-3 bg-black/40 p-4 rounded border border-slate-800 h-[450px] overflow-y-auto">
                        <p className="text-green-500">[SYSTEM] Defense Agents Online...</p>
                        <p className="text-slate-300">[LOGS] Monitoring traffic on Port 80, 443, 445...</p>
                        <p className="text-red-400">[ALERT] {activeScenario.title} signature detected.</p>
                        {activeScenario.scannerOutput && <p className="text-yellow-500">{activeScenario.scannerOutput}</p>}
                        <p className="text-slate-500 animate-pulse">... Awaiting Analyst Response ...</p>
                    </div>
                </div>

                {/* Right Panel: ACTION BUTTONS */}
                <div className="w-1/2 p-6 bg-slate-800/30">
                    <h3 className="font-bold text-slate-400 mb-4 text-xs uppercase tracking-wider">Response Actions</h3>
                    <p className="text-xs text-slate-500 mb-6">Select the appropriate containment strategy based on your investigation.</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                        {RESPONSE_ACTIONS.map((action) => (
                            <button 
                                key={action.id}
                                onClick={() => handleResponseAction(action.id)}
                                className={`flex items-center gap-3 p-4 rounded bg-slate-800 border border-slate-600 transition-all ${action.color} hover:border-white hover:text-white group text-left`}
                            >
                                <div className="p-2 bg-slate-900 rounded group-hover:bg-transparent">{action.icon}</div>
                                <div>
                                    <div className="font-bold text-sm text-slate-200">{action.label}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Execute Protocol {action.id.split('_')[0]}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* RESOLUTION OVERLAY (WIN/LOSS SCREEN) */}
            {resolution && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
                    {resolution.status === 'SUCCESS' ? <CheckCircle size={80} className="text-green-500 mb-4"/> : <XCircle size={80} className="text-red-500 mb-4"/>}
                    <h2 className={`text-3xl font-bold mb-2 ${resolution.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>{resolution.title}</h2>
                    <p className="text-xl text-slate-300 mb-8 max-w-lg">{resolution.message}</p>
                    <div className="flex gap-4">
                        <button onClick={() => setResolution(null)} className="px-6 py-2 border border-slate-500 text-slate-300 rounded hover:bg-slate-800">Review Logs</button>
                        <button onClick={() => { setCurrentView('MENU'); setResolution(null); }} className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200">Return to Menu</button>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default App;