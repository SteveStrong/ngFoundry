import { Tools } from './foTools'
import { PubSub } from './foPubSub'

// ES2015+  https://www.npmjs.com/package/savery
import savery from 'savery';

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

    private readBlobFile(file, onComplete) {
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

    private readBlobLocal(filenameExt: string, onSuccess?, onFail?) {
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

    writeTextAsBlob(payload, name: string, ext: string = '.txt', onSuccess?) {
        let filenameExt = `${name}${ext}`;
        let blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        if (this.isTesting) {
            this.writeBlobLocal(blob, filenameExt, onSuccess);
        } else {
            this.writeBlobFile(blob, filenameExt, onSuccess);
        }
    };

    readTextAsBlob(name: string|File, ext: string = '.txt', onSuccess?) {
        let filenameExt = `${name}${ext}`;
        if (this.isTesting) {
            this.readBlobLocal(filenameExt, onSuccess);
        } else {
            this.readBlobFile(name, onSuccess);
        }
    };

    writeTextFileAsync(payload, name, ext, onComplete) {
        this.writeTextAsBlob(payload, name, ext);
        if (onComplete) {
            onComplete(payload, name, ext)
        }
        PubSub.Pub('textFileSaved', [payload, name, ext]);
    };

    readTextFileAsync(file, ext, onComplete) {
        this.readTextAsBlob(file, ext, (payload) => {

            let filename = file.name;
            let name = filename.replace(ext, '');
            if (onComplete) {
                onComplete(payload, name, ext);
            }
            PubSub.Pub('textFileDropped', [payload, name, ext]);
        })
    };

    readImageFileAsync(file, ext, onComplete) {
        let reader = new FileReader();
        reader.onload = (evt) => {
            let filename = file.name;
            let name = filename.replace(ext, '');
            let payload = evt.target['result'];
            if (onComplete) {
                onComplete(payload, name, ext);
            }
            PubSub.Pub('imageFileDropped', [payload, name, ext]);
        }
        reader.readAsDataURL(file);
    }


    userOpenFileDialog(onComplete, defaultExt: string, defaultValue: string) {

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

