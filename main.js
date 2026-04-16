let tasks = [];
let filter = "all";

// Загрузка данных из LocalStorage
try {
  const raw = localStorage.getItem("tasks_v2");
  if (raw) tasks = JSON.parse(raw);
} catch (e) {
  tasks = [];
}

const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const countBadge = document.getElementById("countBadge");
const progressBar = document.getElementById("progressBar");

function save() {
  try {
    localStorage.setItem("tasks_v2", JSON.stringify(tasks));
  } catch (e) {}
}

function updateMeta() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressBar.style.width = pct + "%";

  const word = total === 1 ? "задача" : total < 5 ? "задачи" : "задач";
  countBadge.textContent = total + " " + word;

  // Анимация при изменении счетчика
  countBadge.style.animation = "none";
  requestAnimationFrame(() => {
    countBadge.style.animation = "countBounce 0.3s ease";
  });
}

function renderList() {
  taskList.innerHTML = "";
  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done,
  );

  emptyState.style.display = visible.length === 0 ? "block" : "none";

  visible.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = "task-item" + (t.done ? " done-item" : "");
    li.style.animationDelay = i * 0.04 + "s";

    const checkBtn = document.createElement("button");
    checkBtn.className = "check-btn" + (t.done ? " checked" : "");
    checkBtn.setAttribute(
      "aria-label",
      t.done ? "Снять отметку" : "Отметить выполненным",
    );

    const span = document.createElement("span");
    span.className = "task-text" + (t.done ? " done-text" : "");
    span.textContent = t.text;

    const delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.innerHTML = "&#x2715;";
    delBtn.setAttribute("aria-label", "Удалить задачу");

    // Событие выполнения задачи
    checkBtn.addEventListener("click", () => {
      t.done = !t.done;
      checkBtn.classList.toggle("checked");
      span.classList.toggle("done-text");
      li.classList.toggle("done-item");
      save();
      updateMeta();
      if (filter !== "all") {
        setTimeout(() => {
          li.classList.add("removing");
          setTimeout(() => renderList(), 310);
        }, 200);
      }
    });

    // Событие удаления задачи
    delBtn.addEventListener("click", () => {
      li.classList.add("removing");
      setTimeout(() => {
        tasks = tasks.filter((x) => x.id !== t.id);
        save();
        renderList();
        updateMeta();
      }, 310);
    });

    li.appendChild(checkBtn);
    li.appendChild(span);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
  updateMeta();
}

function addTask() {
  const text = input.value.trim();
  if (!text) {
    input.classList.remove("shake");
    void input.offsetWidth; // Магия для перезапуска анимации
    input.classList.add("shake");
    input.addEventListener(
      "animationend",
      () => input.classList.remove("shake"),
      { once: true },
    );
    return;
  }
  tasks.unshift({ id: Date.now(), text, done: false });
  save();
  input.value = "";
  if (filter === "done") {
    filter = "all";
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.filter === "all");
    });
  }
  renderList();
}

addBtn.addEventListener("click", addTask);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

// Логика фильтров
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderList();
  });
});

// Первичная отрисовка
renderList();
