const metrics = document.querySelector("#metrics");
const queue = document.querySelector("#queue-list");
const queueCount = document.querySelector("#queue-count");
const activity = document.querySelector("#activity-list");
const notice = document.querySelector("#demo-notice");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-message");
const chatWindow = document.querySelector("#chat-window");
const stateBadge = document.querySelector("#conversation-state");

let conversationState = "menu_principal";

function textNode(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function renderDashboard(data) {
  notice.textContent = data.notice;
  queueCount.textContent = `${data.queue.length} itens`;

  for (const metric of data.metrics) {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.dataset.tone = metric.tone;
    card.append(
      textNode("span", "metric-label", metric.label),
      textNode("strong", "", String(metric.value)),
      textNode("small", "", metric.trend),
    );
    metrics.append(card);
  }

  for (const item of data.queue) {
    const row = document.createElement("div");
    row.className = "queue-row";
    const avatar = textNode("div", "client-avatar", item.client.at(-1));
    const main = document.createElement("div");
    main.className = "queue-main";
    main.append(
      textNode("strong", "", item.client),
      textNode("span", "", item.subject),
    );
    const stage = document.createElement("div");
    stage.className = "queue-stage";
    const stageTitle = document.createElement("strong");
    const priority = document.createElement("span");
    priority.className = `priority ${item.priority === "alta" ? "high" : ""}`;
    stageTitle.append(priority, document.createTextNode(item.stage));
    stage.append(stageTitle, textNode("span", "", item.id));
    row.append(
      avatar,
      main,
      stage,
      textNode("span", "queue-time", item.updated),
    );
    queue.append(row);
  }

  for (const item of data.activity) {
    const entry = document.createElement("li");
    entry.append(textNode("time", "", item.time), textNode("p", "", item.text));
    activity.append(entry);
  }
}

function appendMessage(text, sender) {
  const message = textNode("div", `message ${sender}-message`, text);
  chatWindow.append(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function loadDashboard() {
  const response = await fetch("/api/dashboard", {
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error("Não foi possível carregar a demonstração.");
  renderDashboard(await response.json());
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  chatInput.value = "";
  chatInput.disabled = true;

  try {
    const response = await fetch("/api/demo/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: conversationState,
        message,
        hasMedia: false,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Falha na simulação.");
    conversationState = data.state;
    stateBadge.textContent = data.state;
    appendMessage(data.reply, "bot");
  } catch (error) {
    appendMessage(error.message, "bot");
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

loadDashboard().catch((error) => {
  notice.textContent = error.message;
});
