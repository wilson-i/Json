document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('input');
    const jsonViewer = document.getElementById('json-viewer');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');

    // 监听输入变化
    let formatTimer;
    input.addEventListener('input', () => {
        clearTimeout(formatTimer);
        formatTimer = setTimeout(() => {
            try {
                const json = JSON.parse(input.value);
                jsonViewer.innerHTML = createJsonView(json);
                // 添加折叠/展开功能
                setupCollapsible();
            } catch (e) {
                if (input.value.trim()) {
                    jsonViewer.innerHTML = `<span style="color: #f44336">错误：${e.message}</span>`;
                } else {
                    jsonViewer.innerHTML = '';
                }
            }
        }, 300);
    });

    // 创建可折叠的JSON视图，改进显示格式
    function createJsonView(obj, level = 0) {
        const indent = '    '.repeat(level);
        let html = '';

        if (Array.isArray(obj)) {
            if (obj.length === 0) return `<span class="json-array">[]</span>`;
            
            html += `<span class="json-array">[</span>`;
            if (obj.length > 0) {
                html += `<span class="collapsible"></span>`;
                html += `<div class="collapsible-content">`;
            }
            
            html += obj.map((item, i) => {
                const comma = i < obj.length - 1 ? ',' : '';
                const hasChildren = Array.isArray(item) || (item !== null && typeof item === 'object' && Object.keys(item).length > 0);
                
                let itemHtml = `<div class="array-item" style="padding-left: ${20}px">`;
                if (hasChildren) {
                    itemHtml += `<span class="array-index">${i}:</span> `;
                    itemHtml += createJsonView(item, level + 1);
                } else {
                    itemHtml += `<span class="array-index">${i}:</span> `;
                    itemHtml += createJsonView(item, level + 1);
                }
                return itemHtml + comma + '</div>';
            }).join('');
            
            if (obj.length > 0) {
                html += `</div>`;
            }
            
            html += `<span class="json-array">]</span>`;
        } else if (obj !== null && typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) return `<span class="json-object">{}</span>`;
            
            html += `<span class="json-object">{</span>`;
            if (keys.length > 0) {
                html += `<span class="collapsible"></span>`;
                html += `<div class="collapsible-content">`;
            }
            
            html += keys.map((key, i) => {
                const comma = i < keys.length - 1 ? ',' : '';
                const value = obj[key];
                const hasChildren = Array.isArray(value) || (value !== null && typeof value === 'object' && Object.keys(value).length > 0);
                
                let itemHtml = `<div class="object-item" style="padding-left: ${20}px">`;
                itemHtml += `<span class="json-key">"${key}"</span>: `;
                
                if (hasChildren) {
                    itemHtml += createJsonView(value, level + 1);
                } else {
                    itemHtml += createJsonView(value, level + 1);
                }
                
                return itemHtml + comma + '</div>';
            }).join('');
            
            if (keys.length > 0) {
                html += `</div>`;
            }
            
            html += `<span class="json-object">}</span>`;
        } else if (typeof obj === 'string') {
            html += `<span class="json-string">"${escapeHtml(obj)}"</span>`;
        } else if (typeof obj === 'number') {
            html += `<span class="json-number">${obj}</span>`;
        } else if (typeof obj === 'boolean') {
            html += `<span class="json-boolean">${obj}</span>`;
        } else if (obj === null) {
            html += `<span class="json-null">null</span>`;
        }

        return html;
    }

    // 设置折叠/展开功能
    function setupCollapsible() {
        const collapsibles = document.querySelectorAll('.collapsible');
        collapsibles.forEach(collapsible => {
            collapsible.innerHTML = '▼';
            collapsible.addEventListener('click', function() {
                this.classList.toggle('collapsed');
                const content = this.nextElementSibling;
                
                if (this.classList.contains('collapsed')) {
                    this.innerHTML = '▶';
                    content.style.display = 'none';
                } else {
                    this.innerHTML = '▼';
                    content.style.display = 'block';
                }
            });
        });
    }

    // HTML转义函数
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 添加控制按钮的事件监听
    formatBtn.addEventListener('click', function() {
        try {
            const json = JSON.parse(input.value);
            input.value = JSON.stringify(json, null, 4);
            processInput();
        } catch (e) {
            // 如果解析失败，不改变内容
            console.error('Invalid JSON:', e);
        }
    });
    
    minifyBtn.addEventListener('click', function() {
        try {
            const json = JSON.parse(input.value);
            input.value = JSON.stringify(json);
            processInput();
        } catch (e) {
            // 如果解析失败，不改变内容
            console.error('Invalid JSON:', e);
        }
    });
    
    copyBtn.addEventListener('click', function() {
        input.select();
        document.execCommand('copy');
    });
    
    clearBtn.addEventListener('click', function() {
        input.value = '';
        document.getElementById('json-viewer').innerHTML = '';
    });
});