import { foCollection } from "./foCollection.model";
import { foInstance } from "./foInstance.model";
import { cPoint2D, cFrame } from './shapes/foGeometry2D';
import { foGlyph2D } from './shapes/foGlyph2D.model'
import { foHandle2D } from './shapes/foHandle2D';

class foBuffer<T extends foInstance> extends foCollection<T> {

}

export class foCopyPasteBuffer<T extends foInstance> extends foBuffer<T> {
} 



export class foHandleBuffer extends foBuffer<foHandle2D> {

    findHandle(loc: cPoint2D): foHandle2D {
        for (var i: number = 0; i < this.length; i++) {
            let handle: foHandle2D = this.getChildAt(i);
            if (handle.hitTest(loc)) {
                return handle;
            }
        }
    }

}

export class foSelectionBuffer extends foBuffer<foGlyph2D> {
    protected handles:foHandleBuffer = new foHandleBuffer();

    clear(exclude: foGlyph2D = null) {
        this.handles.clearAll()
        this.forEach( item => {
            item.unSelect(true, exclude);
            item.closeEditor && item.closeEditor()
        });
        this.clearAll();
    }

    addSelection(item:foGlyph2D, clear:boolean=true) {
        clear && this.clear(item);

        item.isSelected = true;
        if ( !this.isMember(item) ) {
            this.addMember(item);
            this.handles.copyMembers(item.handles);
        }

    }
}

