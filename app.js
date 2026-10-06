/* =====================================================
   TASKEARN V2
   TELEGRAM MINI APP
   FRONTEND DEMO
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
   SUPABASE TELEGRAM AUTHENTICATION
   ===================================================== */

const SUPABASE_AUTH_URL =
  "https://ezswtptpwfkxqfyduwmf.supabase.co/functions/v1/rapid-endpoint";

let verifiedServerUser = null;

async function authenticateWithSupabase() {

  if (!tg || !tg.initData) {
    console.warn("TaskEarn: Telegram initData is not available.");
    return null;
  }

  try {

    const response = await fetch(
      SUPABASE_AUTH_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          initData: tg.initData
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "Telegram authentication failed"
      );
    }

    if (!data.success || !data.user) {
      throw new Error("Invalid authentication response");
    }

    verifiedServerUser = data.user;

    console.log(
      "TaskEarn: Telegram user verified by Supabase.",
      verifiedServerUser.telegram_id
    );

    return verifiedServerUser;

  } catch (error) {

    console.error(
      "TaskEarn: Supabase authentication error:",
      error
    );

    return null;
  }
}


/* =====================================================
   TASK DATA
   ===================================================== */

const tasks = [

  {
    id: "daily-challenge",
    icon: "🎯",
    title: "Daily Challenge",
    description: "Complete today's simple challenge.",
    reward: 100,
    type: "daily"
  },

  {
    id: "watch-ad",
    icon: "📺",
    title: "Watch Rewarded Ad",
    description: "Available when a supported ad provider is connected.",
    reward: 25,
    type: "ad"
  },

  {
    id: "featured-task",
    icon: "⭐",
    title: "Featured Task",
    description: "Try today's featured activity.",
    reward: 75,
    type: "featured"
  },

  {
    id: "quiz-task",
    icon: "🧠",
    title: "Quick Quiz",
    description: "Answer a short question.",
    reward: 50,
    type: "quiz"
  }

];


/* =====================================================
   LOCAL DATA
   ===================================================== */

let coins =
  Number(localStorage.getItem("taskEarnCoins")) || 0;


let completedTasks =
  JSON.parse(
    localStorage.getItem("taskEarnCompleted")
  ) || [];


let history =
  JSON.parse(
    localStorage.getItem("taskEarnHistory")
  ) || [];


let lastDaily =
  localStorage.getItem("taskEarnDaily") || "";


let streak =
  Number(
    localStorage.getItem("taskEarnStreak")
  ) || 0;


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


const telegramUser =
  getTelegramUser();


/* =====================================================
   PROFILE
   ===================================================== */

function setupProfile() {

  const welcome =
    document.getElementById("welcomeText");

  const profileName =
    document.getElementById("profileName");

  const profileUsername =
    document.getElementById("profileUsername");

  const avatar =
    document.getElementById("avatar");


  if (!telegramUser) {

    welcome.textContent =
      "Welcome 👋";

    return;

  }


  const name =
    telegramUser.first_name ||
    "Telegram User";


  welcome.textContent =
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

    avatar.innerHTML = "";

    const img =
      document.createElement("img");

    img.src =
      telegramUser.photo_url;

    img.style.width =
      "100%";

    img.style.height =
      "100%";

    img.style.objectFit =
      "cover";

    img.style.borderRadius =
      "50%";

    avatar.appendChild(img);

  }

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
    "taskEarnHistory",
    JSON.stringify(history)
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
   BALANCE
   ===================================================== */

function updateBalance() {

  const elements = {

    headerCoins:
      document.getElementById("headerCoins"),

    homeCoins:
      document.getElementById("homeCoins"),

    rewardCoins:
      document.getElementById("rewardCoins"),

    profileCoins:
      document.getElementById("profileCoins"),

    profileTotal:
      document.getElementById("profileTotal"),

    completedCount:
      document.getElementById("completedCount"),

    streakValue:
      document.getElementById("streakValue"),

    homeStreak:
      document.getElementById("homeStreak"),

    profileStreak:
      document.getElementById("profileStreak")

  };


  if (elements.headerCoins)
    elements.headerCoins.textContent = coins;


  if (elements.homeCoins)
    elements.homeCoins.textContent = coins;


  if (elements.rewardCoins)
    elements.rewardCoins.textContent = coins;


  if (elements.profileCoins)
    elements.profileCoins.textContent = coins;


  if (elements.profileTotal)
    elements.profileTotal.textContent = coins;


  if (elements.completedCount)
    elements.completedCount.textContent =
      completedTasks.length;


  if (elements.streakValue)
    elements.streakValue.textContent =
      streak + " days";


  if (elements.homeStreak)
    elements.homeStreak.textContent =
      streak;


  if (elements.profileStreak)
    elements.profileStreak.textContent =
      streak;

}


