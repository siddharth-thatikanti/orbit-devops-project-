const API_BASE = "http://localhost:3000/api";
const container = document.querySelector("#requests");
const message = document.querySelector("#message");
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    let error = "Request failed";
    try { error = (await response.json()).error || error; } catch {}
    throw new Error(error);
  }
  if (response.status === 204) return null;
  return response.json();
}

function requestCard(item) {
  const statusClass = item.status === "Open" ? "status-open" : item.status === "In Progress" ? "status-progress" : "status-resolved";
  return `<article class="request">
    <div>
      <h3>${esc(item.customer_name)} <span style="color:#9aa4b2;font-weight:400">· #${item.id}</span></h3>
      <p class="description">${esc(item.description)}</p>
      <div class="meta"><span class="tag">${esc(item.category)}</span><span class="tag ${statusClass}">${esc(item.status)}</span><span>Submitted ${new Date(item.created_at).toLocaleDateString()}</span></div>
    </div>
    <div class="actions">
      <select data-status="${item.id}" aria-label="Update request status">
        ${["Open","In Progress","Resolved"].map(s => `<option ${item.status === s ? "selected" : ""}>${s}</option>`).join("")}
      </select>
      <button class="delete" data-delete="${item.id}">Delete</button>
    </div>
  </article>`;
}

async function loadRequests() {
  try {
    const items = await api("/requests");
    document.querySelector("#total").textContent = items.length;
    document.querySelector("#open").textContent = items.filter(x => x.status === "Open").length;
    document.querySelector("#progress").textContent = items.filter(x => x.status === "In Progress").length;
    document.querySelector("#resolved").textContent = items.filter(x => x.status === "Resolved").length;
    container.innerHTML = items.length ? items.map(requestCard).join("") : '<div class="empty">No requests yet. Submit the first one above.</div>';
  } catch (error) {
    container.innerHTML = `<div class="empty">Could not load requests: ${esc(error.message)}. Make sure the backend and database are running.</div>`;
  }
}

document.querySelector("#request-form").addEventListener("submit", async event => {
  event.preventDefault();
  message.textContent = "";
  try {
    await api("/requests", { method: "POST", body: JSON.stringify({
      customer_name: document.querySelector("#customer").value.trim(),
      category: document.querySelector("#category").value,
      description: document.querySelector("#description").value.trim()
    })});
    event.target.reset();
    message.style.color = "#16865a";
    message.textContent = "Request submitted.";
    await loadRequests();
  } catch (error) {
    message.style.color = "#c84d58";
    message.textContent = error.message;
  }
});

container.addEventListener("change", async event => {
  if (!event.target.matches("[data-status]")) return;
  try {
    await api(`/requests/${event.target.dataset.status}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
    await loadRequests();
  } catch (error) { alert(error.message); }
});

container.addEventListener("click", async event => {
  const button = event.target.closest("[data-delete]");
  if (!button || !confirm("Delete this request?")) return;
  try {
    await api(`/requests/${button.dataset.delete}`, { method: "DELETE" });
    await loadRequests();
  } catch (error) { alert(error.message); }
});

async function checkHealth() {
  const status = document.querySelector("#service-status");
  try {
    const result = await api("/health");
    status.textContent = result.database === "connected" ? "Service available" : "Database unavailable";
  } catch {
    status.textContent = "Backend unavailable";
  }
}

loadRequests();
checkHealth();
setInterval(checkHealth, 15000);
