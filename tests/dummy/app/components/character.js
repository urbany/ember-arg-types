import Component from '@glimmer/component';
import { arg } from 'ember-arg-types';
import { func, number, string } from 'prop-types';
import { guidFor } from '@ember/object/internals';

export default class CharacterComponent extends Component {
  @arg(string)
  get id() {
    return guidFor(this);
  }

  @arg(string.isRequired)
  name;

  @arg
  title = 'hero of time';

  @arg(number)
  hearts = 12;

  @arg(number)
  level;

  @arg(func)
  onClick = () => null;
}