/* =====================================================
   DATE
   ===================================================== */

function getToday() {

  const date =
    new Date();

  return date.toISOString()
    .split("T")[0];

}


/* =====================================================
   TASK HTML
   ===================================================== */

function createTaskHTML(task) {

  const completed =
    completedTasks.includes(task.id);


  let buttonText =
    completed
      ? "✓ Completed"
      : "Complete Task";


  /*
    The rewarded-ad task is intentionally
    disabled until a real supported provider
    is connected.
  */

  if (
    task.type === "ad" &&
    !completed
  ) {

    buttonText =
      "Coming Soon";

  }


  const disabled =
    completed ||
    task.type === "ad";


  return `

    <div class="task-card">

      <div class="task-top">

        <div class="task-icon">
          ${task.icon}
        </div>


        <div class="task-info">

          <h3>
            ${task.title}
          </h3>

          <p>
            ${task.description}
          </p>

        </div>


        <div class="task-reward">
          +${task.reward}
        </div>

      </div>


      <button
        class="task-button ${
          completed ? "completed" : ""
        }"
        onclick="handleTask('${task.id}')"
        ${disabled ? "disabled" : ""}
      >

        ${buttonText}

      </button>

    </div>

  `;

}


/* =====================================================
   TASK FILTER
   ===================================================== */

let currentTaskFilter =
  "available";


function filterTasks(
  filter,
  button
) {

  currentTaskFilter =
    filter;


  document
    .querySelectorAll(".task-tab")
    .forEach(tab => {

      tab.classList.remove("active");

    });


  if (button) {

    button.classList.add("active");

  }


  renderTasks();

}


/* =====================================================
   RENDER TASKS
   ===================================================== */

function renderTasks() {

  const container =
    document.getElementById(
      "tasksContainer"
    );


  if (!container)
    return;


  let visibleTasks;


  if (
    currentTaskFilter ===
    "completed"
  ) {

    visibleTasks =
      tasks.filter(task =>
        completedTasks.includes(task.id)
      );

  } else {

    visibleTasks =
      tasks.filter(task =>
        !completedTasks.includes(task.id)
      );

  }


  if (visibleTasks.length === 0) {

    container.innerHTML = `

      <div class="empty-history">

        ${
          currentTaskFilter === "completed"
            ? "No completed tasks yet."
            : "You've completed all available tasks."
        }

      </div>

    `;

    return;

  }


  container.innerHTML =
    visibleTasks
      .map(createTaskHTML)
      .join("");

}


/* =====================================================
   HOME TASKS
   ===================================================== */

function renderHomeTasks() {

  const container =
    document.getElementById(
      "homeTasks"
    );


  if (!container)
    return;


  const available =
    tasks
      .filter(task =>
        !completedTasks.includes(task.id)
      )
      .slice(0, 3);


  if (available.length === 0) {

    container.innerHTML = `

      <div class="empty-history">

        🎉 All today's tasks are completed!

      </div>

    `;

    return;

  }


  container.innerHTML =
    available
      .map(createTaskHTML)
      .join("");

}


/* =====================================================
   HANDLE TASK
   ===================================================== */

function handleTask(taskId) {

  const task =
    tasks.find(
      item => item.id === taskId
    );


  if (!task)
    return;


  if (
    completedTasks.includes(taskId)
  ) {

    return;

  }


  /*
    Rewarded advertisements must NOT
    be rewarded from this client-side
    function.

    A real ad provider must confirm
    completion first.
  */

  if (
    task.type === "ad"
  ) {

    alert(
      "Rewarded ads are not connected yet.\n\n" +
      "We will connect a supported provider " +
      "after the secure reward system is ready."
    );

    return;

  }


  completeTask(task);

}


