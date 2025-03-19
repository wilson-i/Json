document.getElementById('formatBtn').addEventListener('click', () => {
  const input = document.getElementById('input').value;
  const output = document.getElementById('output');
  
  try {
    const json = JSON.parse(input);
    const formatted = JSON.stringify(json, null, 2);
    output.textContent = formatted;
  } catch (e) {
    output.textContent = '无效的 JSON 数据：' + e.message;
    output.style.color = '#ff6b6b';
  }
});

// 添加快捷键支持
document.getElementById('input').addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    document.getElementById('formatBtn').click();
  }
});

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.scripting.executeScript({
    target: {tabId: tabs[0].id},
    function: formatJSON
  });
});

function formatJSON() {
  const pre = document.querySelector('pre');
  if (!pre) return;
  
  try {
    const text = pre.textContent;
    const json = JSON.parse(text);
    const formatted = JSON.stringify(json, null, 2);
    pre.innerHTML = '';
    pre.appendChild(document.createTextNode(formatted));
  } catch (e) {
    console.error('Invalid JSON');
  }
}