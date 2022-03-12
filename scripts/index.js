const cards = document.querySelectorAll('.card');
const buttons = document.querySelectorAll('.pokemon-select');

const CSS_CLASS_NAMES = {
  button: 'checked',
  card: 'visible',
};

class PokemonStorage {
  _key_prefix = 'pokemon_storage_devmap:';

  constructor() {}

  set(key, data) {
    const storageKey = this._key_prefix + key; // devmap:{key}

    const parsed = this.stringfy(data);

    localStorage.setItem(storageKey, parsed);

    return { data, parsed };
  }

  get(key) {
    const storageKey = this._key_prefix + key;

    const data = localStorage.getItem(storageKey);

    return this.parse(data);
  }

  stringfy(object) {
    return JSON.stringify(object);
  }

  parse(json) {
    return JSON.parse(json);
  }
}

class Pokemon {
  datasetIdKey = 'pokemonCardId';
  storageKey = 'select_card'; // dataset key

  /** @param storage {PokemonStorage} */
  constructor(DOMCardElements, DOMButtonElements, storage) {
    this.cards = [...DOMCardElements];
    this.buttons = [...DOMButtonElements];

    this.storage = storage;
  }

  /** @param element {HTMLElement} */
  buttonDisabled(element, elementType = 'button') {
    const hasNotAttributeInElement = !element.hasAttribute('disabled');

    const isValidHTMLElement = element.tagName === elementType.toUpperCase();

    if (hasNotAttributeInElement && isValidHTMLElement) {
      element.setAttribute('disabled', 'true');
    }
  }

  /** @param element {HTMLElement} */
  buttonEnabled(element) {
    const isButtonElement = element.tagName === 'button'.toUpperCase();

    if (isButtonElement) element.removeAttribute('disabled');
  }

  _getDatasetValue(element, key = 'id') {
    return element.dataset[key];
  }

  _containsClassName(element, className) {
    return element.classList.contains(className);
  }

  _setClassName(element, className) {
    element.classList.add(className);
  }

  _removeAllClassNames(elements, className, enableButton = true) {
    for (const element of elements) {
      if (enableButton) this.buttonEnabled(element);

      const hasClassName = this._containsClassName(element, className);

      if (hasClassName) {
        element.classList.remove(className);
      }
    }
  }

  /** @param elements {Array<HTMLElement>}  */
  _findIndexDataset(elements, key, expected) {
    return elements.findIndex(
      (element) =>
        Number(this._getDatasetValue(element, key)) === Number(expected)
    );
  }

  /** wrapper  */
  setElementState({ elements, current, className }) {
    this._removeAllClassNames(elements, className);

    this._setClassName(current, className); // DOM effect

    /** @TODO disable current button  */
    this.buttonDisabled(current);
  }

  /**
   * @param state {{
   *  button: { elements, current, className },
   *  card: { elements, current, className }
   *  }}
   * */
  setState(state) {
    const stateKeys = Object.keys(state);

    const keysLessThanOne = stateKeys.length < 1;

    if (keysLessThanOne) return null;

    for (const key of stateKeys) {
      const { elements, current, className } = state[key];

      this.setElementState({ elements, current, className });
    }
  }

  /**
   * @param options {{
   *   button: number | HTMLElement,
   *   card: number | HTMLElement
   * }}
   **/
  mekeState(options) {
    const { button, card } = options;

    const [buttonIsInt, cardIsInt] = Object.keys(options).map((key) => {
      return typeof options[key] === 'number' && Number.isInteger(options[key]);
    });

    const currentButtonElement = buttonIsInt ? this.buttons[button] : button;

    const currentCardElement = cardIsInt ? this.cards[card] : card;

    const state = {
      button: {
        elements: this.buttons,
        current: currentButtonElement,
        className: CSS_CLASS_NAMES.button,
      },

      card: {
        elements: this.cards,
        current: currentCardElement,
        className: CSS_CLASS_NAMES.card,
      },
    };

    console.debug({ state, boolean: { buttonIsInt, cardIsInt } });

    return state;
  }

  handle(event) {
    const { currentTarget: button } = event;

    const id = button.dataset.id;

    /** Card index  */
    const cardIndex = this._findIndexDataset(this.cards, this.datasetIdKey, id);

    const state = this.mekeState({ button, card: cardIndex });

    this.setState({
      ...state,
    });

    /** @TODO save selected pokemon  */
    const pokemonStorageKey = this.storageKey;

    this.storage.set(pokemonStorageKey, { index: cardIndex });
  }

  load() {
    const storageItem = this.storage.get(this.storageKey) || {};

    const { index } = Object.assign({ index: 0 }, storageItem);

    const state = this.mekeState({ button: index, card: index });

    this.setState({
      ...state,
    });
  }
}

window.addEventListener('load', () => {
  const storage = new PokemonStorage();

  const pokemon = new Pokemon(cards, buttons, storage);

  // Load localStorage data
  pokemon.load();

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => pokemon.handle(event));
  });
});
