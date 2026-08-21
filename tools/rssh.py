#!/usr/bin/env python
"""临时 SSH 工具：连接 106.54.44.45 执行 PowerShell 脚本（base64 传输，避免转义问题）。"""
import base64
import sys
import time
import paramiko

HOST = "106.54.44.45"
USER = "Administrator"
PASS = 'qwsdcv123!@#'
RETRIES = 8
RETRY_INTERVAL = 12  # 秒，避免高频连接触发 sshd 限流


def connect_once():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=22, username=USER, password=PASS,
                   timeout=15, banner_timeout=45, auth_timeout=30)
    return client


def connect():
    last_err = None
    for i in range(1, RETRIES + 1):
        try:
            return connect_once()
        except Exception as e:  # noqa: BLE001
            last_err = e
            print(f"[retry {i}/{RETRIES}] {type(e).__name__}: {e}", file=sys.stderr)
            if i < RETRIES:
                time.sleep(RETRY_INTERVAL)
    raise last_err


def run_ps(ps_script: str, timeout: int = 90) -> int:
    """在远端以 powershell -EncodedCommand 方式执行 PowerShell 脚本。"""
    b64 = base64.b64encode(ps_script.encode("utf-16-le")).decode("ascii")
    return run(f"powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand {b64}", timeout)


def run(cmd: str, timeout: int = 90) -> int:
    client = connect()
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    code = stdout.channel.recv_exit_status()
    client.close()
    if out.strip():
        print(out.rstrip())
    if err.strip():
        print("[stderr]", err.rstrip(), file=sys.stderr)
    print(f"[exit={code}]")
    return code


def sftp_put(local: str, remote: str) -> None:
    client = connect()
    sftp = client.open_sftp()
    sftp.put(local, remote)
    sftp.close()
    client.close()
    print(f"uploaded {local} -> {remote}")


if __name__ == "__main__":
    # 用法:
    #   python tools/rssh.py '<powershell 脚本>'
    #   python tools/rssh.py --cmd '<原始 cmd 命令>'
    #   python tools/rssh.py --put <本地文件> <远端路径>
    if len(sys.argv) > 2 and sys.argv[1] == "--cmd":
        sys.exit(run(sys.argv[2]))
    if len(sys.argv) > 3 and sys.argv[1] == "--put":
        sftp_put(sys.argv[2], sys.argv[3])
        sys.exit(0)
    script = sys.argv[1] if len(sys.argv) > 1 else "hostname"
    sys.exit(run_ps(script))
