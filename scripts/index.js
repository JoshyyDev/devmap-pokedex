const DOMCardsReferences = document.querySelectorAll('.card');
const DOMButtonsReferenes = document.querySelectorAll('.pokemon-select');

class PokemonStorage {
  constructor() {}

  key = 'pokemon_storage_devmap';

  set(data, key = this.key) {
    const stringJson = this._stringfy(data);

    localStorage.setItem(key, stringJson);
  }

  get(key = this.key) {
    const data = localStorage.getItem(key);

    return this._parse(data);
  }

  _stringfy(object) {
    return JSON.stringify(object);
  }

  _parse(json) {
    return JSON.parse(json);
  }
}

class Pokemon {
  IDKey = 'pokemonCardId';
  storageKey = 'pokemon_storage_devmap'; // dataset key

  /** @param storage {PokemonStorage} */
  constructor(DOMCardsElements, DOMButtonElements, storage) {
    if (!(storage instanceof PokemonStorage))
      throw new Error('Invalid Pokemon storage!');

    this.storage = storage;

    this.cardElements = [...DOMCardsElements];
    this.buttonElements = [...DOMButtonElements];
  }

  /** @private _findElementByDatasetKey */
  _getDatasetValue(element, key = 'id') {
    return element.dataset[key];
  }

  _containsClassName(element, className) {
    return element.classList.contains(className);
  }

  _setClassName(element, className) {
    element.classList.add(className);
  }

  _removeAllClassNames(elements, className) {
    for (const element of elements) {
      const hasClassName = this._containsClassName(element, className);

      hasClassName ? element.classList.remove(className) : null;
    }
  }

  /** @param elements {Array<HTMLElement>}  */
  _findIndexByDataset(elements, key, expected) {
    const index = elements.findIndex((element) => {
      const value = this._getDatasetValue(element, key);

      return Number(value) === expected;
    });

    return index;
  }

  /** wrapper  */
  setClassNameAndRemoveAll(options = {}) {
    const { elements, currentOrIndex, className = 'checked' } = options;

    this._removeAllClassNames(elements, className);

    const is =
      typeof currentOrIndex === 'number' && Number.isInteger(currentOrIndex);

    const element = is ? elements[currentOrIndex] : currentOrIndex;

    this._setClassName(element, className);
  }

  alterClassNames({ buttonOrIndex, className: buttonClassName }, second) {
    const { cardOrIndex, className: cardClassName } = second;

    const cards = this.cardElements;
    const buttons = this.buttonElements;

    this.setClassNameAndRemoveAll({
      elements: buttons,
      currentOrIndex: buttonOrIndex,
      className: buttonClassName,
    });

    this.setClassNameAndRemoveAll({
      elements: cards,
      currentOrIndex: cardOrIndex,
      className: cardClassName,
    });
  }

  handle(event) {
    const { currentTarget: button } = event;

    const cards = this.cardElements;

    /** example: 1, 2, 3...  */
    const refId = Number(button.dataset.id);

    const index = this._findIndexByDataset(cards, this.IDKey, refId);

    this.alterClassNames(
      { buttonOrIndex: button, className: 'checked' },
      { cardOrIndex: index, className: 'visible' }
    );

    /** @TODO save selected pokemon  */
    this.storage.set({ cardAndButtonArrayIndex: index }, this.storageKey);
  }

  load() {
    const storageItem = this.storage.get(this.storageKey) || {};

    const { cardAndButtonArrayIndex: index } = Object.assign(
      { cardAndButtonArrayIndex: 0 },
      { ...storageItem }
    );

    this.alterClassNames(
      { buttonOrIndex: index, className: 'checked' },
      { cardOrIndex: index, className: 'visible' }
    );
  }
}

/** Events  */
class HandleEvent {
  static ButtonHandle(DOMHTMLButtonReference, handle) {
    DOMHTMLButtonReference.addEventListener('click', (event) => handle(event));
  }
}

window.addEventListener('load', () => {
  const storage = new PokemonStorage();
  const pokemon = new Pokemon(DOMCardsReferences, DOMButtonsReferenes, storage);

  // Load localStorage data
  pokemon.load();

  DOMButtonsReferenes.forEach((button) => {
    HandleEvent.ButtonHandle(button, (e) => pokemon.handle(e));
  });
});
