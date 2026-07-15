(function () {
  var storageKey = 'blog.plan.items';
  var tbody = document.querySelector('[data-plan-body]');
  if (!tbody) {
    return;
  }

  var addButton = document.querySelector('[data-plan-add]');
  var saveButton = document.querySelector('[data-plan-save]');
  var exportButton = document.querySelector('[data-plan-export]');
  var importInput = document.querySelector('[data-plan-import]');
  var resetButton = document.querySelector('[data-plan-reset]');
  var status = document.querySelector('[data-plan-status]');
  var items = [];
  var defaults = [];

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function collect() {
    items = Array.prototype.map.call(tbody.querySelectorAll('tr'), function (row) {
      return {
        title: row.querySelector('[name="title"]').value.trim(),
        category: row.querySelector('[name="category"]').value.trim(),
        date: row.querySelector('[name="date"]').value,
        status: row.querySelector('[name="status"]').value,
        notes: row.querySelector('[name="notes"]').value.trim()
      };
    }).filter(function (item) {
      return item.title || item.category || item.date || item.notes;
    });
  }

  function save() {
    collect();
    localStorage.setItem(storageKey, JSON.stringify(items));
    setStatus('计划已保存到当前浏览器。');
  }

  function fieldCell(name, value, type) {
    var cell = document.createElement('td');
    var input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    input.name = name;
    if (type === 'date') {
      input.type = 'date';
    }
    input.value = value || '';
    if (type === 'textarea') {
      input.rows = 2;
    }
    cell.appendChild(input);
    return cell;
  }

  function statusCell(value) {
    var cell = document.createElement('td');
    var select = document.createElement('select');
    select.name = 'status';
    ['未开始', '进行中', '已完成', '暂停'].forEach(function (optionText) {
      var option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      select.appendChild(option);
    });
    select.value = value || '未开始';
    cell.appendChild(select);
    return cell;
  }

  function actionCell(row) {
    var cell = document.createElement('td');
    var button = document.createElement('button');
    button.className = 'small-button';
    button.type = 'button';
    button.textContent = '删除';
    button.addEventListener('click', function () {
      row.remove();
      save();
    });
    cell.appendChild(button);
    return cell;
  }

  function render() {
    tbody.textContent = '';
    items.forEach(function (item) {
      var row = document.createElement('tr');
      row.appendChild(fieldCell('title', item.title));
      row.appendChild(fieldCell('category', item.category));
      row.appendChild(fieldCell('date', item.date, 'date'));
      row.appendChild(statusCell(item.status));
      row.appendChild(fieldCell('notes', item.notes, 'textarea'));
      row.appendChild(actionCell(row));
      tbody.appendChild(row);
    });
  }

  function addItem() {
    collect();
    items.push({
      title: '新的计划',
      category: '写作',
      date: '',
      status: '未开始',
      notes: ''
    });
    render();
    save();
  }

  function downloadJson(filename, value) {
    var blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  fetch('content/plans/plan.json').then(function (response) {
    if (!response.ok) {
      throw new Error('无法读取默认计划。');
    }
    return response.json();
  }).then(function (data) {
    defaults = data;
    items = readStored() || clone(defaults);
    render();
    setStatus('默认计划已加载。');

    addButton.addEventListener('click', addItem);
    saveButton.addEventListener('click', save);
    exportButton.addEventListener('click', function () {
      collect();
      downloadJson('blog-plan.json', items);
      setStatus('已导出 blog-plan.json。');
    });
    importInput.addEventListener('change', function () {
      var file = importInput.files[0];
      if (!file) {
        return;
      }
      file.text().then(function (text) {
        items = JSON.parse(text);
        localStorage.setItem(storageKey, JSON.stringify(items));
        render();
        setStatus('已导入并保存到当前浏览器。');
      }).catch(function () {
        setStatus('导入失败，请确认文件是有效 JSON。');
      });
    });
    resetButton.addEventListener('click', function () {
      localStorage.removeItem(storageKey);
      items = clone(defaults);
      render();
      setStatus('已恢复默认计划。');
    });
    tbody.addEventListener('change', save);
  }).catch(function (error) {
    setStatus(error.message);
  });
}());
