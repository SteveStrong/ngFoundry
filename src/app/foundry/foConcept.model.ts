import { Tools, foNames } from './foTools';
import { PubSub } from './foPubSub';

import { foKnowledge } from './foKnowledge.model';
import { foDictionary } from './foDictionary.model';
import { foAttribute, foViewAttribute } from './foAttribute.model';
import { Action } from './foInterface';

import { foObject } from './foObject.model';
import { foInstance } from './foInstance.model';
import { foNode } from './foNode.model';

import { RuntimeType } from './foRuntimeType';
import { Lifecycle } from './foLifecycle';

export class foSubComponentSpec extends foKnowledge {
  concept: foKnowledge;
  name: string;
  order: number = 0;
  spec: any = {};
}

export class foConcept<T extends foNode> extends foKnowledge {
  private _create = (
    properties?: any,
    subcomponents?: Array<foNode>,
    parent?: foObject
  ): T => {
    return <T>new foNode(properties, subcomponents, parent);
  }

  protected _superclass: Array<foConcept<T>> = new Array<foConcept<T>>();
  protected _subclass: Array<foConcept<T>> = new Array<foConcept<T>>();
  inheritsFrom(...concepts) {
    concepts.forEach(concept => {
      this._superclass.push(concept);
      concept._subclass.push(this);
    });
    return this;
  }

  private _commands: Array<string> = new Array<string>();
  addCommands(...cmds: string[]) {
    this._commands && this._commands.push(...cmds);
    return this;
  }

  get commands(): Array<string> {
    return this._commands;
  }

  private _primitive: string;
  get primitive(): string {
    return this._primitive;
  }
  set primitive(value: string) {
    this._primitive = value;
  }

  private _specification: any;
  get specification(): any {
    return this._specification;
  }
  set specification(value: any) {
    this._specification = value;
  }

  specReadWriteKeys(): string[] {
    const keys: string[] = Tools.extractReadWriteKeys(this._specification);
    return keys || [];
  }

  private _attributes: foDictionary<foAttribute>;
  get attributes() {
    if (!this._attributes) {
      this._attributes = new foDictionary<foAttribute>({
        myName: 'attributes'
      });
    }
    return this._attributes;
  }
  set attributes(value: any) {
    this._attributes = value;
  }

  private _structures: foDictionary<foSubComponentSpec>;
  private addSubComponentSpec(
    name: string,
    concept: foKnowledge,
    properties?: any
  ): foSubComponentSpec {
    if (!this._structures) {
      this._structures = new foDictionary<foSubComponentSpec>();
    }
    const subSpec = new foSubComponentSpec({
      name,
      concept,
      order: this._structures.count + 1,
      spec: properties || {}
    });
    this._structures.addItem(name, subSpec);
    return subSpec;
  }
  subComponent(name: string, spec?: any | foKnowledge, properties?: any) {
    const structure =
      spec instanceof foKnowledge ? spec : new foConcept(spec, this);
    this.addSubComponentSpec(name, structure, properties);
    return this;
  }
  get structures(): Array<foSubComponentSpec> {
    if (this._structures) {
      return this._structures.members.sort((a, b) => a.order - b.order);
    }
  }

  private _projections: foDictionary<foProjection<T>>;
  get projections() {
    if (!this._projections) {
      this._projections = new foDictionary<foProjection<T>>({
        myName: 'projections'
      });
    }
    return this._projections;
  }
  set projections(value: any) {
    this._projections = value;
  }

  private _onCreation: (obj) => void;

  constructor(properties?: any, parent?: foKnowledge) {
    super(properties, parent);
  }

  get nameSpace(): string {
    return '';
  }

  get classAndNamespace(): string {
    if (!Tools.matches(this.myName, foNames.UNKNOWN)) {
      const name = this.nameSpace;
      if (name) {
        return `${name}::${this.myName}`;
      }
      return this.myName;
    }
  }

