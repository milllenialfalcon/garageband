#!/usr/bin/env bash
# One-screen health view of the box: server, disk, memory, running agent processes.
export PATH="/opt/factory/bin:$HOME/.local/bin:/opt/npm-global/bin:$PATH"
echo "T3 server:   $(c=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:${T3CODE_PORT:-3773}/); [ "$c" != "000" ] && echo "up (HTTP $c)" || echo DOWN)"
echo "Disk:        $(df -h /workspace | awk 'NR==2{print $3" used of "$2}') (workspace), $(df -h "$HOME" | awk 'NR==2{print $3" used"}') (home)"
echo "Memory:      $(free -h | awk '/Mem:/{print $3" used of "$2}')"
echo "Agents:      $(pgrep -fc 'claude|codex|opencode|hermes' 2>/dev/null || echo 0) processes"
echo "Last server log lines:"
tail -n 5 "$HOME/.factory-box/logs/t3-serve.log" 2>/dev/null | sed 's/^/  /'
