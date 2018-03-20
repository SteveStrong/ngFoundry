import { Tools } from './foTools'
import { PubSub } from './foPubSub'
import { foInstance } from './foInstance.model'

// ES2015+  https://www.npmjs.com/package/savery
import savery from 'savery';

// Feature detect + local reference
export let clientStorage = (function () {
    let uid = (new Date()).toISOString();
    try {
        localStorage.setItem(uid, uid);
        let result = localStorage.getItem(uid) == uid;
        localStorage.removeItem(uid);
        return result && localStorage;
    } catch (exception) { }
}());

export class fileSpec {
    payload: string;
    name: string;
    ext: string;

    constructor(payload: string, name: string, ext: string) {
        this.payload = payload;
        this.name = name;
        this.ext = ext;
    }
    
    get filename() {
        return `${this.name}${this.ext}`;
    }

    static setFilenameExt(filenameExt:string, defaultExt?:string){
        let list = filenameExt.split('.');
        let name:string;
        let ext:string;

        if ( list.length == 1){
            name = filenameExt;
            ext = defaultExt;
        } else {
            ext = list[list.length-1];
            name = filenameExt.replace(ext,'');
        }
        return new fileSpec('', name, ext)
    }
}

export class foFileManager {
    isTesting: boolean = false;
    files: any = {}

    constructor(test: boolean = false) {
        this.isTesting = test;
    }

    private writeBlobFile(blob, filenameExt: string, onSuccess?, onFail?) {
        savery.save(blob, filenameExt)
            .then(obj => {
                onSuccess && onSuccess();
            })
            .catch(obj => {
                onFail && onFail(obj.error);
            });
    };

    private readBlobFile(file, onComplete: (item: string) => void) {
        let reader = new FileReader();
        reader.onload = (evt) => {
            let payload = evt.target['result'];
            if (onComplete) {
                onComplete(payload);
            }
        }
        reader.readAsText(file);
    };

    private writeBlobLocal(blob, filenameExt: string, onSuccess?, onFail?) {
        this.files[filenameExt] = blob;
        onSuccess && onSuccess();
    };

    private readBlobLocal(filenameExt: string, onSuccess?: (item: string) => void, onFail?) {
        let reader = new FileReader();
        let blob = this.files[filenameExt];

        if (blob) {
            reader.readAsText(blob)
            reader.onload = (evt) => {
                let result = evt.target['result'];
                onSuccess && onSuccess(result);
            }
        } else {
            onFail && onFail();
        }
    };

    writeTextAsBlob(payload, name: string, ext: string = '.json', onSuccess?: (item: string) => void) {
        let filenameExt = `${name}${ext}`;
        let data = Tools.isString(payload) ? payload : JSON.stringify(payload, undefined, 3)
        let blob = new Blob([data], { type: "text/plain;charset=utf-8" });
        if (this.isTesting) {
            this.writeBlobLocal(blob, filenameExt, onSuccess);
        } else {
            this.writeBlobFile(blob, filenameExt, onSuccess);
        }
    };

    readTextAsBlob(name: string | File, ext: string = '.json', onSuccess?) {
        let filenameExt = `${name}${ext}`;
        if (this.isTesting) {
            this.readBlobLocal(filenameExt, onSuccess);
        } else {
            this.readBlobFile(name, onSuccess);
        }
    };

    rehydrationTest(instance: foInstance, deep: boolean = true, done: (obj: any) => void) {
        let source = instance.createdFrom();
        let body = instance.deHydrate();

        let data = JSON.stringify(body)
        let json = JSON.parse(data);
        let result = source.makeComponent(undefined, json);
        done(result)

        return instance.isEqualTo(result, deep)
    }

    integretyTest(instance: foInstance, deep: boolean = true, done: (obj: any) => void) {
        this.isTesting = true;
        let ext = '.json'
        let fileName = instance.myGuid;

        let source = instance.createdFrom();
        let body = instance.deHydrate();
        let data = JSON.stringify(body)

        this.writeTextAsBlob(data, fileName, ext, () => {
            this.readTextAsBlob(fileName, ext, item => {
                let json = JSON.parse(item);
                let result = source.makeComponent(undefined, json);
                done(result)
            })
        });
    }

    writeTextFileAsync(payload, name, ext, onComplete: (item: fileSpec) => void) {
        this.writeTextAsBlob(payload, name, ext);
        let result = new fileSpec(payload, name, ext)
        onComplete && onComplete(result)

        PubSub.Pub('textFileSaved', [result]);
    };

    readTextFileAsync(file, ext, onComplete: (item: fileSpec) => void) {
        this.readTextAsBlob(file, ext, (payload) => {

            let filename = file.name;
            let name = filename.replace(ext, '');

            let result = new fileSpec(payload, name, ext)

            onComplete && onComplete(result)
            PubSub.Pub('textFileDropped', [result]);
        })
    };

    readImageFileAsync(file, ext, onComplete: (item: fileSpec) => void) {
        let reader = new FileReader();
        reader.onload = (evt) => {
            let filename = file.name;
            let name = filename.replace(ext, '');
            let payload = evt.target['result'];
            let result = new fileSpec(payload, name, ext)
            onComplete && onComplete(result)
            PubSub.Pub('imageFileDropped', [result]);
        }
        reader.readAsDataURL(file);
    }


    userOpenFileDialog(onComplete: (item: fileSpec) => void, defaultExt: string, defaultValue: string) {

        //http://stackoverflow.com/questions/181214/file-input-accept-attribute-is-it-useful
        //accept='image/*|audio/*|video/*'
        let accept = defaultExt || '.knt,.csv';

        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        fileSelector.setAttribute('accept', accept);
        fileSelector.setAttribute('value', defaultValue);
        fileSelector.setAttribute('style', 'visibility: hidden; width: 0px; height: 0px');
        //fileSelector.setAttribute('multiple', 'multiple');
        document.body.appendChild(fileSelector);

        fileSelector.onchange = (event) => {
            let extensionExtract = /\.[0-9a-z]+$/i;

            let files = fileSelector.files;
            let count = files.length;
            let file = count > 0 && files[0];
            let extension = file ? file.name.match(extensionExtract) : [''];
            let ext = extension[0];
            document.body.removeChild(fileSelector);
            if (!file) {

            }
            else if (file.type.startsWith('image')) {
                this.readImageFileAsync(file, ext, onComplete);
            }
            else if (
                Tools.matches(ext, '.knt') ||
                Tools.matches(ext, '.csv') ||
                Tools.matches(ext, '.json') ||
                Tools.matches(ext, '.txt')) {
                this.readTextFileAsync(file, ext, onComplete);
            }
        }

        fileSelector.click && fileSelector.click();
    }
}

