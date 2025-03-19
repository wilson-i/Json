document.getElementById('formatBtn').addEventListener('click', formatJSON);
document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        formatJSON();
    }
});

function formatJSON() {
    const input = document.getElementById('input').value;
    const outputContainer = document.querySelector('#output code');
    
    try {
        const json = JSON.parse(input);
        const formatted = JSON.stringify(json, null, 2);
        outputContainer.textContent = formatted;
        Prism.highlightElement(outputContainer);
    } catch (e) {
        outputContainer.textContent = '无效的 JSON 数据：' + e.message;
    }
}