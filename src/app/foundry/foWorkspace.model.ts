import { Tools } from './foTools';

import { foDocument } from './shapes/foDocument.model';
import { foStudio } from './solids/foStudio.model';
import { foKnowledge } from './foKnowledge.model';
import { foDictionary } from './foDictionary.model';

import { foLibrary } from './foLibrary.model';
import { foModel } from './foModel.model';
import { foObject, using } from './foObject.model';

import { foFileManager, fileSpec } from './foFileManager';
import { foHydrationManager } from './foHydrationManager';
import { foInstance } from './foInstance.model';

import { ContextDictionary } from './foDictionaries';

import { foCollection } from './foCollection.model';
import { WhereClause } from './foInterface';
import { foController } from './foController';
import { foPage } from './shapes/foPage.model';
import { foStage } from './solids/foStage.model';

export class LibraryDictionary extends foDictionary<foLibrary> {
  public establish = (name: string): foLibrary => {
    this.findItem(name, () => {
      this.addItem(name, new foLibrary({ myName: name }));
    });
    return this.getItem(name);
  }

  constructor(properties?: any, parent?: foObject) {
    super(properties, parent);
  }

  select(
    where: WhereClause<foKnowledge>,
    list?: foCollection<foKnowledge>,
    deep: boolean = true
  ): foCollection<foKnowledge> {
    const result = list ? list : new foCollection<foKnowledge>();

    this.forEachKeyValue((key, value) => {
      if (where(value)) { result.addMember(value); }
      value.select(where, result, deep);
    });

    return result;
  }
}

export class ModelDictionary extends foDictionary<foModel> {
  public establish = (name: string): foModel => {
    this.findItem(name, () => {
      this.addItem(name, new foModel({ myName: name }));
    });
    return this.getItem(name);
  }

  constructor(properties?: any, parent?: foObject) {
    super(properties, parent);
  }

  selectComponent(
    where: WhereClause<foObject>,
    list?: foCollection<foObject>,
    deep: boolean = true
  ): foCollection<foObject> {
    const result = list ? list : new foCollection<foObject>();

    this.forEachKeyValue((key, value) => {
      if (where(value)) { result.addMember(value); }
      value.select(where, result, deep);
    });

    return result;
  }
}

export class foWorkspace extends foKnowledge {
  public filenameExt: string;

  private _library: LibraryDictionary = new LibraryDictionary(
    { myName: 'library' },
    this
  );
  private _stencil: LibraryDictionary = new LibraryDictionary(
    { myName: 'stencil' },
    this
  );

  private _model: ModelDictionary = new ModelDictionary(
    { myName: 'model' },
    this
  );
  private _context: ContextDictionary = new ContextDictionary(
    { myName: 'context' },
    this
  );

  private _document: foDocument = new foDocument({}, [], this);
  private _studio: foStudio = new foStudio({}, [], this);

  private _controller: foDictionary<foController> = new foDictionary<
    foController
  >({ displayName: 'controls' }, this);

  constructor(spec?: any) {
    super(spec);
  }

  //special for workspace
  public reHydrate(json: any) {
    return this;
  }

  //special for workspace
  public deHydrate(context?: any, deep: boolean = true) {
    const data = {
      library: this._library.deHydrate(context, deep),
      stencil: this._stencil.deHydrate(context, deep),
      model: this._model.deHydrate(context, deep),
      context: this._context.deHydrate(context, deep),
      document: this._document.deHydrate(context, deep),
      studio: this._studio.deHydrate(context, deep)
    };

    return data;
  }

  get activePage(): foPage {
    return this._document.currentPage;
  }

  get activeStage(): foStage {
    return this._studio.currentStage;
  }

  select(
    where: WhereClause<foKnowledge>,
    list?: foCollection<foKnowledge>,
    deep: boolean = true
  ): foCollection<foKnowledge> {
    const result = super.select(where, list, deep);

    this.library.select(where, result, deep);

    this.stencil.select(where, result, deep);

    return result;
  }

  get controller() {
    return this._controller;
  }

  get studio() {
    return this._studio;
  }

  get document() {
    return this._document;
  }

  get model() {
    return this._model;
  }

  get context() {
    return this._context;
  }

  get library() {
    return this._library;
  }

  get stencil() {
    return this._stencil;
  }

  public openFile(onComplete?: (item: fileSpec) => void) {
    const manager = new foFileManager();
    manager.userOpenFileDialog(
      result => {
        this.filenameExt = result.filename;
        onComplete && onComplete(result);
      },
      '.json',
      this.myName
    );
  }

  public SaveInstanceAs(
    obj: foInstance,
    name: string,
    ext: string = '.json',
    onComplete?: (item: fileSpec) => void
  ) {
    const manager = new foFileManager();
    const payload = this.deHydrateInstance(obj);

    manager.writeTextFileAsync(payload, name, ext, result => {
      this.filenameExt = result.filename;
      onComplete && onComplete(result);
    });
    return true;
  }

  public SaveFileAs(
    name: string,
    ext: string = '.json',
    onComplete?: (item: fileSpec) => void
  ) {
    const manager = new foFileManager();
    const payload = this.deHydrateWorkspace();

    manager.writeTextFileAsync(payload, name, ext, result => {
      this.filenameExt = result.filename;
      onComplete && onComplete(result);
    });
    return true;
  }

  public autoSaveFile(onComplete?: (item: fileSpec) => void) {
    if (!this.filenameExt) { return false; }

    const filespec = fileSpec.setFilenameExt(this.filenameExt);
    const manager = new foFileManager();
    const payload = this.deHydrateWorkspace();

    manager.writeTextFileAsync(payload, filespec.name, filespec.ext, result => {
      onComplete && onComplete(result);
    });
    return true;
  }

  public clearActivePage() {
    this.activePage.clearPage();
  }

  public deHydrateWorkspace() {
    return using(new foHydrationManager(this), manager => {
      return manager.deHydrate(this);
    });
  }

  public deHydrateInstance(obj: foInstance) {
    return using(new foHydrationManager(this), manager => {
      return manager.deHydrate(obj);
    });
  }

  public reHydratePayload(payload: any) {
    return using(new foHydrationManager(this), manager => {
      const data = Tools.isString(payload) ? JSON.parse(payload) : payload;
      return manager.reHydrate(data);
    });
  }
}

export let globalWorkspace: foWorkspace = new foWorkspace();

Tools['isaWorkspace'] = function(obj) {
  return obj && obj.isInstanceOf(foWorkspace);
};
