import { foCollection } from "./foCollection.model";
import { foInstance } from "./foInstance.model";


class foBuffer<T extends foInstance> extends foCollection<T> {

}

export class foPasteBuffer<T extends foInstance> extends foBuffer<T> {
} 