/* =====================================================
   COMPLETE TASK
   ===================================================== */

async function completeTask(task) {

  if (!verifiedServerUser) {
    alert("Please wait for Telegram authentication to finish.");
    return;
  }

  try {

    const response = await fetch(
      "https://ezswtptpwfkxqfyduwmf.supabase.co/functions/v1/super-processor",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          initData: tg.initData,
          taskSlug: task.id
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "Task claim failed"
      );
    }

    if (!data.success) {

      alert(
        data.message ||
        "This task cannot be claimed right now."
      );

      return;
    }

    /*
      Server is now the source of truth.
    */

    coins = Number(data.new_balance) || 0;

    completedTasks.push(task.id);

    addHistory(
      task.title,
      task.reward,
      task.icon
    );

    saveData();

    updateBalance();
    renderTasks();
    renderHomeTasks();
    renderHistory();

    if (tg) {
      tg.HapticFeedback
        ?.notificationOccurred("success");
    }

    alert(
      "Task completed!\n\n+" +
      task.reward +
      " points 🪙"
    );

  } catch (error) {

    console.error(
      "Task claim error:",
      error
    );

    alert(
      "Unable to claim this task right now.\n\n" +
      "Please try again."
    );
  }
}

/* =====================================================
   HISTORY
   ===================================================== */

function addHistory(
  title,
  points,
  icon
) {

  history.unshift({

    title: title,

    points: points,

    icon: icon,

    date: new Date()
      .toISOString()

  });


  /*
    Keep only latest 50 records.
  */

  history =
    history.slice(0, 50);

}


/* =====================================================
   RENDER HISTORY
   ===================================================== */

function renderHistory() {

  const container =
    document.getElementById(
      "historyContainer"
    );


  if (!container)
    return;


  if (history.length === 0) {

    container.innerHTML = `

      <div class="empty-history">

        📊 No activity yet.<br><br>

        Complete your first task
        to see your history here.

      </div>

    `;

    return;

  }


  container.innerHTML =
    history.map(item => {

      const date =
        new Date(item.date);


      const formatted =
        date.toLocaleString(
          [],
          {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          }
        );


      return `

        <div class="history-card">

          <div class="history-icon">
            ${item.icon}
          </div>


          <div class="history-info">

            <strong>
              ${item.title}
            </strong>

            <span>
              ${formatted}
            </span>

          </div>


          <div class="history-points">
            +${item.points}
          </div>

        </div>

      `;

    }).join("");

}


/* =====================================================
   DAILY BONUS
   ===================================================== */

function claimDailyBonus() {

  const today =
    getToday();


  if (
    lastDaily === today
  ) {

    alert(
      "You already claimed today's bonus."
    );

    return;

  }


  coins += 100;


  lastDaily =
    today;


  streak++;


  addHistory(
    "Daily Bonus",
    100,
    "🎁"
  );


  saveData();

  updateBalance();

  updateDailyButton();

  renderHistory();


  if (tg) {

    tg.HapticFeedback
      ?.notificationOccurred(
        "success"
      );

  }


  alert(
    "Daily bonus claimed!\n\n" +
    "+100 points 🪙"
  );

}


/* =====================================================
   DAILY BUTTON
   ===================================================== */

function updateDailyButton() {

  const status =
    document.getElementById(
      "dailyStatus"
    );


  if (!status)
    return;


  const today =
    getToday();


  if (
    lastDaily === today
  ) {

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

      page.classList.remove(
        "active"
      );

    });


  const page =
    document.getElementById(
      pageId
    );


  if (page) {

    page.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.remove(
        "active"
      );


      if (
        button.dataset.page ===
        pageId
      ) {

        button.classList.add(
          "active"
        );

      }

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   DAILY BUTTON EVENT
   ===================================================== */

const dailyButton =
  document.getElementById(
    "dailyBonusBtn"
  );


if (dailyButton) {

  dailyButton.addEventListener(
    "click",
    claimDailyBonus
  );

}


/* =====================================================
   INITIALIZE
   ===================================================== */

async function init() {

  setupProfile();

  updateBalance();

  updateDailyButton();

  renderTasks();

  renderHomeTasks();

  renderHistory();

  await authenticateWithSupabase();

}


init();