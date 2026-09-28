const claimForm = document.querySelector("#claim-form");
const claimsList = document.querySelector("#claims-list");
const claimCount = document.querySelector("#claim-count");
const formMessage = document.querySelector("#form-message");
const storageKey = "claims-tracker-claims";
const validStatuses = new Set(["Open", "Denied", "Paid"]);
const filterButtons = document.querySelectorAll(".filter-button");
const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});
let claims = [];
let activeFilter = "All";

const requiredTextFields = ["claimId", "patientName", "insurancePayer"]
  .map((name) => claimForm.elements.namedItem(name));

function isClaim(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.patientName === "string" &&
    typeof value.insurancePayer === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    value.amount >= 0 &&
    validStatuses.has(value.status)
  );
}

function renderClaim(claim) {
  const row = document.createElement("tr");
  row.dataset.index = String(claims.indexOf(claim));
  const values = [
    { text: claim.id, className: "claim-id" },
    { text: claim.patientName },
    { text: claim.insurancePayer },
    { text: claim.amount.toFixed(2) },
  ];

  values.forEach(({ text, className }) => {
    const cell = document.createElement("td");
    cell.textContent = text;
    if (className) {
      cell.className = className;
    }
    row.append(cell);
  });

  const statusCell = document.createElement("td");
  const statusSelect = document.createElement("select");
  statusSelect.className = "status-select";
  statusSelect.setAttribute("aria-label", `Status for claim ${claim.id}`);
  validStatuses.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = status === claim.status;
    statusSelect.append(option);
  });
  statusCell.append(statusSelect);
  row.append(statusCell);

  const actionsCell = document.createElement("td");
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete claim ${claim.id}`);
  actionsCell.append(deleteButton);
  row.append(actionsCell);

  claimsList.append(row);
}

function updateClaimList() {
  const visibleClaims = activeFilter === "All"
    ? claims
    : claims.filter((claim) => claim.status === activeFilter);
  claimsList.replaceChildren();
  if (visibleClaims.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "empty-row";
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 6;

    const emptyIcon = document.createElement("span");
    emptyIcon.className = "empty-icon";
    emptyIcon.setAttribute("aria-hidden", "true");
    emptyIcon.textContent = "—";

    const emptyTitle = document.createElement("strong");
    emptyTitle.textContent = claims.length === 0 ? "No claims yet" : `No ${activeFilter.toLowerCase()} claims`;

    const emptyDescription = document.createElement("span");
    emptyDescription.textContent = claims.length === 0
      ? "Your claims will appear here after you add one."
      : "Try another status filter to see more claims.";

    emptyCell.append(emptyIcon, emptyTitle, emptyDescription);
    emptyRow.append(emptyCell);
    claimsList.append(emptyRow);
  } else {
    visibleClaims.forEach(renderClaim);
  }

  claimCount.textContent = String(visibleClaims.length);
  document.querySelector("#claims-title").firstChild.textContent =
    activeFilter === "All" ? "All claims " : `${activeFilter} claims `;
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  updateSummaries();
}

function updateSummaries() {
  const groups = {
    All: claims,
    Open: claims.filter((claim) => claim.status === "Open"),
    Denied: claims.filter((claim) => claim.status === "Denied"),
    Paid: claims.filter((claim) => claim.status === "Paid"),
  };

  Object.entries(groups).forEach(([status, statusClaims]) => {
    const summary = document.querySelector(`[data-summary="${status}"]`);
    const totalCents = statusClaims.reduce((total, claim) => total + Math.round(claim.amount * 100), 0);
    summary.querySelector(".summary-amount").textContent = currencyFormatter.format(totalCents / 100);
    summary.querySelector(".summary-count").textContent =
      `${statusClaims.length} ${statusClaims.length === 1 ? "claim" : "claims"}`;
  });
}

function loadClaims() {
  try {
    const savedClaims = localStorage.getItem(storageKey);
    if (savedClaims === null) {
      return;
    }

    const parsedClaims = JSON.parse(savedClaims);
    if (!Array.isArray(parsedClaims) || !parsedClaims.every(isClaim)) {
      throw new Error("Saved claims have an invalid format.");
    }

    claims = parsedClaims;
    updateClaimList();
  } catch (error) {
    console.error("Unable to load saved claims.", error);
    formMessage.textContent = "Saved claims could not be loaded. Check browser storage and refresh the page.";
  }
}

function saveClaims(updatedClaims, failureMessage) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedClaims));
    claims = updatedClaims;
    updateClaimList();
    return true;
  } catch (error) {
    console.error("Unable to save claims.", error);
    formMessage.textContent = failureMessage;
    updateClaimList();
    return false;
  }
}

requiredTextFields.forEach((field) => {
  field.addEventListener("input", () => field.setCustomValidity(""));
});

loadClaims();

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateClaimList();
  });
});

claimsList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.matches(".status-select")) {
    return;
  }

  const row = event.target.closest("tr");
  const claimIndex = Number(row.dataset.index);
  const status = event.target.value;
  if (!Number.isInteger(claimIndex) || !claims[claimIndex] || !validStatuses.has(status)) {
    updateClaimList();
    return;
  }

  const updatedClaims = claims.map((claim, index) =>
    index === claimIndex ? { ...claim, status } : claim
  );
  if (saveClaims(updatedClaims, "The claim status could not be saved. Check browser storage and try again.")) {
    formMessage.textContent = `Claim ${claims[claimIndex].id} status changed to ${status}.`;
  }
});

claimsList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches(".delete-button")) {
    return;
  }

  const row = event.target.closest("tr");
  const claimIndex = Number(row.dataset.index);
  if (!Number.isInteger(claimIndex) || !claims[claimIndex]) {
    updateClaimList();
    return;
  }

  const deletedClaimId = claims[claimIndex].id;
  const updatedClaims = claims.filter((_, index) => index !== claimIndex);
  if (saveClaims(updatedClaims, "The claim could not be deleted. Check browser storage and try again.")) {
    formMessage.textContent = `Claim ${deletedClaimId} deleted.`;
  }
});

claimForm.addEventListener("submit", (event) => {
  event.preventDefault();

  requiredTextFields.forEach((field) => {
    field.setCustomValidity(field.value.trim() ? "" : "Please fill out this field.");
  });

  if (!claimForm.reportValidity()) {
    return;
  }

  const formData = new FormData(claimForm);
  const claim = {
    id: formData.get("claimId").trim(),
    patientName: formData.get("patientName").trim(),
    insurancePayer: formData.get("insurancePayer").trim(),
    amount: Number(formData.get("amount")),
    status: formData.get("status"),
  };

  if (!saveClaims([...claims, claim], "This claim could not be saved. Check browser storage and try again.")) {
    return;
  }

  formMessage.textContent = `Claim ${claim.id} added.`;
  claimForm.reset();
  claimForm.elements.namedItem("claimId").focus();
});
