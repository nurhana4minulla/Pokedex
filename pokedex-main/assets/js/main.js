const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const modal = document.getElementById('pokemonModal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalBody = document.getElementById('modalBody');

const maxRecords = 151;
const limit = 12;
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}" data-id="${pokemon.number}" onclick="openPokemonModal(${pokemon.number})">
            <span class="number">#${String(pokemon.number).padStart(3, '0')}</span>
            <img src="${pokemon.photo}" alt="${pokemon.name}">
            <span class="name">${pokemon.name}</span>
            <ol class="types">
                <li class="type ${pokemon.type}">${pokemon.type}</li>
            </ol>
        </li>
    `;
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('');
        pokemonList.innerHTML += newHtml;
    }).catch(error => {
        console.error("Error loading Pokemon items:", error);
    });
}

loadPokemonItens(offset, limit);

if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
        offset += limit;
        const qtdRecordsWithNextPage = offset + limit;

        if (qtdRecordsWithNextPage >= maxRecords) {
            const newLimit = maxRecords - offset;
            if (newLimit > 0) {
                 loadPokemonItens(offset, newLimit);
            }
            loadMoreButton.parentElement.removeChild(loadMoreButton);
        } else {
            loadPokemonItens(offset, limit);
        }
    });
} else {
    console.warn("Load More button not found.");
}

function showModal(pokemonDetail) {
    modalBody.innerHTML = '';

    const primaryType = pokemonDetail.types[0].type.name;

    const modalContentElement = modal.querySelector('.modal-content');
    if (!modalContentElement) {
        console.error("Modal content element not found!");
        return;
    }

    modalContentElement.className = 'modal-content';
    modalContentElement.classList.add(primaryType);

    const typesHtml = pokemonDetail.types.map(typeInfo =>
        `<li class="type ${typeInfo.type.name}">${typeInfo.type.name}</li>`
    ).join('');

    const abilitiesHtml = pokemonDetail.abilities.map(abilityInfo =>
        `<span class="ability">${abilityInfo.ability.name}</span>`
    ).join(', ');

    const modalImage = pokemonDetail.sprites.other['official-artwork']?.front_default
                     || pokemonDetail.sprites.other.dream_world.front_default
                     || pokemonDetail.sprites.front_default
                     || 'assets/images/pokeball_placeholder.png';

    const statsHtml = pokemonDetail.stats.map(statInfo => `
        <div class="stat-row">
            <span class="stat-name">${statInfo.stat.name.replace('-', ' ')}</span>
            <span class="stat-value">${statInfo.base_stat}</span>
            <div class="stat-bar-background">
                <div class="stat-bar" style="width: ${Math.min(statInfo.base_stat, 180) / 1.8}%;"></div>
            </div>
        </div>
    `).join('');

    const content = `
        <div class="modal-header">
             <h2 class="modal-pokemon-name">${pokemonDetail.name}</h2>
             <span class="modal-pokemon-number">#${String(pokemonDetail.id).padStart(3, '0')}</span>
        </div>

        <div class="modal-body-content">
            <div class="modal-image-container">
                 <img src="${modalImage}" alt="${pokemonDetail.name}" onerror="this.src='assets/images/pokeball_placeholder.png';">
            </div>

            <ul class="modal-types">
                ${typesHtml}
            </ul>

            <div class="modal-physical-details">
                 <h4>Physical Attributes</h4>
                 <p><strong>Height:</strong> ${(pokemonDetail.height / 10).toFixed(1)} m</p>
                 <p><strong>Weight:</strong> ${(pokemonDetail.weight / 10).toFixed(1)} kg</p>
            </div>

            <div class="modal-abilities">
                 <h4>Abilities</h4>
                 <p>${abilitiesHtml}</p>
            </div>

            <div class="modal-stats">
                 <h4>Base Stats</h4>
                 ${statsHtml}
            </div>
        </div>
     `;

    modalBody.innerHTML = content;
    modalOverlay.classList.add('active');
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    if (!modalOverlay) return;

    modalOverlay.classList.remove('active');

    setTimeout(() => {
         modalOverlay.style.display = 'none';
    }, 300);
}

function openPokemonModal(pokemonId) {
     if (!pokemonId || !modalOverlay || !modalBody) return;

     modalBody.innerHTML = '<p style="text-align: center; padding: 40px;">Loading details...</p>';
     const modalContentElement = modal.querySelector('.modal-content');
     if (modalContentElement) {
          modalContentElement.className = 'modal-content';
     }
     modalOverlay.classList.add('active');
     modalOverlay.style.display = 'flex';

     pokeApi.getPokemonById(pokemonId)
         .then(showModal)
         .catch(error => {
              console.error("Failed to load Pokemon details for modal:", error);
              modalBody.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Sorry, could not load details. Please try again later.</p>';
         });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});