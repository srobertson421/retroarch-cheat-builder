import Observable from 'https://sean-cdn.netlify.app/js/observable/@0.0.1/observable.min.js';

const cheatsFormEl = document.getElementById('cheats-form');
const cheatsRenderEl = document.getElementById('cheats-render');
const cheatInputsTemplate = document.getElementById('cheat-inputs');
const gameTitleEl = document.getElementById('game-title');

const newCheatSchema = {
  description: '',
  code: '',
  enable: false
}

let gameTitle = '';

const cheats = new Observable([]);

function addCheat() {
  cheats.value = [ ...cheats.value, { ...newCheatSchema } ];
}

function removeCheat(cheatIndex) {
  cheats.value = [
    ...cheats.value.slice(0, cheatIndex),
    ...cheats.value.slice(cheatIndex + 1)
  ];
}

function changeCheatDescription(newValue, cheatIndex) {
  const cheat = cheats.value[cheatIndex];
  const tempCheat = {
    ...cheat,
    description: newValue
  }

  cheats.value = [
    ...cheats.value.slice(0, cheatIndex),
    tempCheat,
    ...cheats.value.slice(cheatIndex + 1)
  ];
}

function changeCheatEnable(newValue, cheatIndex) {
  const cheat = cheats.value[cheatIndex];

  const tempCheat = {
    ...cheat,
    enable: newValue
  }

  cheats.value = [
    ...cheats.value.slice(0, cheatIndex),
    tempCheat,
    ...cheats.value.slice(cheatIndex + 1)
  ];
}

function changeCheatCode(newValue, cheatIndex) {
  const cheat = cheats.value[cheatIndex];
  const parsedValue = newValue.trim().replaceAll(' ', '+').replaceAll('\n', '+');

  const tempCheat = {
    ...cheat,
    code: parsedValue
  }

  cheats.value = [
    ...cheats.value.slice(0, cheatIndex),
    tempCheat,
    ...cheats.value.slice(cheatIndex + 1)
  ];
}

function buildCheatInputs(newCheat, cheatIndex) {
  const templateClone = cheatInputsTemplate.content.cloneNode(true);
  templateClone.firstElementChild.setAttribute('id', `cheat_${cheatIndex}`);
  templateClone.querySelector('input[name="description"]').value = newCheat.description;
  templateClone.querySelector('textarea').value = newCheat.code;
  templateClone.querySelector('input[type="checkbox"]').checked = newCheat.enable;
  return templateClone;
}

function renderCheats(newCheats) {
  cheatsRenderEl.innerHTML = '';
  newCheats.forEach((cheat, index) => {
    cheatsRenderEl.appendChild(buildCheatInputs(cheat, index));
  });
}

// Render all this crap
cheats.subscribe(newCheats => {
  renderCheats(newCheats);
});

cheatsFormEl.addEventListener('click', e => {
  const { target } = e;

  if(target.id === 'add-cheat-btn') {
    addCheat();
  }

  if(target.classList.contains('delete-cheat-btn')) {
    const parent = target.parentElement.parentElement;

    if(parent.getAttribute('id').includes('cheat_')) {
      const cheatIndex = parseInt(parent.getAttribute('id').split('_')[1]);
      removeCheat(cheatIndex);
    }
  }
});

cheatsFormEl.addEventListener('change', e => {
  const realTarget = e.path[0];

  const parent = realTarget.parentElement.parentElement;
  const parentId = parent.getAttribute('id');
  
  if(realTarget.tagName.toLowerCase() === 'input') {
    if(parentId.includes('cheat_')) {
      const cheatIndex = parseInt(parentId.split('_')[1]);

      if(realTarget.getAttribute('type').toLowerCase() === 'text') {
        return changeCheatDescription(realTarget.value, cheatIndex);
      }
      
      if(realTarget.getAttribute('type').toLowerCase() === 'checkbox') {
        return changeCheatEnable(realTarget.checked, cheatIndex);
      }
    }
  } else if(realTarget.tagName.toLowerCase() === 'textarea') {
    if(parentId.includes('cheat_')) {
      const cheatIndex = parseInt(parentId.split('_')[1]);

      return changeCheatCode(realTarget.value, cheatIndex);
    }
  }
});

gameTitleEl.addEventListener('change', e => {
  e.preventDefault();
  e.stopPropagation();

  gameTitle = e.target.value
});

function createCheatFileContent() {
  const numOfCheats = cheats.value.length;
  let content = `cheats = ${numOfCheats}`;
  cheats.value.forEach((cheat, index) => {
    const cheatContent = `

cheat${index}_desc = "${cheat.description}"
cheat${index}_code = ${cheat.code}
cheat${index}_enable = ${cheat.enable}`;

    content += cheatContent;
  });

  const tempLink = document.createElement('a');
  tempLink.download = `${gameTitle.replaceAll(' ', '_').toLowerCase()}.cht`;
  const blob = new Blob([content], {type: 'text/plain'});
  tempLink.href = window.URL.createObjectURL(blob);
  tempLink.click();
}

cheatsFormEl.addEventListener('submit', e => {
  e.preventDefault();

  const fileContent = createCheatFileContent();
});
