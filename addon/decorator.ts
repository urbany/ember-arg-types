import isElementDescriptor from './-private/is-element-descriptor';
import throwConsoleError from './-private/throw-console-error';
import Component from '@glimmer/component';
import { runInDebug } from '@ember/debug';
import PropTypes, { Validator } from 'prop-types';
import config from 'ember-get-config';
import { isNone } from '@ember/utils';

const VALUE_UNSET = Symbol('value_unset');

function createGetter<T extends Component>(
  onlyOnce: boolean,
  _target: object,
  key: string,
  descriptor: any,
  validator?: Validator<any>
): PropertyDescriptor {
  const defaultInitializer = descriptor.initializer || descriptor.get || (() => undefined);

  let lastvalue: any = VALUE_UNSET;
  return {
    get(this: T): any {
      if(onlyOnce && lastvalue !== VALUE_UNSET) {
        return lastvalue;
      }
      const argValue = (<any>this.args)[key];
      const returnValue = argValue !== undefined ? argValue : defaultInitializer.call(this);

      runInDebug(() => {
        const throwErrors = config['ember-arg-types']?.throwErrors;
        const shouldThrowErrors = isNone(throwErrors) ? true : throwErrors;
        if (validator) {
          throwConsoleError(() => {
            PropTypes.checkPropTypes({ [key]: validator }, { [key]: returnValue }, 'prop', this.constructor.name);
          }, shouldThrowErrors);
        }
      });
      lastvalue = returnValue;
      return returnValue;
    }
  };
}

export default function arg<T extends Component>(target: T, key: string): any;
export default function arg(typeValidator?: Validator<any>, ...args: any[]): PropertyDecorator;
export default function arg<T extends Component>(...args: any[]): any {
  if (isElementDescriptor(...args)) {
    return createGetter(false, ...(args as [T, string, PropertyDescriptor]));
  }

  const [validator] = args;
  return function argument<T extends Component>(...args: any[]): any {
    return createGetter(false, ...([...args, validator] as [T, string, any, Validator<any>?]));
  };
}

export function argCached<T extends Component>(target: T, key: string): any;
export function argCached(typeValidator?: Validator<any>, ...args: any[]): PropertyDecorator;
export function argCached<T extends Component>(...args: any[]): any {
  if (isElementDescriptor(...args)) {
    return createGetter(true, ...(args as [T, string, PropertyDescriptor]));
  }

  const [validator] = args;
  return function argument<T extends Component>(...args: any[]): any {
    return createGetter(true, ...([...args, validator] as [T, string, any, Validator<any>?]));
  };
}
