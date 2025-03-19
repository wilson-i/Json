document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('input');
    const jsonViewer = document.getElementById('json-viewer');

    // 监听输入变化
    let formatTimer;
    input.addEventListener('input', () => {
        clearTimeout(formatTimer);
        formatTimer = setTimeout(() => {
            try {
                const json = JSON.parse(input.value);
                jsonViewer.innerHTML = createJsonView(json);
            } catch (e) {
                if (input.value.trim()) {
                    jsonViewer.innerHTML = `<span style="color: #f44336">错误：${e.message}</span>`;
                } else {
                    jsonViewer.innerHTML = '';
                }
            }
        }, 300);
    });

    // 创建可折叠的JSON视图
    function createJsonView(obj, level = 0) {
        const indent = '    '.repeat(level);
        let html = '';

        if (Array.isArray(obj)) {
            if (obj.length === 0) return indent + '<span class="json-array">[]</span>';
            
            html += indent + '<span class="json-array">[</span>';
            html += obj.map((item, i) => {
                const comma = i < obj.length - 1 ? ',' : '';
                const itemIndent = '\n' + indent + '    ';
                const hasItemChildren = Array.isArray(item) || (item !== null && typeof item === 'object');
                
                let itemHtml = itemIndent;
                if (hasItemChildren) {
                    itemHtml += '<span class="collapsible"></span>';
                    itemHtml += '<span class="line-content">';
                    itemHtml += `<span class="array-index">[${i}]</span> `;
                    itemHtml += createJsonView(item, level + 1).trim();
                    itemHtml += '</span>';
                    itemHtml += `<span class="collapsed-content" style="display: none"><span class="array-index">[${i}]</span> ${Array.isArray(item) ? '<span class="json-array">[...]</span>' : '<span class="json-object">{...}</span>'}</span>`;
                } else {
                    itemHtml += `<span class="array-index">[${i}]</span> `;
                    itemHtml += createJsonView(item, level + 1).trim();
                }
                return itemHtml + comma;
            }).join('') + '\n' + indent + '<span class="json-array">]</span>';
        } else if (obj !== null && typeof obj === 'object') {
            const keys = Object.keys(obj);
            if (keys.length === 0) return indent + '<span class="json-object">{}</span>';
            
            html += indent + '<span class="json-object">{</span>';
            html += keys.map((key, i) => {
                const comma = i < keys.length - 1 ? ',' : '';
                const value = obj[key];
                const itemIndent = '\n' + indent + '    ';
                const hasValueChildren = Array.isArray(value) || (value !== null && typeof value === 'object');
                
                let itemHtml = itemIndent;
                if (hasValueChildren) {
                    itemHtml += '<span class="collapsible"></span>';
                    itemHtml += '<span class="line-content">';
                    itemHtml += `<span class="json-key">"${key}"</span>: `;
                    itemHtml += createJsonView(value, level + 1).trim();
                    itemHtml += '</span>';
                    itemHtml += `<span class="collapsed-content" style="display: none"><span class="json-key">"${key}"</span>: ${Array.isArray(value) ? '<span class="json-array">[...]</span>' : '<span class="json-object">{...}</span>'}</span>`;
                } else {
                    itemHtml += `<span class="json-key">"${key}"</span>: ` + createJsonView(value, level + 1).trim();
                }
                return itemHtml + comma;
            }).join('') + '\n' + indent + '<span class="json-object">}</span>';
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

    // 处理折叠点击事件
    jsonViewer.addEventListener('click', (e) => {
        if (e.target.classList.contains('collapsible')) {
            e.target.classList.toggle('collapsed');
            const lineContent = e.target.nextElementSibling;
            const collapsedContent = lineContent.nextElementSibling;
            
            if (lineContent && lineContent.classList.contains('line-content')) {
                const isCollapsed = e.target.classList.contains('collapsed');
                lineContent.style.display = isCollapsed ? 'none' : 'inline';
                collapsedContent.style.display = isCollapsed ? 'inline' : 'none';
            }
        }
    });

    // HTML转义函数
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // 移除格式化按钮、主题切换和快捷键相关代码
});