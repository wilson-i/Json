document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('input');
    const jsonViewer = document.getElementById('json-viewer');
    const toast = document.getElementById('toast');
    const toggleAllBtn = document.getElementById('toggleAllBtn');
    const historyBtn = document.getElementById('historyBtn');
    
    // 检查DOM元素是否存在
    const checkElements = [
        { name: 'input', element: input },
        { name: 'jsonViewer', element: jsonViewer },
        { name: 'toast', element: toast },
        { name: 'toggleAllBtn', element: toggleAllBtn }
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
        if (!element || !element.classList.contains('collapsible')) {
            return;
        }
        
        try {
            // 找到包装器元素
            const wrapper = element.closest('.collapsible-wrapper');
            if (!wrapper) {
                console.error('找不到collapsible-wrapper元素', element);
                return;
            }
            
            // 查找json-node父元素和collapsible-content兄弟元素
            const parentNode = wrapper.closest('.json-node');
            if (!parentNode) {
                console.error('找不到json-node父元素', element);
                return;
            }
            
            // 查找summary-badge元素（简介内容）
            const summaryBadge = parentNode.querySelector('.summary-badge');
            if (!summaryBadge) {
                console.error('找不到summary-badge元素', element);
            }
            
            // collapsible-content应该是json-node的下一个兄弟元素
            const contentElement = parentNode.nextElementSibling;
            if (!contentElement || !contentElement.classList.contains('collapsible-content')) {
                console.error('无法找到折叠内容元素', element);
                return;
            }
            
            // 设置初始状态为展开
            element.textContent = '▼';
            element.classList.remove('collapsed');
            contentElement.style.display = 'block';
            
            // 确保简介内容初始状态是隐藏的（因为默认展开）
            if (summaryBadge) {
                summaryBadge.style.display = 'none';
            }
            
            // 使用包装器处理点击事件，增大可点击区域
            wrapper.onclick = function(e) {
                // 阻止事件冒泡，防止触发父元素事件
                e.stopPropagation();
                e.preventDefault();
                
                // 防止快速连续点击
                if (this.dataset.processing === 'true') {
                    return;
                }
                
                this.dataset.processing = 'true';
                
                if (contentElement.style.display === 'none') {
                    // 展开
                    element.textContent = '▼';
                    element.classList.remove('collapsed');
                    contentElement.style.display = 'block';
                    
                    // 展开时隐藏简介内容
                    if (summaryBadge) {
                        summaryBadge.style.display = 'none';
                    }
                    
                    // 添加极短延迟，避免抖动
                    setTimeout(() => {
                        this.dataset.processing = 'false';
                    }, 100);
                } else {
                    // 折叠
                    element.textContent = '▶';
                    element.classList.add('collapsed');
                    contentElement.style.display = 'none';
                    
                    // 折叠时显示简介内容
                    if (summaryBadge) {
                        summaryBadge.style.display = 'inline-flex';
                    }
                    
                    // 添加极短延迟，避免抖动
                    setTimeout(() => {
                        this.dataset.processing = 'false';
                    }, 100);
                }
            };
        } catch (err) {
            console.error('设置折叠功能时出错:', err);
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
            
            // 改进HTML结构，增加更大的点击区域
            html += '<span class="json-node">';
            // 包裹折叠按钮，提供更大的可点击区域
            html += '<span class="collapsible-wrapper"><span class="collapsible">▼</span></span>';
            html += '<span class="json-array">[</span>';
            
            // 添加简介内容，初始隐藏，折叠时显示
            if (node.length > 0) {
                html += '<span class="summary-badge">' + 
                    '<span class="badge-count">' + node.length + '</span>' + 
                    '<span class="badge-type">项</span>' + 
                '</span>';
            }
            
            html += '</span>';  // 结束json-node
            
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
            
            // 改进HTML结构，增加更大的点击区域
            html += '<span class="json-node">';
            // 包裹折叠按钮，提供更大的可点击区域
            html += '<span class="collapsible-wrapper"><span class="collapsible">▼</span></span>';
            html += '<span class="json-object">{</span>';
            
            // 添加简介内容，初始隐藏，折叠时显示
            if (keys.length > 0) {
                html += '<span class="summary-badge">' + 
                    '<span class="badge-count">' + keys.length + '</span>' + 
                    '<span class="badge-type">属性</span>' + 
                '</span>';
            }
            
            html += '</span>';  // 结束json-node
            
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
    
    // 保存JSON到历史记录
    function saveToHistory(jsonString) {
        try {
            // 从localStorage获取现有历史记录
            let history = JSON.parse(localStorage.getItem('jsonFormatterHistory')) || [];
            
            // 检查是否已存在相同内容的记录
            const existingIndex = history.findIndex(item => item.content === jsonString);
            
            // 如果存在相同内容的记录，先删除旧记录
            if (existingIndex !== -1) {
                console.log('发现重复内容，删除旧记录');
                history.splice(existingIndex, 1);
            }
            
            // 创建新的历史记录项
            const historyItem = {
                id: Date.now().toString(), // 使用时间戳作为唯一ID
                content: jsonString,
                timestamp: Date.now()
            };
            
            // 添加到历史记录
            history.push(historyItem);
            
            // 限制历史记录数量，最多保存50条
            if (history.length > 50) {
                history = history.slice(history.length - 50);
            }
            
            // 保存回localStorage
            localStorage.setItem('jsonFormatterHistory', JSON.stringify(history));
            console.log('已保存到历史记录');
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
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
                
                // 保存到历史记录
                saveToHistory(value);
                
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
    
    // 自动格式化输入
    // 注意：格式化按钮已移除，改为自动处理输入
    input.addEventListener('paste', () => {
        // 给一点延迟让粘贴内容填充到输入框
        setTimeout(() => {
            if (input.value.trim()) {
                processInput();
                showToast('格式化成功');
            }
        }, 100);
    });

    
    // 展开/折叠切换按钮
    if (toggleAllBtn) {
        // 按钮的初始状态为"展开全部"
        let isExpanded = false;
        
        // 初始化按钮图标
        const buttonIcon = toggleAllBtn.querySelector('i');
        
        // 设置初始状态的图标和文本
        buttonIcon.className = 'fa fa-plus-square-o';
        
        // 确保按钮文本正确设置
        // 移除按钮中所有文本节点，重新创建一个
        let textNode = null;
        toggleAllBtn.childNodes.forEach(node => {
            if (node.nodeType === 3) { // 文本节点
                node.remove();
            }
        });
        // 添加新的文本节点
        textNode = document.createTextNode(' 展开全部');
        toggleAllBtn.appendChild(textNode);
        
        toggleAllBtn.addEventListener('click', () => {
            // 检查当前折叠状态，决定执行操作
            if (isExpanded) {
                // 当前是展开状态，执行折叠全部
                const expandedNodes = document.querySelectorAll('.collapsible:not(.collapsed)');
                if (expandedNodes.length > 0) {
                    expandedNodes.forEach(item => item.click());
                    showToast(`已折叠 ${expandedNodes.length} 个节点`);
                } else {
                    showToast('没有可折叠的节点');
                }
                // 切换按钮图标和文本
                buttonIcon.className = 'fa fa-plus-square-o';
                
                // 移除所有文本节点，重新创建
                toggleAllBtn.childNodes.forEach(node => {
                    if (node.nodeType === 3) { // 文本节点
                        node.remove();
                    }
                });
                toggleAllBtn.appendChild(document.createTextNode(' 展开全部'));
                
                // 更新按钮样式
                toggleAllBtn.classList.remove('expanded');
                
                // 更新状态
                isExpanded = false;
                
            } else {
                // 当前是折叠状态，执行展开全部
                const collapsedNodes = document.querySelectorAll('.collapsible.collapsed');
                if (collapsedNodes.length > 0) {
                    collapsedNodes.forEach(item => item.click());
                    showToast(`已展开 ${collapsedNodes.length} 个节点`);
                } else {
                    showToast('没有可展开的节点');
                }
                // 切换按钮图标和文本
                buttonIcon.className = 'fa fa-minus-square-o';
                
                // 移除所有文本节点，重新创建
                toggleAllBtn.childNodes.forEach(node => {
                    if (node.nodeType === 3) { // 文本节点
                        node.remove();
                    }
                });
                toggleAllBtn.appendChild(document.createTextNode(' 折叠全部'));
                
                // 更新按钮样式
                toggleAllBtn.classList.add('expanded');
                
                // 更新状态
                isExpanded = true;
            }
            
            // 添加动画效果
            toggleAllBtn.classList.add('btn-active');
            setTimeout(() => toggleAllBtn.classList.remove('btn-active'), 300);
        });
    }
    
    // 查找变量，加载初始示例
    function loadExample() {
        try {
            const exampleJson = {
                "status": 0,
                "message": "Success",
                "data": {
                    "items": [ /* 10项 */ ],
                    "cursor": "1",
                    "hasNext": true,
                    "total": 2525
                },
                "timestamp": 174252449951,
                "success": true
            };
            
            input.value = JSON.stringify(exampleJson, null, 4);
            processInput();
        } catch (e) {
            console.error('Failed to load example:', e);
        }
    }
    
    // 检查sessionStorage中是否有选中的JSON
    function checkSelectedJson() {
        const selectedJson = sessionStorage.getItem('selectedJson');
        if (selectedJson) {
            // 清除sessionStorage中的数据，避免重复加载
            sessionStorage.removeItem('selectedJson');
            input.value = selectedJson;
            processInput();
            showToast('已加载历史记录');
            return true;
        }
        return false;
    }
    
    // 检查是否有内容，如果没有，加载示例
    if (!input.value.trim()) {
        // 先检查是否有从历史记录页面选择的JSON
        if (!checkSelectedJson()) {
            setTimeout(loadExample, 300);
        }
    } else {
        processInput();
    }
});