  definePrimitive(type: { new (p?: any, s?: Array<T>, r?: T): T }) {
    RuntimeType.define(type);
    this.primitive = type.name;
    this._create = (properties?: any, subcomponents?: Array<T>, parent?: T) => {
      return new type(properties, subcomponents, parent);
    };
    return this;
  }

  usingRuntimeType(type: string, action: Action<foKnowledge>) {
    const found = RuntimeType.find(type);
    const tempHold = this._create;
    this._create = (properties?: any, subcomponents?: Array<T>, parent?: T) => {
      return new found(properties, subcomponents, parent);
    };
    action(this);
    this._create = tempHold;
    return this;
  }

  mixin(obj: any) {
    Tools.mixin(this.specification, obj);
    return this;
  }

  establishAttribute(key: string, spec?: any) {
    let attribute = this.attributes.getItem(key);
    if (!attribute) {
      attribute = new foAttribute(spec, this);
      attribute = this.attributes.addItem(key, attribute);
      attribute.myName = key;

      PubSub.Pub('attribute', ['added', this, attribute]);
    }
    return attribute;
  }

  establishProjection(key: string, spec?: any) {
    let projection = this.projections.getItem(key);
    if (!projection) {
      projection = new foProjection(this, spec);
      this.projections.addItem(key, projection);
      projection.myName = key;
    }
    return projection;
  }

  get debug() {
    const result = {
      base: this,
      specification: this._specification,
      primitive: this._primitive,
      attributes: this._attributes,
      projections: this._projections
    };
    return Tools.stringify(result);
  }

  protected toJson(): any {
    return Tools.mixin(super.toJson(), {
      primitive: this.primitive,
      specification: this._specification,
      attributes: Tools.asArray(this.attributes.asJson),
      projections: Tools.asArray(this.projections.asJson)
    });
  }

  extractReadWriteKeys(target: any, spec?: any) {
    const result = spec || {};
    this.specReadWriteKeys().forEach(key => {
      result[key] = target[key];
    });
    return result;
  }

  makeComponent(parent?: any, properties?: any, onComplete?: Action<any>): any {
    const spec = Tools.union(this.specification, properties);

    const result = this.newInstance(spec, [], parent) as T;
    if (result instanceof foInstance) {
      result.setCreatedFrom(this);
    }
    parent && parent.addSubcomponent(result);

    result && onComplete && onComplete(result);
    return result;
  }

  //newInstance(properties?: any, subcomponents?: Array<T>, parent?: T): T {
  newInstance(properties?: any, subcomponents?: any, parent?: any): T {
    const spec = Tools.union(this.specification, properties);
    const result = this._create(spec, subcomponents, parent) as T;

    if (result instanceof foInstance) {
      result.setCreatedFrom(this);
    }
    result.myClass = this.classAndNamespace;

    result.initialize();
    this._onCreation && this._onCreation(result);
    Lifecycle.created(result, this);

    this.structures &&
      this.structures.forEach(item => {
        const concept = item.concept;
        concept.makeComponent(result, item.spec, child => {
          child.defaultName(item.name);
        });
      });

    return result;
  }

  onCreation(func: (obj) => void) {
    this._onCreation = func;
    return this;
  }
}

RuntimeType.knowledge(foConcept);

export class foProjection<T extends foNode> extends foConcept<T> {
  private _mySource: foConcept<T> = undefined;

  constructor(source: foConcept<T>, properties?: any) {
    super(properties);
    this._mySource = source;

    PubSub.Sub('attribute', (action, obj, attribute) => {
      if (this._mySource === obj) {
        // let view = this.establishViewAttribute(attribute)
      }
    });
  }

  establishViewAttribute(attribute: foAttribute, spec: any = undefined) {
    const attributes = this.attributes;
    const key = attribute.myName;
    let view = <foViewAttribute>attributes.getItem(key);
    if (!view) {
      view = new foViewAttribute(attribute, spec);
      this.attributes.addItem(key, view);
      view.myName = key;
    }
    return view;
  }
}

RuntimeType.knowledge(foProjection);
