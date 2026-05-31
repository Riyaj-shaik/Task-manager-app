(function () {
  const API = window.API_BASE_URL;
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.replace('index.html');
    return;
  }

  const STAGES = ['todo', 'in_progress', 'done'];
  const STAGE_LABELS = {
    todo: 'Todo',
    in_progress: 'In Progress',
    done: 'Done',
  };

  const userEmailEl = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const addBtn = document.getElementById('add-btn');
  const newTitle = document.getElementById('new-title');
  const newDesc = document.getElementById('new-description');
  const newStage = document.getElementById('new-stage');
  const errorEl = document.getElementById('board-error');
  const loadingEl = document.getElementById('board-loading');

  userEmailEl.textContent = localStorage.getItem('email') || '';

  function showError(msg) {
    errorEl.textContent = msg || '';
  }

  async function apiRequest(path, options) {
    const opts = options || {};
    const headers = { Authorization: `Bearer ${token}` };
    if (opts.body) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    if (res.status === 401) {
      logout();
      throw new Error('Session expired');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.replace('index.html');
  }

  logoutBtn.addEventListener('click', logout);

  function renderTasks(tasks) {
    const buckets = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => {
      if (buckets[t.stage]) buckets[t.stage].push(t);
    });

    STAGES.forEach((stage) => {
      const column = document.querySelector(`.column[data-stage="${stage}"]`);
      const list = column.querySelector('.task-list');
      const count = column.querySelector('[data-count]');
      list.innerHTML = '';
      count.textContent = buckets[stage].length;

      buckets[stage].forEach((task) => {
        list.appendChild(buildTaskCard(task));
      });
    });
  }

  function buildTaskCard(task) {
    const li = document.createElement('li');
    li.className = 'task-card';
    li.dataset.id = task._id;

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = task.title;
    li.appendChild(title);

    if (task.description) {
      const desc = document.createElement('div');
      desc.className = 'description';
      desc.textContent = task.description;
      li.appendChild(desc);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';

    const select = document.createElement('select');
    STAGES.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = STAGE_LABELS[s];
      if (s === task.stage) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () =>
      updateTask(task._id, { stage: select.value })
    );
    actions.appendChild(select);

    const editBtn = document.createElement('button');
    editBtn.className = 'btn ghost';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => editTaskPrompt(task));
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteTask(task._id));
    actions.appendChild(delBtn);

    li.appendChild(actions);
    return li;
  }

  function editTaskPrompt(task) {
    const title = prompt('Edit title:', task.title);
    if (title === null) return;
    const description = prompt('Edit description:', task.description || '');
    if (description === null) return;
    updateTask(task._id, { title, description });
  }

  async function loadTasks() {
    loadingEl.style.display = '';
    showError('');
    try {
      const tasks = await apiRequest('/api/tasks');
      renderTasks(tasks);
    } catch (err) {
      showError(err.message);
    } finally {
      loadingEl.style.display = 'none';
    }
  }

  async function addTask() {
    const title = newTitle.value.trim();
    if (!title) {
      showError('Title is required');
      return;
    }
    addBtn.disabled = true;
    showError('');
    try {
      await apiRequest('/api/tasks', {
        method: 'POST',
        body: {
          title,
          description: newDesc.value.trim(),
          stage: newStage.value,
        },
      });
      newTitle.value = '';
      newDesc.value = '';
      newStage.value = 'todo';
      await loadTasks();
    } catch (err) {
      showError(err.message);
    } finally {
      addBtn.disabled = false;
    }
  }

  async function updateTask(id, changes) {
    showError('');
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'PUT', body: changes });
      await loadTasks();
    } catch (err) {
      showError(err.message);
    }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    showError('');
    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
      await loadTasks();
    } catch (err) {
      showError(err.message);
    }
  }

  addBtn.addEventListener('click', addTask);
  newTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  loadTasks();
})();
