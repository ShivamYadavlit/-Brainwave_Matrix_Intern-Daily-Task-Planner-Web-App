

document.addEventListener('DOMContentLoaded', () => {
   
    const currentDayEl = document.getElementById('current-day');
 const currentDateEl = document.getElementById('current-date');
    const timeSlotsContainer = document.getElementById('time-slots');
          const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
  const closeBtn = document.querySelector('.close-btn');
    const taskForm = document.getElementById('task-form');
    const timeFilter = document.getElementById('time-filter');
  
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
    
    function updateDateDisplay() {
      const now = new Date();
              const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
      currentDayEl.textContent = weekdays[now.getDay()];
      currentDateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    }
  
    
    function renderTimeSlots() {
      timeSlotsContainer.innerHTML = '';
  
      const periods = {
           morning: { start: 6, end: 12, title: 'Morning' },
        afternoon: { start: 12, end: 18, title: 'Afternoon' },
       evening: { start: 18, end: 24, title: 'Evening' },
        night: { start: 0, end: 6, title: 'Night' }
      };
  
      for (const [period, config] of Object.entries(periods)) {
             const slotEl = document.createElement('div');
        slotEl.className = 'time-slot';
        slotEl.dataset.timeGroup = period;
  
        const header = document.createElement('div');
                     header.className = 'time-slot-header';
  
        const title = document.createElement('div');
           title.className = 'time-slot-title';
        title.textContent = config.title;
  
        const actions = document.createElement('div');
        actions.className = 'time-slot-actions';
  
        const addBtn = document.createElement('button');
        addBtn.innerHTML = '<i class="fas fa-plus" style="color: blue;"></i>';
        addBtn.title = 'Add task';
        addBtn.addEventListener('click', () => openModal(period));
  
        actions.appendChild(addBtn);
        header.appendChild(title);
        header.appendChild(actions);
  
        const taskList = document.createElement('ul');
        taskList.className = 'task-list';
  
        const filteredTasks = tasks.filter(task => {
          const hour = parseInt(task.time.split(':')[0]);
          return hour >= config.start && hour < config.end;
        });
  
        if (filteredTasks.length === 0) {
          const emptyMsg = document.createElement('div');
          emptyMsg.className = 'empty-state';
          emptyMsg.textContent = 'No tasks scheduled';
          taskList.appendChild(emptyMsg);
        } else {
          filteredTasks.forEach(task => taskList.appendChild(buildTaskElement(task)));
        }
  
        slotEl.appendChild(header);
        slotEl.appendChild(taskList);
        timeSlotsContainer.appendChild(slotEl);
      }
    }
  
 
    function buildTaskElement(task) {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.taskId = task.id;
  
      const info = document.createElement('div');
      info.className = 'task-info';
  
      const title = document.createElement('div');
      title.className = 'task-title';
      title.textContent = task.title;
  
      if (task.priority) {
        const badge = document.createElement('span');
        badge.className = `task-priority priority-${task.priority}`;
        badge.textContent = task.priority;
        title.appendChild(badge);
      }
  
      if (task.description) {
        const desc = document.createElement('div');
        desc.className = 'task-description';
        desc.textContent = task.description;
        info.appendChild(desc);
      }
  
      info.prepend(title);
  
      const time = document.createElement('div');
      time.className = 'task-time';
      time.textContent = formatAMPM(task.time);
  
      const controls = document.createElement('div');
      controls.className = 'task-actions';
  
      const edit = document.createElement('button');
      edit.innerHTML = '<i class="fas fa-edit"></i>';
      edit.title = 'Edit';
      edit.addEventListener('click', () => openModal(null, task.id));
  
      const del = document.createElement('button');
      del.innerHTML = '<i class="fas fa-trash"></i>';
      del.title = 'Delete';
      del.className = 'delete-btn';
      del.addEventListener('click', () => deleteTask(task.id));
  
      controls.appendChild(edit);
      controls.appendChild(del);
  
      li.appendChild(time);
      li.appendChild(info);
      li.appendChild(controls);
  
      return li;
    }
  
    function formatAMPM(time) {
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${suffix}`;
    }
  
    function openModal(group, taskId = null) {
      const titleEl = document.getElementById('modal-title');
      const idField = document.getElementById('task-id');
      const nameField = document.getElementById('task-title');
      const timeField = document.getElementById('task-time');
      const descField = document.getElementById('task-description');
      const priorityField = document.getElementById('task-priority');
  
      if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          titleEl.textContent = 'Edit Task';
          idField.value = task.id;
          nameField.value = task.title;
          timeField.value = task.time;
          descField.value = task.description || '';
          priorityField.value = task.priority || 'medium';
        }
      } else {
        titleEl.textContent = 'Add New Task';
        idField.value = '';
        nameField.value = '';
  
        let defaultHour = 9;
        if (group === 'afternoon') defaultHour = 14;
        else if (group === 'evening') defaultHour = 19;
        else if (group === 'night') defaultHour = 1;
  
        timeField.value = `${defaultHour.toString().padStart(2, '0')}:00`;
        descField.value = '';
        priorityField.value = 'medium';
      }
  
      taskModal.style.display = 'flex';
    }
  
    function closeModal() {
      taskModal.style.display = 'none';
      taskForm.reset();
    }
 
    function handleSaveTask(e) {
      e.preventDefault();
  
      const taskData = {
        id: document.getElementById('task-id').value || Date.now().toString(),
        title: document.getElementById('task-title').value.trim(),
        time: document.getElementById('task-time').value,
        description: document.getElementById('task-description').value.trim(),
        priority: document.getElementById('task-priority').value
      };
  
      if (!taskData.title) {
        alert('Task title is required.');
        return;
      }
  
      const idx = tasks.findIndex(t => t.id === taskData.id);
      if (idx !== -1) {
        tasks[idx] = taskData;
      } else {
        tasks.push(taskData);
      }
  
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTimeSlots();
      closeModal();
    }
  
    
    function deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTimeSlots();
      }
    }
  
   
    function applyTimeFilter() {
      const filterValue = timeFilter.value;
      document.querySelectorAll('.time-slot').forEach(slot => {
        slot.style.display = filterValue === 'all' || slot.dataset.timeGroup === filterValue
          ? 'block' : 'none';
      });
    }
  
    
    addTaskBtn.addEventListener('click', () => openModal('morning'));
    closeBtn.addEventListener('click', closeModal);
    taskForm.addEventListener('submit', handleSaveTask);
    timeFilter.addEventListener('change', applyTimeFilter);
  
    window.addEventListener('click', e => {
      if (e.target === taskModal) closeModal();
    });
  
    updateDateDisplay();
    renderTimeSlots();
  });
  