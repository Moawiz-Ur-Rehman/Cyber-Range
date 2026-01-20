# 🛡️ Cyber Range Simulator

![Status](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge)
![Tech](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tech](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

> **A browser-based Security Operations Center (SOC) simulation environment.** > *Analyze logs. Hunt threats. Execute containment protocols.*

---

## 🎮 Live Demo
https://cyber-range-orcin.vercel.app/
---

## ⚡ Interactive Features

### 🖥️ Virtual Desktop Interface
* **Functional Terminal:** Execute commands like `ls`, `cat`, `grep`, and `scan_network`.
* **Dynamic File System:** Files change based on the active scenario.
* **SOC Dashboard:** A visual interface to monitor threats and execute response actions (Block IP, Isolate Host, etc.).

### 🎲 Randomized Scenarios
Every time you launch a lab, the simulation engine picks a random variant. You cannot memorize the answers!

| Lab Type | Difficulty | Mission Objective |
| :--- | :--- | :--- |
| **Ransomware** | 🔴 Hard | Identify the malware strain (WannaCry, LockBit) and stop propagation. |
| **Phishing** | 🟢 Easy | Analyze email headers to find the malicious domain or payload. |
| **SQL Injection** | 🟠 Medium | Detect database breaches and block the attacker's IP. |
| **Insider Threat** | 🔴 Hard | Catch the rogue employee stealing data during off-hours. |

---

## 🕵️‍♂️ Analyst Training Guide (Spoilers!)

<details>
<summary><strong>CLICK TO REVEAL: Ransomware Response Guide</strong></summary>

1. **Investigation:** Run `scan_network` to see open ports.
2. **Analysis:** Check `sys_logs.log` for suspicious process creation.
3. **Action:** If spreading via SMB (Port 445), use **Isolate Host**. If communicating with a server, use **Block Domain**.
</details>

<details>
<summary><strong>CLICK TO REVEAL: Phishing Response Guide</strong></summary>

1. **Investigation:** Read the email using `cat email_dump.eml`.
2. **Analysis:** Look for typos (e.g., `micros0ft.com`).
3. **Action:** If many users clicked, **Reset Credentials**. If it's a malware link, **Block Domain**.
</details>

<details>
<summary><strong>CLICK TO REVEAL: Insider Threat Guide</strong></summary>

1. **Investigation:** Check `usb_logs.txt` or upload logs.
2. **Analysis:** Compare timestamps with shift hours (e.g., activity at 3 AM).
3. **Action:** Immediately **Revoke User Access**.
</details>

---

## 🚀 One-Click Deploy
Want to run your own version of this simulator? Click below to deploy it to Vercel in 1 minute.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Moawiz-Ur-Rehman/Cyber-Range)

---

## 💻 Local Installation

1. **Clone the repo**
   ```bash
   git clone [https://github.com/Moawiz-Ur-Rehman/Cyber-Range.git](https://github.com/Moawiz-Ur-Rehman/Cyber-Range.git)
2. **Install dependencies**
   ```bash
   npm install
3. **Start the simulator**
   ```bash
   npm run dev   