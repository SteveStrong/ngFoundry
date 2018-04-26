import { foCollection } from './foCollection.model';
import { foInstance } from './foInstance.model';
import { cPoint2D, cFrame } from './shapes/foGeometry2D';
import { foGlyph2D } from './shapes/foGlyph2D.model';
import { foHandle2D } from './shapes/foHandle2D';

export class foBuffer<T extends foInstance> extends foCollection<T> {}

export class foCopyPasteBuffer extends foBuffer<foInstance> {
  clear(exclude: foInstance = null) {
    this.clearAll();
  }

  addSelection(item: foInstance, clear: boolean = true) {
    clear && this.clear(item);

    if (!this.isMember(item)) {
      this.addMember(item);
    }
  }
}

export class foHandleBuffer extends foBuffer<foHandle2D> {
  findHandle(loc: cPoint2D): foHandle2D {
    for (let i = 0; i < this.length; i++) {
      const handle: foHandle2D = this.getChildAt(i);
      if (handle.hitTest(loc)) {
        return handle;
      }
    }
  }
}

export class foSelectionBuffer extends foBuffer<foGlyph2D> {
  protected _handles: foHandleBuffer = new foHandleBuffer();
  protected lastFound: foGlyph2D;

  findHandle(loc: cPoint2D): foHandle2D {
    return this._handles.findHandle(loc);
  }

  get handles() {
    return this._handles;
  }

  unselect(exclude: foGlyph2D = null) {
    this._handles.clearAll();
    this.forEach(item => {
      item.unSelect(true, exclude);
      item.closeEditor && item.closeEditor();
    });
  }

  clear(exclude: foGlyph2D = null) {
    this.unselect(exclude);
    this.clearAll();
  }

  addSelection(item: foGlyph2D, clear: boolean = true) {
    clear && this.clear(item);

    item.isSelected = true;
    if (!this.isMember(item)) {
      this.addMember(item);
      this._handles.copyMembers(item.handles);
    }
  }

  findSelected() {
    return this.find(item => {
      return item.isSelected;
    });
  }

  sendKeysToShape(e: KeyboardEvent, keys) {
    if (this.lastFound && this.lastFound.isSelected) {
      this.lastFound.sendKeys(e, keys);
    } else {
      const found = this.findSelected();
      if (found && found.sendKeys) {
        found.sendKeys(e, keys);
        this.lastFound = found;
      }
    }
  }
}
