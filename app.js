const form = document.querySelector("#resume-form");
const preview = document.querySelector("#resume-preview");
const lists = {
  experience: document.querySelector("#experience-list"),
  education: document.querySelector("#education-list"),
};

const entryFields = {
  experience: [
    { name: "role", label: "Job title", placeholder: "e.g. Product designer", wide: true },
    { name: "company", label: "Company", placeholder: "e.g. Northstar Studio" },
    { name: "dates", label: "Dates", placeholder: "2022 – Present" },
    { name: "description", label: "What you did", placeholder: "A few details about your work and impact.", wide: true, multiline: true },
  ],
  education: [
    { name: "school", label: "School", placeholder: "e.g. State University", wide: true },
    { name: "degree", label: "Degree or focus", placeholder: "e.g. BA, Graphic Design" },
    { name: "dates", label: "Dates", placeholder: "2018 – 2022" },
  ],
};

function makeField(field) {
  const label = document.createElement("label");
  label.className = `field${field.wide ? " field-wide" : ""}`;

  const caption = document.createElement("span");
  caption.textContent = field.label;

  const input = document.createElement(field.multiline ? "textarea" : "input");
  input.name = field.name;
  input.dataset.entryField = field.name;
  input.placeholder = field.placeholder;
  if (field.multiline) input.rows = 3;

  label.append(caption, input);
  return label;
}

function addEntry(type) {
  const card = document.createElement("div");
  card.className = "entry-card";
  card.dataset.entryType = type;

  const heading = document.createElement("div");
  heading.className = "entry-card-top";

  const title = document.createElement("span");
  title.textContent = type === "experience" ? "Role details" : "School details";

  const remove = document.createElement("button");
  remove.className = "remove-button";
  remove.type = "button";
  remove.dataset.removeEntry = "";
  remove.textContent = "Remove";
  remove.setAttribute("aria-label", `Remove ${type === "experience" ? "role" : "school"}`);
  heading.append(title, remove);

  const fields = document.createElement("div");
  fields.className = "entry-fields";
  for (const field of entryFields[type]) {
    fields.append(makeField(field));
  }

  card.append(heading, fields);
  lists[type].append(card);
}

function updateText(key, value, fallback = "") {
  const target = preview.querySelector(`[data-preview="${key}"]`);
  target.textContent = value.trim() || fallback;
}

function readEntries(type) {
  return [...lists[type].querySelectorAll(".entry-card")].map((card) => {
    const values = {};
    for (const input of card.querySelectorAll("[data-entry-field]")) {
      values[input.dataset.entryField] = input.value.trim();
    }
    return values;
  });
}

function renderEntry(type, entry) {
  const title = type === "experience" ? entry.role : entry.school;
  const subtitle = type === "experience" ? entry.company : entry.degree;
  if (!title && !subtitle && !entry.dates && !entry.description) return null;

  const article = document.createElement("article");
  article.className = "resume-entry";

  const heading = document.createElement("div");
  heading.className = "resume-entry-heading";

  const titleElement = document.createElement("h4");
  titleElement.textContent = title || subtitle;
  heading.append(titleElement);

  if (entry.dates) {
    const dates = document.createElement("span");
    dates.className = "resume-entry-date";
    dates.textContent = entry.dates;
    heading.append(dates);
  }
  article.append(heading);

  if (title && subtitle) {
    const subheading = document.createElement("p");
    subheading.className = "resume-entry-subtitle";
    subheading.textContent = subtitle;
    article.append(subheading);
  }

  if (entry.description) {
    const description = document.createElement("p");
    description.className = "resume-entry-description";
    description.textContent = entry.description;
    article.append(description);
  }
  return article;
}

function renderEntries(type) {
  const container = document.querySelector(`#${type}-preview`);
  const fragment = document.createDocumentFragment();
  for (const entry of readEntries(type)) {
    const rendered = renderEntry(type, entry);
    if (rendered) fragment.append(rendered);
  }
  container.replaceChildren(fragment);
  container.closest(".resume-section").classList.toggle("is-empty", !container.childElementCount);
}

function render() {
  const data = new FormData(form);
  updateText("name", data.get("name"), "Your Name");
  updateText("title", data.get("title"), "Professional title");
  for (const key of ["email", "phone", "location", "summary"]) {
    updateText(key, data.get(key));
  }

  const skills = String(data.get("skills") || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  updateText("skills", skills.join("  ·  "));

  for (const type of Object.keys(lists)) renderEntries(type);
  preview.querySelector('[data-resume-section="summary"]').classList.toggle("is-empty", !String(data.get("summary") || "").trim());
  preview.querySelector('[data-resume-section="skills"]').classList.toggle("is-empty", !skills.length);
}

form.addEventListener("input", render);
form.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-entry]");
  if (!removeButton) return;
  removeButton.closest(".entry-card").remove();
  render();
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    addEntry(button.dataset.add);
    render();
    lists[button.dataset.add].lastElementChild.querySelector("input").focus();
  });
});

document.querySelector(".print-button").addEventListener("click", () => window.print());

addEntry("experience");
addEntry("education");
render();
