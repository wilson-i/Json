document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('input');
    const jsonViewer = document.getElementById('json-viewer');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const toast = document.getElementById('toast');
    const expandAllBtn = document.getElementById('expandAllBtn');
    const collapseAllBtn = document.getElementById('collapseAllBtn');
    
    // 检查DOM元素是否存在
    const checkElements = [
        { name: 'input', element: input },
        { name: 'jsonViewer', element: jsonViewer },
        { name: 'formatBtn', element: formatBtn },
        { name: 'minifyBtn', element: minifyBtn },
        { name: 'copyBtn', element: copyBtn },
        { name: 'clearBtn', element: clearBtn },
        { name: 'toast', element: toast },
        { name: 'expandAllBtn', element: expandAllBtn },
        { name: 'collapseAllBtn', element: collapseAllBtn }
    ];
    
    let allElementsFound = true;
    checkElements.forEach(item => {
        if (!item.element) {
            console.error(`元素未找到: ${item.name}`);
            allElementsFound = false;
        } else {
            console.log(`元素已找到: ${item.name}`);
        }
    });
    
    if (!allElementsFound) {
        console.error('缺少必要的DOM元素，功能可能不正常');
    } else {
        console.log('所有DOM元素已找到，准备初始化功能');
    }
    
    // 测试函数：在json-viewer中显示简单文本
    function testJsonViewer() {
        if (jsonViewer) {
            const testContent = `
                <div class="test-message">
                    <h3>测试JSON显示区域</h3>
                    <p>如果您能看到此消息，说明JSON查看器DOM元素正常工作。</p>
                    <p>尝试输入有效的JSON并点击格式化按钮。</p>
                </div>
            `;
            jsonViewer.innerHTML = testContent;
            console.log('测试内容已添加到JSON查看器');
        }
    }
    
    // 执行测试
    testJsonViewer();
    
    // 自动调整高度
    function adjustHeight() {
        const container = document.getElementById('mainContainer');
        container.style.height = 'calc(100vh - 40px)';
    }
    
    adjustHeight();
    window.addEventListener('resize', adjustHeight);
    
    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // 显示消息提示
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
    
    // 折叠/展开功能
    function setupCollapsible(element) {
        if (element.classList.contains('collapsible')) {
            // 找到相邻元素
            let nextElement = element.nextElementSibling; // 应该是json-array或json-object
            let summaryElement = nextElement.nextElementSibling; // 应该是summary-badge
            let contentElement = summaryElement.nextElementSibling; // 应该是collapsible-content
            
            if (!contentElement || !contentElement.classList.contains('collapsible-content')) {
                console.error('无法找到折叠内容元素', element);
                return;
            }
            
            // 设置初始状态为展开
            element.textContent = '▼';
            contentElement.style.display = 'block';
            
            // 添加点击事件监听
            element.addEventListener('click', function() {
                if (contentElement.style.display === 'none') {
                    // 展开
                    this.textContent = '▼';
                    this.classList.remove('collapsed');
                    contentElement.style.display = 'block';
                } else {
                    // 折叠
                    this.textContent = '▶';
                    this.classList.add('collapsed');
                    contentElement.style.display = 'none';
                }
            });
        }
    }
    
    // 语法高亮和格式化
    function syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, undefined, 4);
        }
        
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    match = match.replace(/"/g, '').replace(/:$/, '');
                    return '<span class="' + cls + '">' + match + '</span>:';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    // 创建JSON视图，带缩进和折叠功能
    function createJsonView(json, initialLevel = 0) {
        try {
            console.log("开始格式化JSON:", typeof json);
            if (typeof json === 'string') {
                json = JSON.parse(json);
            }
            
            const result = processJsonNode(json, initialLevel);
            console.log("JSON格式化完成，生成HTML长度:", result.length);
            return result;
        } catch (e) {
            console.error("创建JSON视图出错:", e);
            return `<span class="json-error">Error: ${e.message}</span>`;
        }
    }
    
    function processJsonNode(node, level) {
        const indent = '    '.repeat(level);
        let html = '';
        
        if (Array.isArray(node)) {
            if (node.length === 0) {
                return '<span class="json-array">[]</span>';
            }
            
            // 简化HTML结构，解决层级嵌套问题
            html += '<span class="collapsible">▼</span>';
            html += '<span class="json-array">[</span>';
            html += '<span class="summary-badge">' + node.length + '项</span>';
            html += '<div class="collapsible-content">';
            
            node.forEach((item, index) => {
                html += '<div class="line-content">';
                html += '<span class="array-index">' + index + ':</span> ';
                
                if (typeof item === 'object' && item !== null) {
                    html += processJsonNode(item, level + 1);
                } else {
                    html += syntaxHighlight(JSON.stringify(item));
                }
                
                if (index < node.length - 1) {
                    html += ',';
                }
                html += '</div>';
            });
            
            html += '</div><span class="json-array">]</span>';
        } else if (typeof node === 'object' && node !== null) {
            const keys = Object.keys(node);
            
            if (keys.length === 0) {
                return '<span class="json-object">{}</span>';
            }
            
            // 提取最重要的键（优先显示常见重要字段如id、name等）
            const keyPreview = findImportantKeys(keys, node);
            
            // 简化HTML结构
            html += '<span class="collapsible">▼</span>';
            html += '<span class="json-object">{</span>';
            html += '<span class="summary-badge">' + keys.length + '属性 ' + keyPreview + '</span>';
            html += '<div class="collapsible-content">';
            
            keys.forEach((key, index) => {
                html += '<div class="line-content">';
                html += '<span class="json-key">' + key + '</span>: ';
                
                if (typeof node[key] === 'object' && node[key] !== null) {
                    html += processJsonNode(node[key], level + 1);
                } else {
                    html += syntaxHighlight(JSON.stringify(node[key]));
                }
                
                if (index < keys.length - 1) {
                    html += ',';
                }
                html += '</div>';
            });
            
            html += '</div><span class="json-object">}</span>';
        } else {
            html += syntaxHighlight(JSON.stringify(node));
        }
        
        return html;
    }
    
    // 查找对象中的重要键名，生成摘要
    function findImportantKeys(keys, obj) {
        // 优先显示的键名
        const priorityKeys = ['id', 'name', 'title', 'key', 'type', 'value', 'code'];
        
        // 首先寻找优先键
        for (const key of priorityKeys) {
            if (keys.includes(key) && obj[key] !== undefined && obj[key] !== null) {
                const value = typeof obj[key] === 'object' 
                    ? (Array.isArray(obj[key]) ? '[...]' : '{...}')
                    : JSON.stringify(obj[key]);
                return `"${key}": ${value}`;
            }
        }
        
        // 如果没有优先键，返回第一个键的信息
        if (keys.length > 0) {
            const firstKey = keys[0];
            const value = typeof obj[firstKey] === 'object'
                ? (Array.isArray(obj[firstKey]) ? '[...]' : '{...}')
                : JSON.stringify(obj[firstKey]);
            return `"${firstKey}": ${value}`;
        }
        
        return '';
    }
    
    // 处理输入
    function processInput() {
        try {
            let value = input.value.trim();
            console.log("处理输入:", value.length > 0 ? "有输入内容" : "无输入内容");
            
            if (!value) {
                jsonViewer.innerHTML = '';
                return;
            }
            
            try {
                console.log("开始解析JSON");
                // 尝试解析JSON，如果失败则显示错误
                const parsedJson = JSON.parse(value);
                console.log("JSON解析成功，类型:", Array.isArray(parsedJson) ? "数组" : typeof parsedJson);
                
                console.log("开始生成格式化HTML");
                const formattedHtml = createJsonView(parsedJson);
                
                if (!formattedHtml) {
                    console.error("生成的HTML为空");
                    jsonViewer.innerHTML = '<div class="json-error">生成的HTML为空</div>';
                    return;
                }
                
                console.log("HTML生成成功，长度:", formattedHtml.length);
                console.log("HTML前100个字符:", formattedHtml.substring(0, 100));
                
                // 淡入淡出效果
                jsonViewer.style.opacity = '0';
                setTimeout(() => {
                    console.log("设置jsonViewer内容");
                    jsonViewer.innerHTML = formattedHtml;
                    
                    // 给所有可折叠节点添加事件监听
                    const collapsibles = document.querySelectorAll('.collapsible');
                    console.log(`找到 ${collapsibles.length} 个可折叠节点`);
                    collapsibles.forEach(setupCollapsible);
                    
                    // 添加淡入效果
                    jsonViewer.style.transition = 'opacity 0.3s ease';
                    jsonViewer.style.opacity = '1';
                    console.log("格式化显示完成");
                }, 150);
            } catch (e) {
                console.error('处理JSON时出错:', e);
                jsonViewer.innerHTML = '<div class="json-error">格式化JSON出错: ' + e.message + '</div>';
            }
        } catch (e) {
            console.error('Invalid JSON:', e);
            jsonViewer.innerHTML = '<div class="json-error">无效的JSON: ' + e.message + '</div>';
        }
    }
    
    // 监听输入变化
    input.addEventListener('input', debounce(processInput, 300));
    
    // 格式化按钮
    formatBtn.addEventListener('click', function() {
        try {
            if (!input.value.trim()) {
                showToast('请先输入JSON数据');
                return;
            }
            
            const json = JSON.parse(input.value);
            input.value = JSON.stringify(json, null, 4);
            processInput();
            showToast('格式化成功');
            
            // 添加动画效果
            formatBtn.classList.add('btn-active');
            setTimeout(() => formatBtn.classList.remove('btn-active'), 300);
        } catch (e) {
            showToast('无效的JSON格式: ' + e.message);
        }
    });
    
    // 压缩按钮
    minifyBtn.addEventListener('click', function() {
        try {
            if (!input.value.trim()) {
                showToast('请先输入JSON数据');
                return;
            }
            
            const json = JSON.parse(input.value);
            input.value = JSON.stringify(json);
            processInput();
            showToast('压缩成功');
            
            // 添加动画效果
            minifyBtn.classList.add('btn-active');
            setTimeout(() => minifyBtn.classList.remove('btn-active'), 300);
        } catch (e) {
            showToast('无效的JSON格式: ' + e.message);
        }
    });
    
    // 复制按钮
    copyBtn.addEventListener('click', function() {
        if (!input.value.trim()) {
            showToast('没有内容可复制');
            return;
        }
        
        input.select();
        document.execCommand('copy');
        showToast('已复制到剪贴板');
        
        // 添加动画效果
        copyBtn.classList.add('btn-active');
        setTimeout(() => copyBtn.classList.remove('btn-active'), 300);
    });
    
    // 清除按钮
    clearBtn.addEventListener('click', function() {
        input.value = '';
        jsonViewer.innerHTML = '';
        showToast('已清除');
        
        // 添加动画效果
        clearBtn.classList.add('btn-active');
        setTimeout(() => clearBtn.classList.remove('btn-active'), 300);
    });
    
    // 展开所有节点
    if(expandAllBtn) {
        expandAllBtn.addEventListener('click', function() {
            const collapsibles = document.querySelectorAll('.collapsible.collapsed');
            if (collapsibles.length > 0) {
                collapsibles.forEach(item => item.click());
                showToast(`已展开 ${collapsibles.length} 个节点`);
            } else {
                showToast('没有可展开的节点');
            }
        });
    }
    
    // 折叠所有节点
    if(collapseAllBtn) {
        collapseAllBtn.addEventListener('click', function() {
            const collapsibles = document.querySelectorAll('.collapsible:not(.collapsed)');
            if (collapsibles.length > 0) {
                collapsibles.forEach(item => item.click());
                showToast(`已折叠 ${collapsibles.length} 个节点`);
            } else {
                showToast('没有可折叠的节点');
            }
        });
    }
    
    // 查找变量，加载初始示例
    function loadExample() {
        try {
            const exampleJson = {
                "name": "W-JSON Formatter",
                "version": "1.0",
                "description": "一个精美的JSON格式化工具",
                "features": [
                    "语法高亮",
                    "格式化",
                    "压缩",
                    "折叠/展开",
                    "主题切换"
                ],
                "settings": {
                    "theme": "light",
                    "autoFormat": true,
                    "indentation": 4
                },
                "stats": {
                    "users": 1000,
                    "ratings": 4.9,
                    "downloads": 5000
                }
            };
            
            input.value = JSON.stringify(exampleJson, null, 4);
            processInput();
        } catch (e) {
            console.error('Failed to load example:', e);
        }
    }
    
    // 检查是否有内容，如果没有，加载示例
    if (!input.value.trim()) {
        setTimeout(loadExample, 300);
    } else {
        processInput();
    }
});