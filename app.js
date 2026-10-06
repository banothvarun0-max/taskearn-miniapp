```javascript
/* =====================================================
   TASKEARN
   FRONTEND-ONLY TELEGRAM MINI APP
   ===================================================== */


/* =====================================================
   TELEGRAM
   ===================================================== */

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}


/* =====================================================
   DATA
   ===================================================== */

const tasks = [
  {
    id: "task1",
    icon: "📺",
    title: "Watch Demo",
    description: "Watch the demo content.",
    reward: 50
  },
  {
    id: "task2",
    icon: "📱",
    title: "Try a Feature",
    description: "Explore a featured app section.",
    reward: 75
  },
  {
    id: "task3",
    icon: "🎯",
    title: "Daily Challenge",
    description: "Complete today's challenge.",
    reward: 100
  },
  {
    id: "task4",
    icon: "⭐",
    title: "Featured Task",
    description: "Check today's featured content.",
    reward: 150
  }
];


/* =====================================================
   LOCAL STORAGE
   ===================================================== */

let coins = Number(localStorage.getItem("taskEarnCoins")) || 0;

let completedTasks =
  JSON.parse(localStorage.getItem("taskEarnCompleted")) || [];

let lastDaily =
  localStorage.getItem("taskEarnDaily") || "";

let streak =
  Number(localStorage.getItem("taskEarnStreak")) || 0;


/* =====================================================
   TELEGRAM USER
   ===================================================== */

function getTelegramUser() {

  if (
    tg &&
    tg.initDataUnsafe &&
    tg.initDataUnsafe.user
  ) {
    return tg.initDataUnsafe.user;
  }

  return null;
}


const telegramUser = getTelegramUser();


/* =====================================================
   PROFILE
   ===================================================== */

function setupProfile() {

  const welcomeText =
    document.getElementById("welcomeText");

  const profileName =
    document.getElementById("profileName");

  const profileUsername =
    document.getElementById("profileUsername");

  const avatar =
    document.getElementById("avatar");


  if (telegramUser) {

    const name =
      telegramUser.first_name ||
      "Telegram User";

    welcomeText.textContent =
      "Hi, " + name + " 👋";

    profileName.textContent =
      name;

    if (telegramUser.username) {

      profileUsername.textContent =
        "@" + telegramUser.username;

    } else {

      profileUsername.textContent =
        "Telegram user";

    }

    if (telegramUser.photo_url) {

      avatar.innerHTML =
        `<img src="${telegramUser.photo_url}"
              style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

    }

  }

}


/* =====================================================
   UPDATE BALANCE
   ===================================================== */

function updateBalance() {

  document.getElementById("headerCoins").textContent =
    coins;

  document.getElementById("homeCoins").textContent =
    coins;

  document.getElementById("rewardCoins").textContent =
    coins;

  document.getElementById("profileCoins").textContent =
    coins;

  document.getElementById("completedCount").textContent =
    completedTasks.length;

  document.getElementById("streakValue").textContent =
    streak + " days";
}


/* =====================================================
   SAVE DATA
   ===================================================== */

function saveData() {

  localStorage.setItem(
    "taskEarnCoins",
    coins
  );

  localStorage.setItem(
    "taskEarnCompleted",
    JSON.stringify(completedTasks)
  );

  localStorage.setItem(
    "taskEarnDaily",
    lastDaily
  );

  localStorage.setItem(
    "taskEarnStreak",
    streak
  );

}


/* =====================================================
   RENDER TASK
   ===================================================== */

function createTaskHTML(task) {

  const completed =
    completedTasks.includes(task.id);

  return `
    <div class="task-card">

      <div class="task-top">

        <div class="task-icon">
          ${task.icon}
        </div>

        <div class="task-info">

          <h3>${task.title}</h3>

          <p>${task.description}</p>

        </div>

        <div class="task-reward">
          +${task.reward}
        </div>

      </div>

      <button
        class="task-button ${completed ? "completed" : ""}"
        onclick="completeTask('${task.id}')"
        ${completed ? "disabled" : ""}
      >
        ${completed ? "✓ Completed" : "Complete Task"}
      </button>

    </div>
  `;
}


/* =====================================================
   RENDER ALL TASKS
   ===================================================== */

function renderTasks() {

  const container =
    document.getElementById("tasksContainer");

  container.innerHTML =
    tasks.map(createTaskHTML).join("");

}


/* =====================================================
   HOME TASKS
   ===================================================== */

function renderHomeTasks() {

  const container =
    document.getElementById("homeTasks");

  container.innerHTML =
    tasks
      .slice(0, 2)
      .map(createTaskHTML)
      .join("");

}


/* =====================================================
   COMPLETE TASK
   ===================================================== */

function completeTask(taskId) {

  if (completedTasks.includes(taskId)) {
    return;
  }

  const task =
    tasks.find(t => t.id === taskId);

  if (!task) {
    return;
  }


  /*
     DEMO ONLY

     In the real version, this reward should
     only be given after an advertising/offer
     provider confirms completion.
  */


  completedTasks.push(taskId);

  coins += task.reward;

  saveData();

  updateBalance();

  renderTasks();

  renderHomeTasks();


  if (tg) {
    tg.HapticFeedback?.notificationOccurred("success");
  }

  alert(
    "Task completed!\n\n+" +
    task.reward +
    " points 🪙"
  );
}


/* =====================================================
   DAILY BONUS
   ===================================================== */

function getToday() {

  const date = new Date();

  return date.toISOString().split("T")[0];

}


function claimDailyBonus() {

  const today = getToday();

  if (lastDaily === today) {

    alert(
      "You already claimed today's bonus."
    );

    return;
  }


  coins += 100;

  lastDaily = today;

  streak++;

  saveData();

  updateBalance();

  updateDailyButton();


  if (tg) {
    tg.HapticFeedback?.notificationOccurred("success");
  }

  alert(
    "Daily bonus claimed!\n\n+100 points 🪙"
  );
}


function updateDailyButton() {

  const today = getToday();

  const status =
    document.getElementById("dailyStatus");

  if (lastDaily === today) {

    status.textContent =
      "Already claimed today ✓";

  } else {

    status.textContent =
      "Claim your daily bonus";
  }

}


/* =====================================================
   PAGE NAVIGATION
   ===================================================== */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.remove("active");

      if (
        button.dataset.page === pageId
      ) {

        button.classList.add("active");

      }

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   DAILY BONUS BUTTON
   ===================================================== */

document
  .getElementById("dailyBonusBtn")
  .addEventListener(
    "click",
    claimDailyBonus
  );


/* =====================================================
   INITIALIZE
   ===================================================== */

function init() {

  setupProfile();

  updateBalance();

  updateDailyButton();

  renderTasks();

  renderHomeTasks();

}


init();
```
